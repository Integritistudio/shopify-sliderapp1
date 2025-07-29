import express from "express"
import shopify from "../shopify.js"

const router = express.Router()

// Get all collections for the shop
router.get("/collections", async (req, res) => {
  try {
    // Get the session from res.locals (set by Shopify auth middleware)
    const session = res.locals.shopify?.session

    if (!session) {
      console.error("No valid session found")
      return res.status(401).json({ error: "No valid session found" })
    }

    const shop = session.shop
    console.log(`Fetching collections for shop: ${shop}`)

    if (!shop) {
      console.error("No shop found in session")
      return res.status(400).json({ error: "No shop found in session" })
    }

    console.log(`Session found for shop: ${session.shop}`)

    // Create Shopify REST API client
    const client = new shopify.api.clients.Rest({ session })

    try {
      let allCollections = []
      
      // Method 1: Try GraphQL first (most reliable for getting accurate product counts)
      try {
        console.log("Trying GraphQL to fetch collections...")
        const graphqlClient = new shopify.api.clients.Graphql({ session })
        
        const query = `
          query getCollections($first: Int!) {
            collections(first: $first) {
              edges {
                node {
                  id
                  title
                  handle
                  description
                  image {
                    id
                    url
                  }
                  productsCount
                }
              }
            }
          }
        `
        
        const response = await graphqlClient.query({
          data: {
            query,
            variables: { first: 250 }
          }
        })
        
        if (response.body.data?.collections?.edges) {
          const graphqlCollections = response.body.data.collections.edges.map(edge => {
            const collection = edge.node
            return {
              id: collection.id.replace('gid://shopify/Collection/', ''),
              title: collection.title,
              handle: collection.handle,
              body_html: collection.description,
              image: collection.image ? {
                id: collection.image.id.replace('gid://shopify/ProductImage/', ''),
                url: collection.image.url
              } : null,
              products_count: collection.productsCount,
              type: 'graphql'
            }
          })
          
          allCollections = graphqlCollections
          console.log(`Found ${allCollections.length} collections via GraphQL`)
        }
      } catch (graphqlError) {
        console.log("GraphQL collections fetch failed:", graphqlError.message)
      }
      
      // Method 2: If GraphQL failed, try REST API with manual product counting
      if (allCollections.length === 0) {
        console.log("Trying REST API to fetch collections...")
        
        // Fetch collections from Shopify
        const collectionsResponse = await client.get({
          path: "custom_collections",
          query: {
            limit: 250,
            fields: "id,title,handle,image,body_html",
          },
        })

        const customCollections = collectionsResponse.body.custom_collections || []
        
        // Also fetch smart collections
        const smartCollectionsResponse = await client.get({
          path: "smart_collections",
          query: {
            limit: 250,
            fields: "id,title,handle,image,body_html",
          },
        })
        
        const smartCollections = smartCollectionsResponse.body.smart_collections || []
        
        // Combine collections and manually count products
        const restCollections = [
          ...customCollections.map(collection => ({ ...collection, type: 'custom' })),
          ...smartCollections.map(collection => ({ ...collection, type: 'smart' }))
        ]
        
        console.log(`Found ${restCollections.length} collections via REST (${customCollections.length} custom, ${smartCollections.length} smart)`)
        
        // Manually count products for each collection using collects
        const collectionsWithCounts = await Promise.all(
          restCollections.map(async (collection) => {
            try {
              // Use collects to get accurate product count
              const collectsResponse = await client.get({
                path: "collects",
                query: {
                  collection_id: collection.id,
                  limit: 1 // We just need to count, not fetch all
                },
              })
              
              // Get the count from headers if available
              let productCount = 0
              if (collectsResponse.headers && collectsResponse.headers['x-shopify-shop-api-call-limit']) {
                // Try to get total count from the response
                const collectsCountResponse = await client.get({
                  path: "collects/count",
                  query: {
                    collection_id: collection.id
                  },
                })
                productCount = collectsCountResponse.body.count || 0
              } else {
                // Fallback: count the actual collects
                const allCollectsResponse = await client.get({
                  path: "collects",
                  query: {
                    collection_id: collection.id,
                    limit: 250
                  },
                })
                productCount = (allCollectsResponse.body.collects || []).length
              }
              
              console.log(`Collection "${collection.title}" (${collection.id}) has ${productCount} products`)
              
              return {
                ...collection,
                products_count: productCount
              }
            } catch (countError) {
              console.log(`Failed to count products for collection ${collection.id}:`, countError.message)
              return {
                ...collection,
                products_count: 0
              }
            }
          })
        )
        
        allCollections = collectionsWithCounts
      }
      
      // Filter out collections with 0 products (optional - comment out if you want to see all)
      // allCollections = allCollections.filter(collection => collection.products_count > 0)
      
      console.log(`Returning ${allCollections.length} collections for shop ${shop}`)
      console.log("Collections summary:", allCollections.map(c => `${c.title}: ${c.products_count} products`))

      res.json(allCollections)
    } catch (shopifyError) {
      console.error("Shopify API error:", shopifyError)
      return res.status(500).json({
        error: "Failed to fetch collections from Shopify",
        details: shopifyError.message,
      })
    }
  } catch (error) {
    console.error("Error fetching collections:", error)
    res.status(500).json({
      error: "Failed to fetch collections",
      details: error.message,
    })
  }
})

