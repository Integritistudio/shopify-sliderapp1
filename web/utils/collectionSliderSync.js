/**
 * Sync selected Shopify collections into slider slides for Collection Carousel.
 * Used by manual Select collections + catalog webhooks (collections/update|delete).
 */
import { Op } from "sequelize"
import { Slider, Slide } from "../models/index.js"
import {
  DEFAULT_SLIDE_FIELDS,
  COLLECTION_SLIDER_TYPES,
  mergeSliderSettings,
} from "./sliderDefaults.js"
import { fetchCollectionsByIds } from "../routes/collections.js"
import { getPlanMaxSlidesForShop } from "./planGuards.js"
import { SLIDE_ABSOLUTE_CEILING } from "./plans.js"
import { normalizeShopDomain } from "./shopAffiliate.js"
import {
  collectionIdSetFromPayload,
  getOfflineSessionForShop,
  enqueueSliderRefresh,
} from "./productSliderSync.js"

function stripHtml(value = "") {
  return String(value || "")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
}

function gidSuffix(value) {
  const match = String(value || "").match(/\/(\d+)\s*$/)
  return match ? match[1] : null
}

export function formatItemCount(count) {
  const n = Number(count)
  if (!Number.isFinite(n) || n < 0) return ""
  return `${Math.round(n)} ${n === 1 ? "item" : "items"}`
}

export function isCollectionSliderType(sliderType) {
  return COLLECTION_SLIDER_TYPES.includes(sliderType)
}

export async function replaceWithCollectionSlides(slider, collections, { exploreCtaText = "Explore Collection" } = {}) {
  await Slide.destroy({ where: { SliderId: slider.id } })
  if (!collections.length) return

  const ctaLabel = String(exploreCtaText || "Explore Collection").trim() || "Explore Collection"

  await Slide.bulkCreate(
    collections.map((collection, index) => {
      const title = collection.title || "Collection"
      const description = stripHtml(collection.description || "")
      const imageUrl = collection.imageUrl || ""
      const countLabel = formatItemCount(collection.productsCount)
      return {
        ...DEFAULT_SLIDE_FIELDS,
        imageUrl,
        title,
        heading: title,
        description,
        subheading: countLabel ? String(collection.productsCount ?? "") : "",
        ctaText: ctaLabel,
        ctaUrl: collection.url || (collection.handle ? `/collections/${collection.handle}` : ""),
        ctaResourceType: "collection",
        ctaResourceId: collection.id,
        imageAlt: collection.imageAlt || title,
        textAlign: "left",
        textColor: "#ffffff",
        overlayOpacity: 0,
        position: index,
        isVisible: true,
        SliderId: slider.id,
      }
    }),
  )
}

export async function syncCollectionsForSlider(session, slider, collectionIds, options = {}) {
  if (!isCollectionSliderType(slider.sliderType)) {
    const err = new Error("Collection sync is only available for Collection Carousel")
    err.status = 400
    throw err
  }
  const collections = await fetchCollectionsByIds(session, collectionIds)
  await replaceWithCollectionSlides(slider, collections, {
    exploreCtaText: options.exploreCtaText,
  })
  return collections
}

function idsMatchSet(value, idSet) {
  if (value == null || value === "") return false
  const str = String(value)
  if (idSet.has(str)) return true
  const suffix = gidSuffix(str)
  return Boolean(suffix && idSet.has(suffix))
}

function sliderUsesAnyCollection(slider, collectionIds) {
  const settingsIds = slider?.settings?.collectionIds
  if (Array.isArray(settingsIds)) {
    if (settingsIds.some((id) => idsMatchSet(id, collectionIds))) return true
  }
  return (slider.slides || []).some(
    (slide) =>
      slide.ctaResourceType === "collection" && idsMatchSet(slide.ctaResourceId, collectionIds),
  )
}

function collectCollectionIdsFromSlider(slider) {
  const fromSettings = Array.isArray(slider?.settings?.collectionIds)
    ? slider.settings.collectionIds.filter(Boolean)
    : []
  if (fromSettings.length) return fromSettings

  return (slider.slides || [])
    .filter((slide) => slide.ctaResourceType === "collection" && slide.ctaResourceId)
    .sort((a, b) => (a.position || 0) - (b.position || 0))
    .map((slide) => slide.ctaResourceId)
}

