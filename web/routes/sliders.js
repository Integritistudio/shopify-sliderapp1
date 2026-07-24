import express from "express"
import { Slider, Slide, BrandKit, ShopOnboarding } from "../models/index.js"
import { extractShop } from "../middleware/auth.js"
import {
  mergeSliderSettings,
  settingsFromPreset,
  SLIDE_ATTRIBUTES,
  DEFAULT_SLIDE_FIELDS,
  PRODUCT_SLIDER_TYPES,
} from "../utils/sliderDefaults.js"
import { sanitizePlainText } from "../utils/validation.js"
import { getTemplateById } from "../utils/templates.js"
import { fetchCollectionProducts, fetchProductsByIds } from "./collections.js"
import {
  assertCanCreateSlider,
  assertCanChangeSliderType,
  getPlanMaxSlidesForShop,
} from "../utils/planGuards.js"
import { SLIDE_ABSOLUTE_CEILING } from "../utils/plans.js"
import { resolveShopPlan } from "../utils/resolveShopPlan.js"
import { upsertShopPlanCache } from "../utils/shopPlanCache.js"

const router = express.Router()

router.use(extractShop)

function serializeSlider(slider) {
  const data = slider.get ? slider.get({ plain: true }) : slider
  return {
    ...data,
    settings: mergeSliderSettings(data.sliderType, data.settings || {}),
    slides: (data.slides || []).map((slide) => ({
      ...slide,
      description: slide.description || "",
    })),
  }
}