// Get products from a specific collection
router.get("/collections/:collectionId/products", async (req, res) => {
  try {
    const { collectionId } = req.params
    
    // Get the session from res.locals (set by Shopify auth middleware)
    const session = res.locals.shopify?.session

    if (!session) {
      console.error("No valid session found")
      return res.status(401).json({ error: "No valid session found" })
    }

    const shop = session.shop
    console.log(`Fetching products for collection ${collectionId} in shop: ${shop}`)

    if (!shop) {
      console.error("No shop found in session")
      return res.status(400).json({ error: "No shop found in session" })
    }

    // Create Shopify REST API client
    const client = new shopify.api.clients.Rest({ session })

    try {
      let products = []
      let collectionType = null
      
      // Method 1: Try using collect endpoint (works for both custom and smart collections)
      try {
        console.log(`Trying collect endpoint for collection ${collectionId}`)
        
        // First get the collects (relationships between products and collections)
        const collectsResponse = await client.get({
          path: "collects",
          query: {
            collection_id: collectionId,
            limit: 250
          },
        })
        
        const collects = collectsResponse.body.collects || []
        console.log(`Found ${collects.length} product relationships for collection ${collectionId}`)
        
        if (collects.length > 0) {
          // Get product IDs from collects
          const productIds = collects.map(collect => collect.product_id)
          
          // Fetch products in batches (Shopify limits to 250 products per request)
          const batchSize = 50
          const productBatches = []
          
          for (let i = 0; i < productIds.length; i += batchSize) {
            const batch = productIds.slice(i, i + batchSize)
            const productsResponse = await client.get({
              path: "products",
              query: {
                ids: batch.join(','),
                fields: "id,title,body_html,handle,images,vendor,product_type,status",
                limit: batchSize
              },
            })
            
            if (productsResponse.body.products) {
              productBatches.push(...productsResponse.body.products)
            }
          }
          
          products = productBatches.filter(product => product.status === 'active')
          collectionType = 'via_collects'
          console.log(`Found ${products.length} active products via collects endpoint`)
        }
      } catch (collectError) {
        console.log(`Collect endpoint failed:`, collectError.message)
      }
      
      // Method 2: If collect method didn't work or found no products, try direct collection endpoints
      if (products.length === 0) {
        try {
          console.log(`Trying custom collection endpoint for collection ${collectionId}`)
          const productsResponse = await client.get({
            path: `custom_collections/${collectionId}/products`,
            query: {
              limit: 50,
              fields: "id,title,body_html,handle,images,vendor,product_type,status",
            },
          })
          products = productsResponse.body.products?.filter(product => product.status === 'active') || []
          collectionType = 'custom'
          console.log(`Found ${products.length} products from custom collection endpoint`)
        } catch (customError) {
          console.log(`Custom collection endpoint failed:`, customError.message)
          
          // Try smart collection
          try {
            console.log(`Trying smart collection endpoint for collection ${collectionId}`)
            const productsResponse = await client.get({
              path: `smart_collections/${collectionId}/products`,
              query: {
                limit: 50,
                fields: "id,title,body_html,handle,images,vendor,product_type,status",
              },
            })
            products = productsResponse.body.products?.filter(product => product.status === 'active') || []
            collectionType = 'smart'
            console.log(`Found ${products.length} products from smart collection endpoint`)
          } catch (smartError) {
            console.log(`Smart collection endpoint failed:`, smartError.message)
          }
        }
      }
      
      // Method 3: If still no products, try GraphQL as fallback
      if (products.length === 0) {
        try {
          console.log(`Trying GraphQL endpoint as fallback for collection ${collectionId}`)
          const graphqlClient = new shopify.api.clients.Graphql({ session })
          
          const query = `
            query getCollectionProducts($id: ID!, $first: Int!) {
              collection(id: $id) {
                id
                title
                products(first: $first) {
                  edges {
                    node {
                      id
                      title
                      description
                      handle
                      vendor
                      productType
                      status
                      images(first: 1) {
                        edges {
                          node {
                            id
                            url
                            altText
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          `
          
          const response = await graphqlClient.query({
            data: {
              query,
              variables: {
                id: `gid://shopify/Collection/${collectionId}`,
                first: 50
              }
            },
          })
          
          if (response.body.data?.collection?.products?.edges) {
            const graphqlProducts = response.body.data.collection.products.edges.map(edge => {
              const product = edge.node
              const image = product.images.edges[0]?.node
              
              return {
                id: product.id.replace('gid://shopify/Product/', ''),
                title: product.title,
                body_html: product.description,
                handle: product.handle,
                vendor: product.vendor,
                product_type: product.productType,
                status: product.status,
                images: image ? [{
                  id: image.id.replace('gid://shopify/ProductImage/', ''),
                  src: image.url,
                  alt: image.altText
                }] : []
              }
            })
            
            products = graphqlProducts.filter(product => product.status === 'ACTIVE')
            collectionType = 'graphql'
            console.log(`Found ${products.length} products via GraphQL endpoint`)
          }
        } catch (graphqlError) {
          console.log(`GraphQL endpoint failed:`, graphqlError.message)
        }
      }

      if (products.length === 0) {
        console.log(`No products found for collection ${collectionId} using any method`)
        return res.json([])
      }

      // Transform products into slide format
      const slideData = products.map((product) => {
        const primaryImage = product.images && product.images.length > 0 ? product.images[0] : null

        return {
          id: product.id,
          title: product.title,
          description: product.body_html
            ? product.body_html.replace(/<[^>]*>/g, "").substring(0, 200) +
              (product.body_html.length > 200 ? "..." : "")
            : `${product.vendor ? product.vendor + " - " : ""}${product.product_type || "Product"}`,
          image: primaryImage,
          imageUrl: primaryImage ? primaryImage.src : null,
          handle: product.handle,
          vendor: product.vendor,
          product_type: product.product_type,
        }
      })

      console.log(`Successfully transformed ${slideData.length} products for collection ${collectionId} (method: ${collectionType})`)
      res.json(slideData)
    } catch (shopifyError) {
      console.error("Shopify API error:", shopifyError)
      return res.status(500).json({
        error: "Failed to fetch collection products from Shopify",
        details: shopifyError.message,
      })
    }
  } catch (error) {
    console.error("Error fetching collection products:", error)
    res.status(500).json({
      error: "Failed to fetch collection products",
      details: error.message,
    })
  }
})