/**
 * Re-fetch Shopify collection data and rewrite slides for one Collection Carousel.
 */
export async function refreshCollectionSliderFromShopify(session, slider, { dropCollectionIds } = {}) {
  if (!session || !slider || !isCollectionSliderType(slider.sliderType)) {
    return { refreshed: false, reason: "skipped" }
  }

  const settings = mergeSliderSettings(slider.sliderType, slider.settings || {})
  let collectionIds = collectCollectionIdsFromSlider({
    ...slider,
    settings,
    slides: slider.slides,
  })

  if (dropCollectionIds?.size) {
    collectionIds = collectionIds.filter((id) => !idsMatchSet(id, dropCollectionIds))
  }

  const { maxSlides } = await getPlanMaxSlidesForShop(session)
  const limitedIds = collectionIds.slice(0, Math.min(maxSlides, SLIDE_ABSOLUTE_CEILING))

  settings.collectionIds = limitedIds
  settings.collectionId = null
  settings.collectionHandle = null
  slider.settings = settings
  await slider.save()

  if (!limitedIds.length) {
    await Slide.destroy({ where: { SliderId: slider.id } })
    return { refreshed: true, mode: "cleared", collectionCount: 0 }
  }

  const collections = await fetchCollectionsByIds(session, limitedIds)
  // Keep merchant order; drop ids Shopify no longer returns (deleted collections)
  const byId = new Map(collections.map((c) => [c.id, c]))
  const ordered = limitedIds
    .map((id) => {
      if (byId.has(id)) return byId.get(id)
      const suffix = gidSuffix(id)
      if (!suffix) return null
      for (const [gid, col] of byId) {
        if (gidSuffix(gid) === suffix) return col
      }
      return null
    })
    .filter(Boolean)

  const keptIds = ordered.map((c) => c.id)
  settings.collectionIds = keptIds
  slider.settings = settings
  await slider.save()

  await replaceWithCollectionSlides(slider, ordered, {
    exploreCtaText: settings.exploreCtaText,
  })

  return { refreshed: true, mode: "collections", collectionCount: ordered.length }
}

async function loadCollectionSliders(shop) {
  return Slider.findAll({
    where: {
      shop,
      sliderType: { [Op.in]: COLLECTION_SLIDER_TYPES },
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
 * collections/update — refresh Collection Carousels that include this collection.
 * collections/delete — drop the collection from those carousels and refresh.
 */
export async function handleCollectionCarouselWebhook(shop, payload, { deleted = false } = {}) {
  const shopDomain = normalizeShopDomain(shop)
  if (!shopDomain) return

  const collectionIds = collectionIdSetFromPayload(payload)
  if (!collectionIds.size) return

  const session = await getOfflineSessionForShop(shopDomain)
  if (!session) {
    console.warn(`[catalog-sync] no session for ${shopDomain}; skip collection-carousel refresh`)
    return
  }

  const sliders = await loadCollectionSliders(shopDomain)
  const targets = sliders.filter((slider) => sliderUsesAnyCollection(slider, collectionIds))

  console.log(
    `[catalog-sync] collection-carousel webhook shop=${shopDomain} collection=${payload?.id || "?"} deleted=${deleted} sliders=${sliders.length} targets=${targets.length}`,
  )

  if (!targets.length) return

  for (const slider of targets) {
    await enqueueSliderRefresh(slider.id, async () => {
      try {
        const result = await refreshCollectionSliderFromShopify(session, slider, {
          dropCollectionIds: deleted ? collectionIds : undefined,
        })
        if (result.refreshed) {
          console.log(
            `[catalog-sync] collection webhook refreshed collection-carousel ${slider.id} (${result.mode}, ${result.collectionCount} collections)`,
          )
        } else {
          console.warn(
            `[catalog-sync] skipped collection-carousel ${slider.id}: ${result.reason || "unknown"}`,
          )
        }
      } catch (error) {
        console.error(
          `[catalog-sync] failed refreshing collection-carousel ${slider.id}:`,
          error?.message || error,
        )
      }
    })
  }
}
