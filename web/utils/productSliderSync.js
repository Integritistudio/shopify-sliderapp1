/**
 * Shared product-slide sync used by manual API sync and catalog webhooks.
 * Keeps snapshots in Slides in sync with Shopify without changing storefront reads.
 */
import { Op } from "sequelize"
import shopify from "../shopify.js"
import { Slider, Slide } from "../models/index.js"
import {
  DEFAULT_SLIDE_FIELDS,
  PRODUCT_SLIDER_TYPES,
  mergeSliderSettings,
} from "./sliderDefaults.js"
import { fetchCollectionProducts, fetchProductsByIds } from "../routes/collections.js"
import { getPlanMaxSlidesForShop } from "./planGuards.js"
import { SLIDE_ABSOLUTE_CEILING } from "./plans.js"
import { normalizeShopDomain } from "./shopAffiliate.js"

/** Serialize per-slider refreshes so concurrent webhooks don't race destroy/create. */
const refreshChains = new Map()

export function enqueueSliderRefresh(sliderId, job) {
  const key = String(sliderId)
  const prev = refreshChains.get(key) || Promise.resolve()
  const next = prev.catch(() => {}).then(job)
  refreshChains.set(key, next)
  return next.finally(() => {
    if (refreshChains.get(key) === next) refreshChains.delete(key)
  })
}

export async function replaceWithProductSlides(slider, products, { showPrice = true } = {}) {
  await Slide.destroy({ where: { SliderId: slider.id } })
  if (!products.length) return
  await Slide.bulkCreate(
    products.map((product, index) => ({
      ...DEFAULT_SLIDE_FIELDS,
      imageUrl: product.imageUrl || "",
      hoverImageUrl: product.hoverImageUrl || "",
      compareAtPrice: product.compareAtPrice || "",
      saleDiscountPercent:
        Number.isFinite(Number(product.saleDiscountPercent)) && Number(product.saleDiscountPercent) > 0
          ? Math.round(Number(product.saleDiscountPercent))
          : null,
      title: product.title,
      heading: product.title,
      description: showPrice ? product.price || "" : "",
      ctaText: "Shop now",
      ctaUrl: product.url,
      ctaResourceType: "product",
      ctaResourceId: product.id,
      variantId: product.variantId || null,
      availableForSale: product.availableForSale !== false,
      subheading: product.handle || "",
      imageAlt: product.imageAlt || product.title,
      textAlign: "center",
      textColor: "#170f49",
      overlayOpacity: 0,
      position: index,
      isVisible: true,
      SliderId: slider.id,
    })),
  )
}

export async function getOfflineSessionForShop(shop) {
  if (!shop) return null
  try {
    const sessions = await shopify.config.sessionStorage.findSessionsByShop(shop)
    if (!sessions?.length) return null
    return sessions.find((s) => s.isOnline === false) || sessions[0] || null
  } catch (error) {
    console.warn("getOfflineSessionForShop failed:", error?.message || error)
    return null
  }
}

function gidSuffix(value) {
  const match = String(value || "").match(/\/(\d+)\s*$/)
  return match ? match[1] : null
}

/** Build comparable id set from a Shopify REST webhook product payload. */
export function productIdSetFromPayload(payload = {}) {
  const ids = new Set()
  const add = (value) => {
    if (value == null || value === "") return
    const str = String(value)
    ids.add(str)
    const suffix = gidSuffix(str)
    if (suffix) {
      ids.add(suffix)
      ids.add(`gid://shopify/Product/${suffix}`)
    } else if (/^\d+$/.test(str)) {
      ids.add(`gid://shopify/Product/${str}`)
    }
  }
  add(payload.admin_graphql_api_id)
  add(payload.id)
  return ids
}

/** Build comparable id set from a Shopify REST webhook collection payload. */
export function collectionIdSetFromPayload(payload = {}) {
  const ids = new Set()
  const add = (value) => {
    if (value == null || value === "") return
    const str = String(value)
    ids.add(str)
    const suffix = gidSuffix(str)
    if (suffix) {
      ids.add(suffix)
      ids.add(`gid://shopify/Collection/${suffix}`)
    } else if (/^\d+$/.test(str)) {
      ids.add(`gid://shopify/Collection/${str}`)
    }
  }
  add(payload.admin_graphql_api_id)
  add(payload.id)
  return ids
}

function slideLinkedToProduct(slide, productIds, payload = {}) {
  if (!slide) return false
  if (slide.ctaResourceType === "product" && slide.ctaResourceId) {
    const rid = String(slide.ctaResourceId)
    if (productIds.has(rid)) return true
    const suffix = gidSuffix(rid)
    if (suffix && productIds.has(suffix)) return true
  }
  // Fallback: synced slides store product handle in subheading
  const handle = String(payload.handle || "")
    .trim()
    .toLowerCase()
  if (handle && String(slide.subheading || "").trim().toLowerCase() === handle) {
    return true
  }
  return false
}

function sliderUsesCollection(slider, collectionIds) {
  const collectionId = slider?.settings?.collectionId
  if (!collectionId) return false
  const str = String(collectionId)
  if (collectionIds.has(str)) return true
  const suffix = gidSuffix(str)
  return Boolean(suffix && collectionIds.has(suffix))
}

/**
 * Re-fetch Shopify catalog data and rewrite slides for one product slider.
 * Same outcome as manual Sync collection / product pick.
 */