async function replaceWithProductSlides(slider, products, { showPrice = true } = {}) {
  await Slide.destroy({ where: { SliderId: slider.id } })
  if (!products.length) return
  await Slide.bulkCreate(
    products.map((product, index) => ({
      ...DEFAULT_SLIDE_FIELDS,
      imageUrl: product.imageUrl || "",
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

async function loadSerializedSlider(id, shop) {
  return Slider.findOne({
    where: { id, shop },
    include: [
      {
        model: Slide,
        as: "slides",
        attributes: SLIDE_ATTRIBUTES,
        required: false,
      },
    ],
    order: [
      [{ model: Slide, as: "slides" }, "position", "ASC"],
      [{ model: Slide, as: "slides" }, "id", "ASC"],
    ],
  })
}

async function markOnboarding(shop, patch) {
  try {
    const [row] = await ShopOnboarding.findOrCreate({
      where: { shop },
      defaults: { shop },
    })
    Object.assign(row, patch)
    await row.save()
  } catch (error) {
    console.warn("Onboarding update skipped:", error.message)
  }
}

router.get("/sliders", async (req, res) => {
  try {
    const shop = req.shop
    const session = res.locals.shopify?.session
    if (shop && session) {
      resolveShopPlan(session)
        .then((resolved) => upsertShopPlanCache(shop, resolved.planId))
        .catch((err) => console.warn("ShopPlan cache sync skipped:", err?.message || err))
    }
    const sliders = await Slider.findAll({
      where: { shop },
      include: [
        {
          model: Slide,
          as: "slides",
          attributes: SLIDE_ATTRIBUTES,
          required: false,
        },
      ],
      order: [
        ["sortOrder", "ASC"],
        ["id", "ASC"],
        [{ model: Slide, as: "slides" }, "position", "ASC"],
        [{ model: Slide, as: "slides" }, "id", "ASC"],
      ],
    })

    res.json(sliders.map(serializeSlider))
  } catch (error) {
    console.error("Error fetching sliders:", error)
    res.status(500).json({ error: "Failed to fetch sliders" })
  }
})

router.get("/sliders/:id", async (req, res) => {
  try {
    const shop = req.shop
    const slider = await Slider.findOne({
      where: { id: req.params.id, shop },
      include: [
        {
          model: Slide,
          as: "slides",
          attributes: SLIDE_ATTRIBUTES,
          required: false,
        },
      ],
      order: [
        [{ model: Slide, as: "slides" }, "position", "ASC"],
        [{ model: Slide, as: "slides" }, "id", "ASC"],
      ],
    })

    if (!slider) {
      return res.status(404).json({ error: "Slider not found" })
    }

    res.json(serializeSlider(slider))
  } catch (error) {
    console.error("Error fetching slider:", error)
    res.status(500).json({ error: "Failed to fetch slider" })
  }
})

router.post("/sliders", async (req, res) => {
  try {
    const { name, sliderType, settings, status, templateId, slides: slidesInput } = req.body
    const shop = req.shop

    if (!name || !String(name).trim()) {
      return res.status(400).json({ error: "Slider name is required" })
    }

    const template = templateId ? getTemplateById(templateId) : null
    const type = template?.sliderType || sliderType || "center"
    const templateSlidesPreview = slidesInput || template?.slides || []
    const initialSlideCount = Array.isArray(templateSlidesPreview) ? templateSlidesPreview.length : 0

    const gate = await assertCanCreateSlider(req, res, {
      sliderType: type,
      initialSlideCount,
    })
    if (gate.denied) return

    const brandKit = await BrandKit.findOne({ where: { shop } })

    const slider = await Slider.create({
      name: sanitizePlainText(name, 120),
      sliderType: type,
      settings: mergeSliderSettings(
        type,
        settings || template?.settings || settingsFromPreset(type),
      ),
      status: status === "published" ? "published" : "draft",
      shop,
    })

    const templateSlides = slidesInput || template?.slides || []
    if (Array.isArray(templateSlides) && templateSlides.length) {
      await Slide.bulkCreate(
        templateSlides.map((slide, index) => ({
          ...DEFAULT_SLIDE_FIELDS,
          ...slide,
          textColor: slide.textColor || brandKit?.textColor || DEFAULT_SLIDE_FIELDS.textColor,
          buttonBg: slide.buttonBg || brandKit?.buttonBg || DEFAULT_SLIDE_FIELDS.buttonBg,
          buttonTextColor:
            slide.buttonTextColor || brandKit?.buttonTextColor || DEFAULT_SLIDE_FIELDS.buttonTextColor,
          overlayColor: slide.overlayColor || brandKit?.overlayColor || DEFAULT_SLIDE_FIELDS.overlayColor,
          overlayOpacity:
            slide.overlayOpacity ?? brandKit?.overlayOpacity ?? DEFAULT_SLIDE_FIELDS.overlayOpacity,
          position: index,
          SliderId: slider.id,
        })),
      )
    }

    await markOnboarding(shop, {
      createdSlider: true,
      ...(templateSlides.length ? { addedSlide: true } : {}),
      ...(slider.status === "published" ? { publishedSlider: true } : {}),
    })

    const created = await Slider.findOne({
      where: { id: slider.id, shop },
      include: [
        {
          model: Slide,
          as: "slides",
          attributes: SLIDE_ATTRIBUTES,
          required: false,
        },
      ],
      order: [
        [{ model: Slide, as: "slides" }, "position", "ASC"],
        [{ model: Slide, as: "slides" }, "id", "ASC"],
      ],
    })

    res.status(201).json(serializeSlider(created))
  } catch (error) {
    console.error("Error creating slider:", error)
    res.status(500).json({ error: "Failed to create slider" })
  }
})

router.put("/sliders/:id", async (req, res) => {
  try {
    const { id } = req.params
    const { name, isExpanded, sliderType, settings, status, sortOrder } = req.body
    const shop = req.shop

    const slider = await Slider.findOne({ where: { id, shop } })
    if (!slider) {
      return res.status(404).json({ error: "Slider not found" })
    }

    if (name !== undefined) {
      const trimmed = sanitizePlainText(name, 120)
      if (!trimmed) {
        return res.status(400).json({ error: "Slider name cannot be empty" })
      }
      slider.name = trimmed
    }
    if (isExpanded !== undefined) slider.isExpanded = Boolean(isExpanded)
    if (sliderType !== undefined) {
      const typeGate = await assertCanChangeSliderType(req, res, {
        nextType: sliderType,
        currentType: slider.sliderType,
      })
      if (typeGate.denied) return
      slider.sliderType = sliderType
      slider.settings = mergeSliderSettings(sliderType, settings || slider.settings || {})
    } else if (settings !== undefined) {
      slider.settings = mergeSliderSettings(slider.sliderType, settings)
    }
    if (status !== undefined) {
      slider.status = status === "draft" ? "draft" : "published"
      if (slider.status === "published") {
        await markOnboarding(shop, { publishedSlider: true })
      }
    }
    if (sortOrder !== undefined) {
      slider.sortOrder = Number(sortOrder) || 0
    }

    await slider.save()
    res.json(serializeSlider(slider))
  } catch (error) {
    console.error("Error updating slider:", error)
    res.status(500).json({ error: "Failed to update slider" })
  }
})

router.delete("/sliders/:id", async (req, res) => {
  try {
    const { id } = req.params
    const shop = req.shop

    const slider = await Slider.findOne({ where: { id, shop } })
    if (!slider) {
      return res.status(404).json({ error: "Slider not found" })
    }

    await slider.destroy()
    res.status(204).end()
  } catch (error) {
    console.error("Error deleting slider:", error)
    res.status(500).json({ error: "Failed to delete slider" })
  }
})

router.post("/sliders/:id/duplicate", async (req, res) => {
  try {
    const shop = req.shop
    const source = await Slider.findOne({
      where: { id: req.params.id, shop },
      include: [
        {
          model: Slide,
          as: "slides",
          attributes: SLIDE_ATTRIBUTES,
          required: false,
        },
      ],
      order: [
        [{ model: Slide, as: "slides" }, "position", "ASC"],
        [{ model: Slide, as: "slides" }, "id", "ASC"],
      ],
    })

    if (!source) {
      return res.status(404).json({ error: "Slider not found" })
    }

    const plain = source.get({ plain: true })
    const sourceSlides = plain.slides || []
    const gate = await assertCanCreateSlider(req, res, {
      sliderType: plain.sliderType,
      initialSlideCount: sourceSlides.length,
    })
    if (gate.denied) return

    const copy = await Slider.create({
      name: sanitizePlainText(`Copy of ${plain.name}`, 120),
      sliderType: plain.sliderType,
      settings: mergeSliderSettings(plain.sliderType, plain.settings || {}),
      status: "draft",
      isExpanded: false,
      sortOrder: plain.sortOrder || 0,
      shop,
    })

    const slides = sourceSlides
    if (slides.length) {
      await Slide.bulkCreate(
        slides.map((slide, index) => ({
          imageUrl: slide.imageUrl,
          title: slide.title,
          description: slide.description || "",
          heading: slide.heading || "",
          subheading: slide.subheading || "",
          ctaText: slide.ctaText || "",
          ctaUrl: slide.ctaUrl || "",
          ctaStyle: slide.ctaStyle || "primary",
          ctaResourceType: slide.ctaResourceType || null,
          ctaResourceId: slide.ctaResourceId || null,
          ctaOpenInNewTab: Boolean(slide.ctaOpenInNewTab),
          cta2Text: slide.cta2Text || "",
          cta2Url: slide.cta2Url || "",
          cta2OpenInNewTab: Boolean(slide.cta2OpenInNewTab),
          textAlign: slide.textAlign || "center",
          overlayColor: slide.overlayColor || "#000000",
          overlayOpacity: slide.overlayOpacity ?? 0.3,
          textColor: slide.textColor || "#ffffff",
          buttonBg: slide.buttonBg || "#1a2f4a",
          buttonTextColor: slide.buttonTextColor || "#ffffff",
          imageAlt: slide.imageAlt || "",
          shopifyFileId: slide.shopifyFileId || null,
          mediaType: slide.mediaType || "image",
          videoUrl: slide.videoUrl || "",
          videoProvider: slide.videoProvider || null,
          position: slide.position ?? index,
          isVisible: slide.isVisible !== false,
          SliderId: copy.id,
        })),
      )
    }

    await markOnboarding(shop, { createdSlider: true })

    const duplicated = await Slider.findOne({
      where: { id: copy.id, shop },
      include: [
        {
          model: Slide,
          as: "slides",
          attributes: SLIDE_ATTRIBUTES,
          required: false,
        },
      ],
      order: [
        [{ model: Slide, as: "slides" }, "position", "ASC"],
        [{ model: Slide, as: "slides" }, "id", "ASC"],
      ],
    })

    res.status(201).json(serializeSlider(duplicated))
  } catch (error) {
    console.error("Error duplicating slider:", error)
    res.status(500).json({ error: "Failed to duplicate slider" })
  }
})

router.post("/sliders/:id/sync-collection", async (req, res) => {
  try {
    const shop = req.shop
    const session = res.locals.shopify.session
    const slider = await Slider.findOne({ where: { id: req.params.id, shop } })
    if (!slider) {
      return res.status(404).json({ error: "Slider not found" })
    }

    if (!PRODUCT_SLIDER_TYPES.includes(slider.sliderType)) {
      return res.status(400).json({ error: "Collection sync is only available for Product slider types" })
    }

    const settings = mergeSliderSettings(slider.sliderType, {
      ...(slider.settings || {}),
      ...(req.body?.settings || {}),
    })

    const collectionId = req.body?.collectionId || settings.collectionId
    if (!collectionId) {
      return res.status(400).json({ error: "Select a collection before syncing" })
    }

    const { maxSlides } = await getPlanMaxSlidesForShop(session)
    const limit = Math.min(
      Math.max(Number(req.body?.productLimit ?? settings.productLimit ?? 8), 1),
      Math.min(maxSlides, SLIDE_ABSOLUTE_CEILING),
    )
    const showPrice = req.body?.showPrice ?? settings.showPrice !== false
    if (req.body?.sectionHeading !== undefined) {
      settings.sectionHeading = String(req.body.sectionHeading || "").slice(0, 120)
    }

    const { products, handle, title } = await fetchCollectionProducts(session, collectionId, limit)

    settings.collectionId = collectionId
    settings.collectionHandle = handle
    settings.productLimit = limit
    settings.showPrice = Boolean(showPrice)
    slider.settings = settings
    await slider.save()

    await replaceWithProductSlides(slider, products, { showPrice })
    await markOnboarding(shop, { addedSlide: products.length > 0 })

    const updated = await loadSerializedSlider(slider.id, shop)
    res.json({
      ...serializeSlider(updated),
      syncMeta: {
        collectionTitle: title,
        productCount: products.length,
      },
    })
  } catch (error) {
    console.error("Error syncing collection:", error)
    res.status(error.status || 500).json({
      error: error.message || "Failed to sync collection",
    })
  }
})

router.post("/sliders/:id/sync-products", async (req, res) => {
  try {
    const shop = req.shop
    const session = res.locals.shopify.session
    const slider = await Slider.findOne({ where: { id: req.params.id, shop } })
    if (!slider) {
      return res.status(404).json({ error: "Slider not found" })
    }

    if (!PRODUCT_SLIDER_TYPES.includes(slider.sliderType)) {
      return res.status(400).json({ error: "Product sync is only available for Product slider types" })
    }

    const productIds = req.body?.productIds || []
    if (!Array.isArray(productIds) || !productIds.length) {
      return res.status(400).json({ error: "Select at least one product" })
    }

    const settings = mergeSliderSettings(slider.sliderType, {
      ...(slider.settings || {}),
      ...(req.body?.settings || {}),
    })
    const showPrice = req.body?.showPrice ?? settings.showPrice !== false
    if (req.body?.sectionHeading !== undefined) {
      settings.sectionHeading = String(req.body.sectionHeading || "").slice(0, 120)
    }
    settings.showPrice = Boolean(showPrice)
    settings.collectionId = null
    settings.collectionHandle = null
    slider.settings = settings
    await slider.save()

    const { maxSlides } = await getPlanMaxSlidesForShop(session)
    const products = (await fetchProductsByIds(session, productIds)).slice(
      0,
      Math.min(maxSlides, SLIDE_ABSOLUTE_CEILING),
    )
    await replaceWithProductSlides(slider, products, { showPrice })
    await markOnboarding(shop, { addedSlide: products.length > 0 })

    const updated = await loadSerializedSlider(slider.id, shop)
    res.json({
      ...serializeSlider(updated),
      syncMeta: {
        productCount: products.length,
      },
    })
  } catch (error) {
    console.error("Error syncing products:", error)
    res.status(error.status || 500).json({
      error: error.message || "Failed to sync products",
    })
  }
})

export default router
