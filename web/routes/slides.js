import express from "express"
import { Op } from "sequelize"
import { Slider, Slide } from "../models/index.js"
import { extractShop } from "../middleware/auth.js"
import { pickSlidePayload, sanitizePlainText, validateSlideInput } from "../utils/validation.js"
import { DEFAULT_SLIDE_FIELDS, SLIDE_HARD_LIMIT, SLIDE_SOFT_LIMIT } from "../utils/sliderDefaults.js"

const router = express.Router()

router.use(extractShop)

async function findShopSlider(sliderId, shop) {
  return Slider.findOne({
    where: {
      id: sliderId,
      shop,
    },
  })
}

function applySlideFields(slide, payload) {
  const fields = [
    "imageUrl",
    "title",
    "description",
    "heading",
    "subheading",
    "ctaText",
    "ctaUrl",
    "ctaStyle",
    "ctaResourceType",
    "ctaResourceId",
    "ctaOpenInNewTab",
    "cta2Text",
    "cta2Url",
    "cta2OpenInNewTab",
    "textAlign",
    "overlayColor",
    "overlayOpacity",
    "textColor",
    "buttonBg",
    "buttonTextColor",
    "imageAlt",
    "shopifyFileId",
    "variantId",
    "availableForSale",
    "mediaType",
    "videoUrl",
    "videoProvider",
    "position",
    "isVisible",
  ]

  for (const field of fields) {
    if (payload[field] !== undefined) {
      if (typeof payload[field] === "string" && ["title", "heading", "subheading", "ctaText", "cta2Text", "imageAlt"].includes(field)) {
        slide[field] = sanitizePlainText(payload[field], field === "title" ? 200 : 300)
      } else if (field === "description") {
        slide[field] = sanitizePlainText(payload[field], 2000)
      } else if (field === "overlayOpacity") {
        slide[field] = Number(payload[field])
      } else if (field === "isVisible" || field === "ctaOpenInNewTab" || field === "cta2OpenInNewTab") {
        slide[field] = Boolean(payload[field])
      } else if (field === "position") {
        slide[field] = Number(payload[field]) || 0
      } else {
        slide[field] = payload[field]
      }
    }
  }
}

router.post("/sliders/:sliderId/slides", async (req, res) => {
  try {
    const { sliderId } = req.params
    const shop = req.shop
    const payload = pickSlidePayload(req.body)

    const slider = await findShopSlider(sliderId, shop)
    if (!slider) {
      return res.status(404).json({ error: "Slider not found" })
    }

    const slideCount = await Slide.count({
      where: { SliderId: Number.parseInt(sliderId, 10) },
    })
    if (slideCount >= SLIDE_HARD_LIMIT) {
      return res.status(400).json({
        error: `This slider already has ${SLIDE_HARD_LIMIT} slides (maximum). Remove a slide before adding another.`,
        code: "SLIDE_HARD_LIMIT",
        limit: SLIDE_HARD_LIMIT,
      })
    }

    const errors = validateSlideInput(payload)
    if (errors.length) {
      return res.status(400).json({ error: errors[0], details: errors })
    }

    const maxPosition = await Slide.max("position", {
      where: { SliderId: Number.parseInt(sliderId, 10) },
    })

    const slide = await Slide.create({
      ...DEFAULT_SLIDE_FIELDS,
      imageUrl: (payload.imageUrl || "").trim() || (payload.mediaType === "video" ? payload.videoUrl || "" : ""),
      title: sanitizePlainText(payload.title, 200),
      description: sanitizePlainText(payload.description || "", 2000),
      heading: sanitizePlainText(payload.heading || "", 200),
      subheading: sanitizePlainText(payload.subheading || "", 300),
      ctaText: sanitizePlainText(payload.ctaText || "", 80),
      ctaUrl: payload.ctaUrl || "",
      ctaStyle: payload.ctaStyle || "primary",
      ctaResourceType: payload.ctaResourceType || null,
      ctaResourceId: payload.ctaResourceId || null,
      ctaOpenInNewTab: Boolean(payload.ctaOpenInNewTab),
      cta2Text: sanitizePlainText(payload.cta2Text || "", 80),
      cta2Url: payload.cta2Url || "",
      cta2OpenInNewTab: Boolean(payload.cta2OpenInNewTab),
      textAlign: payload.textAlign || "center",
      overlayColor: payload.overlayColor || "#000000",
      overlayOpacity: payload.overlayOpacity ?? 0.3,
      textColor: payload.textColor || "#ffffff",
      buttonBg: payload.buttonBg || "#1a2f4a",
      buttonTextColor: payload.buttonTextColor || "#ffffff",
      imageAlt: sanitizePlainText(payload.imageAlt || payload.title || "", 200),
      shopifyFileId: payload.shopifyFileId || null,
      variantId: payload.variantId || null,
      availableForSale: payload.availableForSale !== false,
      mediaType: payload.mediaType === "video" ? "video" : "image",
      videoUrl: payload.videoUrl || "",
      videoProvider: payload.videoProvider || null,
      position: payload.position ?? ((Number.isFinite(maxPosition) ? maxPosition : -1) + 1),
      isVisible: payload.isVisible !== false,
      SliderId: Number.parseInt(sliderId, 10),
    })

    try {
      const { ShopOnboarding } = await import("../models/index.js")
      const [row] = await ShopOnboarding.findOrCreate({
        where: { shop },
        defaults: { shop },
      })
      row.addedSlide = true
      await row.save()
    } catch {
      // ignore onboarding errors
    }

    const warning =
      slideCount + 1 >= SLIDE_SOFT_LIMIT && slideCount + 1 < SLIDE_HARD_LIMIT
        ? `This slider has ${slideCount + 1} slides. Consider keeping under ${SLIDE_SOFT_LIMIT} for best performance.`
        : null

    res.status(201).json(warning ? { ...slide.toJSON(), warning } : slide)
  } catch (error) {
    console.error("Error creating slide:", error)
    res.status(500).json({ error: "Failed to create slide" })
  }
})

