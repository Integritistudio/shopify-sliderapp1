import express from "express"
import { sequelize } from "../config/database.js"
import { Op } from "sequelize"
import { BrandKit, ShopOnboarding, Slider, Slide, AnalyticsEvent } from "../models/index.js"
import { extractShop } from "../middleware/auth.js"

const router = express.Router()

router.use(extractShop)

const DEFAULT_BRAND = {
  textColor: "#ffffff",
  buttonBg: "#1a2f4a",
  buttonTextColor: "#ffffff",
  overlayColor: "#000000",
  overlayOpacity: 0.35,
  borderRadius: 12,
  fontNote: "",
}

router.get("/brand-kit", async (req, res) => {
  try {
    const [kit] = await BrandKit.findOrCreate({
      where: { shop: req.shop },
      defaults: { shop: req.shop, ...DEFAULT_BRAND },
    })
    res.json(kit)
  } catch (error) {
    console.error("Error fetching brand kit:", error)
    res.status(500).json({ error: "Failed to fetch brand kit" })
  }
})

router.put("/brand-kit", async (req, res) => {
  try {
    const [kit] = await BrandKit.findOrCreate({
      where: { shop: req.shop },
      defaults: { shop: req.shop, ...DEFAULT_BRAND },
    })

    const fields = [
      "textColor",
      "buttonBg",
      "buttonTextColor",
      "overlayColor",
      "overlayOpacity",
      "borderRadius",
      "fontNote",
    ]
    for (const field of fields) {
      if (req.body[field] !== undefined) kit[field] = req.body[field]
    }
    await kit.save()
    res.json(kit)
  } catch (error) {
    console.error("Error saving brand kit:", error)
    res.status(500).json({ error: "Failed to save brand kit" })
  }
})

router.get("/onboarding", async (req, res) => {
  try {
    const shop = req.shop
    const [row] = await ShopOnboarding.findOrCreate({
      where: { shop },
      defaults: { shop },
    })

    const sliderCount = await Slider.count({ where: { shop } })
    const sliderIds = (
      await Slider.findAll({ where: { shop }, attributes: ["id"], raw: true })
    ).map((s) => s.id)
    const slideCount = sliderIds.length
      ? await Slide.count({ where: { SliderId: { [Op.in]: sliderIds } } })
      : 0
    const publishedCount = await Slider.count({ where: { shop, status: "published" } })

    if (sliderCount > 0 && !row.createdSlider) row.createdSlider = true
    if (slideCount > 0 && !row.addedSlide) row.addedSlide = true
    if (publishedCount > 0 && !row.publishedSlider) row.publishedSlider = true
    await row.save()

    res.json(row)
  } catch (error) {
    console.error("Error fetching onboarding:", error)
    res.status(500).json({ error: "Failed to fetch onboarding" })
  }
})

router.put("/onboarding", async (req, res) => {
  try {
    const [row] = await ShopOnboarding.findOrCreate({
      where: { shop: req.shop },
      defaults: { shop: req.shop },
    })
    for (const key of ["createdSlider", "addedSlide", "publishedSlider", "embeddedTheme", "dismissed"]) {
      if (req.body[key] !== undefined) row[key] = Boolean(req.body[key])
    }
    await row.save()
    res.json(row)
  } catch (error) {
    console.error("Error updating onboarding:", error)
    res.status(500).json({ error: "Failed to update onboarding" })
  }
})

router.get("/sliders/:id/metrics", async (req, res) => {
  try {
    const shop = req.shop
    const sliderId = Number.parseInt(req.params.id, 10)
    const slider = await Slider.findOne({ where: { id: sliderId, shop } })
    if (!slider) return res.status(404).json({ error: "Slider not found" })

    const events = await AnalyticsEvent.findAll({
      where: { shop, sliderId },
      attributes: [
        "slideId",
        "eventType",
        [sequelize.fn("COUNT", sequelize.col("id")), "count"],
      ],
      group: ["slideId", "eventType"],
      raw: true,
    })

    let views = 0
    let ctaClicks = 0
    const bySlide = {}

    for (const row of events) {
      const count = Number(row.count) || 0
      const slideKey = row.slideId == null ? "slider" : String(row.slideId)
      if (!bySlide[slideKey]) bySlide[slideKey] = { views: 0, ctaClicks: 0 }
      if (row.eventType === "view") {
        views += count
        bySlide[slideKey].views += count
      }
      if (row.eventType === "cta_click") {
        ctaClicks += count
        bySlide[slideKey].ctaClicks += count
      }
    }

    res.json({
      sliderId,
      views,
      ctaClicks,
      ctr: views ? Number(((ctaClicks / views) * 100).toFixed(2)) : 0,
      bySlide,
    })
  } catch (error) {
    console.error("Error fetching metrics:", error)
    res.status(500).json({ error: "Failed to fetch metrics" })
  }
})

router.get("/metrics/summary", async (req, res) => {
  try {
    const shop = req.shop
    const views = await AnalyticsEvent.count({ where: { shop, eventType: "view" } })
    const ctaClicks = await AnalyticsEvent.count({ where: { shop, eventType: "cta_click" } })
    res.json({
      views,
      ctaClicks,
      ctr: views ? Number(((ctaClicks / views) * 100).toFixed(2)) : 0,
    })
  } catch (error) {
    console.error("Error fetching metrics summary:", error)
    res.status(500).json({ error: "Failed to fetch metrics summary" })
  }
})

export default router
