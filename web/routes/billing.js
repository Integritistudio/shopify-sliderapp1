import express from "express"
import { Slider } from "../models/index.js"
import { extractShop } from "../middleware/auth.js"
import { resolveShopPlan } from "../utils/resolveShopPlan.js"
import { upsertShopPlanCache } from "../utils/shopPlanCache.js"

const router = express.Router()

router.use(extractShop)

/**
 * GET /api/billing/plan
 * Returns the merchant's current plan, usage, and Managed Pricing URL.
 * Optional query: plan_handle (from Shopify welcome redirect after plan selection).
 */
router.get("/billing/plan", async (req, res) => {
  try {
    const session = res.locals.shopify?.session
    const shop = req.shop
    const planHandleHint = req.query.plan_handle || req.query.planHandle || null

    const resolved = await resolveShopPlan(session, { planHandleHint })
    if (shop) {
      await upsertShopPlanCache(shop, resolved.planId).catch((err) => {
        console.warn("ShopPlan cache update failed:", err?.message || err)
      })
    }
    const sliderCount = shop ? await Slider.count({ where: { shop } }) : 0

    res.json({
      planId: resolved.planId,
      plan: resolved.plan,
      limits: resolved.limits,
      usage: { sliderCount },
      pricingUrl: resolved.pricingUrl,
      subscriptionName: resolved.subscriptionName,
    })
  } catch (error) {
    console.error("Error fetching billing plan:", error)
    res.status(500).json({ error: "Failed to resolve subscription plan" })
  }
})

export default router