router.put("/sliders/:sliderId/slides/reorder", async (req, res) => {
  try {
    const { sliderId } = req.params
    const shop = req.shop
    const orderedIds = Array.isArray(req.body.orderedIds) ? req.body.orderedIds : null

    if (!orderedIds || !orderedIds.length) {
      return res.status(400).json({ error: "orderedIds array is required" })
    }

    const slider = await findShopSlider(sliderId, shop)
    if (!slider) {
      return res.status(404).json({ error: "Slider not found" })
    }

    const slides = await Slide.findAll({
      where: {
        SliderId: sliderId,
        id: { [Op.in]: orderedIds },
      },
    })

    if (slides.length !== orderedIds.length) {
      return res.status(400).json({ error: "One or more slides were not found in this slider" })
    }

    await Promise.all(
      orderedIds.map((id, index) =>
        Slide.update({ position: index }, { where: { id, SliderId: sliderId } }),
      ),
    )

    const updated = await Slide.findAll({
      where: { SliderId: sliderId },
      order: [
        ["position", "ASC"],
        ["id", "ASC"],
      ],
    })

    res.json(updated)
  } catch (error) {
    console.error("Error reordering slides:", error)
    res.status(500).json({ error: "Failed to reorder slides" })
  }
})

router.put("/sliders/:sliderId/slides/:slideId", async (req, res) => {
  try {
    const { sliderId, slideId } = req.params
    const shop = req.shop
    const payload = pickSlidePayload(req.body)

    const slider = await findShopSlider(sliderId, shop)
    if (!slider) {
      return res.status(404).json({ error: "Slider not found" })
    }

    const slide = await Slide.findOne({
      where: {
        id: slideId,
        SliderId: sliderId,
      },
    })

    if (!slide) {
      return res.status(404).json({ error: "Slide not found" })
    }

    const errors = validateSlideInput(
      {
        imageUrl: payload.imageUrl ?? slide.imageUrl,
        title: payload.title ?? slide.title,
        ctaUrl: payload.ctaUrl,
        overlayOpacity: payload.overlayOpacity,
      },
      { partial: true },
    )
    if (errors.length) {
      return res.status(400).json({ error: errors[0], details: errors })
    }

    applySlideFields(slide, payload)
    await slide.save()
    res.json(slide)
  } catch (error) {
    console.error("Error updating slide:", error)
    res.status(500).json({ error: "Failed to update slide" })
  }
})

router.delete("/sliders/:sliderId/slides/:slideId", async (req, res) => {
  try {
    const { sliderId, slideId } = req.params
    const shop = req.shop

    const slider = await findShopSlider(sliderId, shop)
    if (!slider) {
      return res.status(404).json({ error: "Slider not found" })
    }

    const slide = await Slide.findOne({
      where: {
        id: slideId,
        SliderId: sliderId,
      },
    })

    if (!slide) {
      return res.status(404).json({ error: "Slide not found" })
    }

    await slide.destroy()
    res.status(204).end()
  } catch (error) {
    console.error("Error deleting slide:", error)
    res.status(500).json({ error: "Failed to delete slide" })
  }
})

export default router
