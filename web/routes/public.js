import express from "express"
import { Slider, Slide, AnalyticsEvent } from "../models/index.js"
import { corsHeaders } from "../middleware/cors.js"
import { mergeSliderSettings, SLIDE_ATTRIBUTES } from "../utils/sliderDefaults.js"
import { normalizeShopDomain } from "../utils/validation.js"
import { getCachedShopPlan, evaluatePlacement } from "../utils/shopPlanCache.js"

const router = express.Router()

const rateBuckets = new Map()

function rateLimitPublic(req, res, next) {
  const key = `${req.ip}:${req.path}`
  const now = Date.now()
  const windowMs = 60_000
  const max = 120
  const bucket = rateBuckets.get(key) || { count: 0, start: now }
  if (now - bucket.start > windowMs) {
    bucket.count = 0
    bucket.start = now
  }
  bucket.count += 1
  rateBuckets.set(key, bucket)
  if (bucket.count > max) {
    return res.status(429).json({ error: "Too many requests" })
  }
  next()
}

router.get("/api/public/slider/:sliderId", corsHeaders, rateLimitPublic, async (req, res) => {
  try {
    const { sliderId } = req.params
    const shop = normalizeShopDomain(req.query.shop)

    if (!shop) {
      return res.status(400).json({ error: "Missing required shop query parameter" })
    }

    const slider = await Slider.findOne({
      where: {
        id: sliderId,
        shop,
        status: "published",
      },
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

    const pageType = String(req.query.pageType || req.query.page_type || "").trim()
    const cachedPlan = await getCachedShopPlan(shop)
    const placement = evaluatePlacement(cachedPlan, pageType)

    const data = slider.get({ plain: true })
    const visibleSlides = (data.slides || []).filter((slide) => slide.isVisible !== false)

    res.json({
      id: data.id,
      name: data.name,
      sliderType: data.sliderType,
      settings: mergeSliderSettings(data.sliderType, data.settings || {}),
      slides: placement.allowed ? visibleSlides : [],
      plan: {
        planId: cachedPlan.planId,
        name: cachedPlan.plan?.name,
        placementAnyPage: cachedPlan.placementAnyPage,
        allowedPageTypes: cachedPlan.allowedPageTypes,
        placementLabel: cachedPlan.plan?.placementLabel,
        placementAllowedSummary: cachedPlan.plan?.placementAllowedSummary,
        placementBlockedSummary: cachedPlan.plan?.placementBlockedSummary,
        pricingUrl: cachedPlan.pricingUrl,
      },
      placement: {
        allowed: placement.allowed,
        pageType: placement.pageType,
        reason: placement.reason,
      },
    })
  } catch (error) {
    console.error("Error fetching public slider:", error)
    res.status(500).json({ error: "Failed to fetch slider" })
  }
})

router.post("/api/public/events", corsHeaders, rateLimitPublic, async (req, res) => {
  try {
    const shop = normalizeShopDomain(req.body?.shop || req.query.shop)
    const sliderId = Number.parseInt(req.body?.sliderId, 10)
    const slideId = req.body?.slideId != null ? Number.parseInt(req.body.slideId, 10) : null
    const eventType = String(req.body?.type || "").trim()

    if (!shop || !sliderId || !["view", "cta_click"].includes(eventType)) {
      return res.status(400).json({ error: "shop, sliderId, and type (view|cta_click) are required" })
    }

    const slider = await Slider.findOne({
      where: { id: sliderId, shop, status: "published" },
      attributes: ["id"],
    })
    if (!slider) {
      return res.status(404).json({ error: "Slider not found" })
    }

    if (slideId != null && !Number.isNaN(slideId)) {
      const slide = await Slide.findOne({
        where: { id: slideId, SliderId: sliderId },
        attributes: ["id"],
      })
      if (!slide) {
        return res.status(404).json({ error: "Slide not found" })
      }
    }

    await AnalyticsEvent.create({
      shop,
      sliderId,
      slideId: Number.isFinite(slideId) ? slideId : null,
      eventType,
    })

    res.status(204).end()
  } catch (error) {
    console.error("Error recording public event:", error)
    res.status(500).json({ error: "Failed to record event" })
  }
})

export default router