export async function refreshProductSliderFromShopify(session, slider) {
  if (!session || !slider || !PRODUCT_SLIDER_TYPES.includes(slider.sliderType)) {
    return { refreshed: false, reason: "skipped" }
  }

  const settings = mergeSliderSettings(slider.sliderType, slider.settings || {})
  const showPrice = settings.showPrice !== false
  const { maxSlides } = await getPlanMaxSlidesForShop(session)
  const limitCap = Math.min(maxSlides, SLIDE_ABSOLUTE_CEILING)

  if (settings.collectionId) {
    const limit = Math.min(
      Math.max(Number(settings.productLimit ?? 8), 1),
      limitCap,
    )
    const { products, handle } = await fetchCollectionProducts(
      session,
      settings.collectionId,
      limit,
    )
    settings.collectionHandle = handle || settings.collectionHandle || null
    settings.productLimit = limit
    settings.showPrice = Boolean(showPrice)
    slider.settings = settings
    await slider.save()
    await replaceWithProductSlides(slider, products, { showPrice })
    return { refreshed: true, mode: "collection", productCount: products.length }
  }

  const slides =
    slider.slides ||
    (await Slide.findAll({
      where: { SliderId: slider.id },
      order: [
        ["position", "ASC"],
        ["id", "ASC"],
      ],
    }))

  const productIds = slides
    .filter((slide) => slide.ctaResourceType === "product" && slide.ctaResourceId)
    .map((slide) => slide.ctaResourceId)

  if (!productIds.length) {
    return { refreshed: false, reason: "no-product-ids" }
  }

  const products = (await fetchProductsByIds(session, productIds)).slice(0, limitCap)
  settings.showPrice = Boolean(showPrice)
  slider.settings = settings
  await slider.save()
  await replaceWithProductSlides(slider, products, { showPrice })
  return { refreshed: true, mode: "products", productCount: products.length }
}

async function loadProductSliders(shop) {
  return Slider.findAll({
    where: {
      shop,
      sliderType: { [Op.in]: PRODUCT_SLIDER_TYPES },
    },
    include: [
      {
        model: Slide,
        as: "slides",
        required: false,
        attributes: ["id", "ctaResourceType", "ctaResourceId", "position"],
      },
    ],
    order: [
      [{ model: Slide, as: "slides" }, "position", "ASC"],
      [{ model: Slide, as: "slides" }, "id", "ASC"],
    ],
  })
}

/**
 * products/update|create|delete — refresh only product sliders that already
 * reference this product (collection or manual pick).
 */
export async function handleProductWebhook(shop, payload) {
  const shopDomain = normalizeShopDomain(shop)
  if (!shopDomain) {
    console.warn("[catalog-sync] product webhook missing shop domain")
    return
  }

  const productIds = productIdSetFromPayload(payload)
  if (!productIds.size) {
    console.warn("[catalog-sync] product webhook missing product id", shopDomain)
    return
  }

  const session = await getOfflineSessionForShop(shopDomain)
  if (!session) {
    console.warn(`[catalog-sync] no session for ${shopDomain}; skip product refresh`)
    return
  }

  const sliders = await loadProductSliders(shopDomain)
  const uniqueTargets = sliders.filter((slider) =>
    (slider.slides || []).some((slide) => slideLinkedToProduct(slide, productIds, payload)),
  )

  console.log(
    `[catalog-sync] product webhook shop=${shopDomain} product=${payload?.id || "?"} handle=${payload?.handle || "?"} sliders=${sliders.length} targets=${uniqueTargets.length} types=${uniqueTargets.map((s) => `${s.id}:${s.sliderType}`).join(",") || "-"}`,
  )

  if (!uniqueTargets.length) {
    console.warn(
      `[catalog-sync] no product sliders linked to product ${payload?.id || "?"} (${payload?.handle || "no-handle"}) on ${shopDomain}. Tip: re-sync products/collection on the slider so slides store product ids.`,
    )
    return
  }

  for (const slider of uniqueTargets) {
    await enqueueSliderRefresh(slider.id, async () => {
      try {
        const result = await refreshProductSliderFromShopify(session, slider)
        if (result.refreshed) {
          console.log(
            `[catalog-sync] product webhook refreshed slider ${slider.id} type=${slider.sliderType} (${result.mode}, ${result.productCount} products)`,
          )
        } else {
          console.warn(
            `[catalog-sync] skipped slider ${slider.id} type=${slider.sliderType}: ${result.reason || "unknown"}`,
          )
        }
      } catch (error) {
        console.error(
          `[catalog-sync] failed refreshing slider ${slider.id} after product webhook:`,
          error?.message || error,
        )
      }
    })
  }
}

/**
 * collections/update — refresh product sliders synced to this collection.
 */
export async function handleCollectionWebhook(shop, payload) {
  const shopDomain = normalizeShopDomain(shop)
  if (!shopDomain) return

  const collectionIds = collectionIdSetFromPayload(payload)
  if (!collectionIds.size) return

  const session = await getOfflineSessionForShop(shopDomain)
  if (!session) {
    console.warn(`[catalog-sync] no session for ${shopDomain}; skip collection refresh`)
    return
  }

  const sliders = await loadProductSliders(shopDomain)
  const targets = sliders.filter((slider) => sliderUsesCollection(slider, collectionIds))

  for (const slider of targets) {
    await enqueueSliderRefresh(slider.id, async () => {
      try {
        const result = await refreshProductSliderFromShopify(session, slider)
        if (result.refreshed) {
          console.log(
            `[catalog-sync] collection webhook refreshed slider ${slider.id} (${result.productCount} products)`,
          )
        }
      } catch (error) {
        console.error(
          `[catalog-sync] failed refreshing slider ${slider.id} after collection webhook:`,
          error?.message || error,
        )
      }
    })
  }
}