// Debug endpoint to check what's in your collections
router.get("/collections/debug", async (req, res) => {
  try {
    const session = res.locals.shopify?.session
    if (!session) {
      return res.status(401).json({ error: "No session" })
    }

    const client = new shopify.api.clients.Rest({ session })
    
    // Get all collections
    const customResponse = await client.get({
      path: "custom_collections",
      query: { limit: 10, fields: "id,title,handle" }
    })
    
    const smartResponse = await client.get({
      path: "smart_collections", 
      query: { limit: 10, fields: "id,title,handle" }
    })
    
    const allCollections = [
      ...(customResponse.body.custom_collections || []),
      ...(smartResponse.body.smart_collections || [])
    ]
    
    // For each collection, check different ways to get products
    const debug = await Promise.all(
      allCollections.map(async (collection) => {
        const methods = {}
        
        // Method 1: Collects count
        try {
          const collectsCount = await client.get({
            path: "collects/count",
            query: { collection_id: collection.id }
          })
          methods.collectsCount = collectsCount.body.count
        } catch (e) {
          methods.collectsCount = `Error: ${e.message}`
        }
        
        // Method 2: Direct collects
        try {
          const collects = await client.get({
            path: "collects",
            query: { collection_id: collection.id, limit: 250 }
          })
          methods.directCollects = (collects.body.collects || []).length
        } catch (e) {
          methods.directCollects = `Error: ${e.message}`
        }
        
        // Method 3: Collection products endpoint
        try {
          const products = await client.get({
            path: `custom_collections/${collection.id}/products`,
            query: { limit: 1 }
          })
          methods.customEndpoint = (products.body.products || []).length
        } catch (e) {
          try {
            const products = await client.get({
              path: `smart_collections/${collection.id}/products`,
              query: { limit: 1 }
            })
            methods.smartEndpoint = (products.body.products || []).length
          } catch (e2) {
            methods.collectionEndpoint = `Error: ${e.message} / ${e2.message}`
          }
        }
        
        return {
          id: collection.id,
          title: collection.title,
          handle: collection.handle,
          methods
        }
      })
    )
    
    res.json(debug)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

export default router