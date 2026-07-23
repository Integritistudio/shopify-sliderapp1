import express from "express"
import shopify from "../shopify.js"
import { extractShop } from "../middleware/auth.js"

const router = express.Router()

router.use(extractShop)

const COLLECTIONS_QUERY = `
  query listCollections($first: Int!) {
    collections(first: $first, sortKey: TITLE) {
      edges {
        node {
          id
          title
          handle
          productsCount {
            count
          }
          image {
            url
            altText
          }
        }
      }
    }
  }
`

const COLLECTION_PRODUCTS_QUERY = `
  query collectionProducts($id: ID!, $first: Int!) {
    collection(id: $id) {
      id
      title
      handle
      products(first: $first) {
        edges {
          node {
            id
            title
            handle
            featuredImage {
              url
              altText
            }
            priceRangeV2 {
              minVariantPrice {
                amount
                currencyCode
              }
            }
            compareAtPriceRange {
              minVariantCompareAtPrice {
                amount
                currencyCode
              }
            }
            variants(first: 25) {
              nodes {
                id
                availableForSale
              }
            }
          }
        }
      }
    }
  }
`

const PRODUCTS_BY_IDS_QUERY = `
  query productsByIds($ids: [ID!]!) {
    nodes(ids: $ids) {
      ... on Product {
        id
        title
        handle
        featuredImage {
          url
          altText
        }
        priceRangeV2 {
          minVariantPrice {
            amount
            currencyCode
          }
        }
        compareAtPriceRange {
          minVariantCompareAtPrice {
            amount
            currencyCode
          }
        }
        variants(first: 25) {
          nodes {
            id
            availableForSale
          }
        }
      }
    }
  }
`

function formatMoney(amount, currencyCode = "USD") {
  const value = Number(amount)
  if (!Number.isFinite(value)) return ""
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currencyCode || "USD",
      maximumFractionDigits: 2,
    }).format(value)
  } catch {
    return `$${value.toFixed(2)}`
  }
}

function variantNumericId(gid) {
  if (!gid) return null
  const match = String(gid).match(/ProductVariant\/(\d+)/)
  return match ? match[1] : null
}

function mapProduct(node) {
  const price = node.priceRangeV2?.minVariantPrice
  const compare = node.compareAtPriceRange?.minVariantCompareAtPrice
  const variants = node.variants?.nodes || []
  const preferred =
    variants.find((variant) => variant?.availableForSale) || variants[0] || null
  const availableForSale =
    variants.length > 0 ? variants.some((variant) => variant?.availableForSale) : true
  return {
    id: node.id,
    title: node.title,
    handle: node.handle,
    imageUrl: node.featuredImage?.url || "",
    imageAlt: node.featuredImage?.altText || node.title || "",
    price: price ? formatMoney(price.amount, price.currencyCode) : "",
    compareAtPrice: compare ? formatMoney(compare.amount, compare.currencyCode) : "",
    url: `/products/${node.handle}`,
    variantId: variantNumericId(preferred?.id),
    availableForSale,
  }
}

function normalizeCollectionGid(id) {
  if (!id) return null
  const value = String(id)
  if (value.startsWith("gid://")) return value
  if (/^\d+$/.test(value)) return `gid://shopify/Collection/${value}`
  return value
}

function normalizeProductGid(id) {
  if (!id) return null
  const value = String(id)
  if (value.startsWith("gid://")) return value
  if (/^\d+$/.test(value)) return `gid://shopify/Product/${value}`
  return value
}

export async function fetchProductsByIds(session, productIds = []) {
  const ids = [...new Set((productIds || []).map(normalizeProductGid).filter(Boolean))].slice(0, 50)
  if (!ids.length) return []

  const client = new shopify.api.clients.Graphql({ session })
  const response = await client.request(PRODUCTS_BY_IDS_QUERY, {
    variables: { ids },
  })
  return (response.data?.nodes || []).filter(Boolean).map(mapProduct)
}

export async function fetchCollectionProducts(session, collectionId, limit = 8) {
  const client = new shopify.api.clients.Graphql({ session })
  const gid = normalizeCollectionGid(collectionId)
  const response = await client.request(COLLECTION_PRODUCTS_QUERY, {
    variables: {
      id: gid,
      first: Math.min(Math.max(Number(limit) || 8, 1), 50),
    },
  })
  const collection = response.data?.collection
  if (!collection) {
    const err = new Error("Collection not found")
    err.status = 404
    throw err
  }
  const products = (collection.products?.edges || []).map((edge) => mapProduct(edge.node))
  return {
    id: collection.id,
    title: collection.title,
    handle: collection.handle,
    products,
  }
}

router.get("/collections", async (req, res) => {
  try {
    const session = res.locals.shopify.session
    const client = new shopify.api.clients.Graphql({ session })
    const response = await client.request(COLLECTIONS_QUERY, {
      variables: { first: 50 },
    })
    const collections = (response.data?.collections?.edges || []).map(({ node }) => ({
      id: node.id,
      title: node.title,
      handle: node.handle,
      productsCount:
        typeof node.productsCount === "number"
          ? node.productsCount
          : node.productsCount?.count ?? 0,
      imageUrl: node.image?.url || "",
    }))
    res.json(collections)
  } catch (error) {
    console.error("Error listing collections:", error)
    const message = error?.message || "Failed to list collections"
    const needsScope =
      /access|scope|unauthorized|forbidden/i.test(message) ||
      error?.response?.status === 403
    res.status(needsScope ? 403 : 500).json({
      error: needsScope
        ? "Product access required. Re-approve app scopes (read_products)."
        : "Failed to list collections",
    })
  }
})

router.get("/collections/:id/products", async (req, res) => {
  try {
    const session = res.locals.shopify.session
    const limit = Number(req.query.limit) || 8
    const data = await fetchCollectionProducts(session, req.params.id, limit)
    res.json(data)
  } catch (error) {
    console.error("Error fetching collection products:", error)
    res.status(error.status || 500).json({
      error: error.message || "Failed to fetch products",
    })
  }
})

router.post("/products/resolve", async (req, res) => {
  try {
    const session = res.locals.shopify.session
    const ids = req.body?.ids || []
    const products = await fetchProductsByIds(session, ids)
    res.json({ products })
  } catch (error) {
    console.error("Error resolving products:", error)
    res.status(error.status || 500).json({
      error: error.message || "Failed to resolve products",
    })
  }
})

export default router
