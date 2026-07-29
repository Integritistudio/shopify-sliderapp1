import express from "express"
import { Slider } from "../models/index.js"
import { extractShop } from "../middleware/auth.js"
import { resolveShopPlan } from "../utils/resolveShopPlan.js"
import { upsertShopPlanCache } from "../utils/shopPlanCache.js"
import {
  ensureShopIdentity,
  getShopAffiliate,
  isAffiliateLocked,
  applyAffiliateCode,
  upsertShopAffiliate,
} from "../utils/shopAffiliate.js"

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
      // Keep shop identity warm for portal webhooks / affiliate
      if (session) {
        await ensureShopIdentity(session)
          .then(async (row) => {
            if (!row) return
            await upsertShopAffiliate(shop, {
              lastPlanId: resolved.planId,
              lastSubscriptionId: resolved.subscriptionId || row.lastSubscriptionId,
            })
          })
          .catch((err) => {
            console.warn("Shop identity upsert failed:", err?.message || err)
          })
      }
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

/**
 * GET /api/billing/affiliate
 */
router.get("/billing/affiliate", async (req, res) => {
  try {
    const session = res.locals.shopify?.session
    const shop = req.shop
    if (!shop) {
      return res.status(400).json({ error: "Shop required" })
    }

    let row = await getShopAffiliate(shop)
    if (session) {
      row = (await ensureShopIdentity(session)) || row
    }

    res.json({
      affiliateCode: row?.affiliateCode || null,
      locked: isAffiliateLocked(row),
    })
  } catch (error) {
    console.error("Error fetching affiliate:", error)
    res.status(500).json({ error: "Failed to load affiliate status" })
  }
})

/**
 * POST /api/billing/affiliate
 * Body: { affiliateCode: string }
 * One-time: after success (or portal 409 conflict), no further codes accepted — including after reinstall.
 */
router.post("/billing/affiliate", async (req, res) => {
  try {
    const session = res.locals.shopify?.session
    const shop = req.shop
    if (!shop || !session) {
      return res.status(400).json({ error: "Shop session required" })
    }

    const row = await ensureShopIdentity(session)
    if (!row) {
      return res.status(400).json({ error: "Could not resolve shop identity" })
    }

    const result = await applyAffiliateCode(row, req.body?.affiliateCode || req.body?.affiliate_code)
    if (!result.ok) {
      return res.status(result.status || 400).json({
        error: result.error,
        code: result.code,
        affiliateCode: result.affiliateCode || null,
        locked: Boolean(result.locked),
      })
    }

    res.json({
      success: true,
      affiliateCode: result.affiliateCode,
      locked: true,
    })
  } catch (error) {
    console.error("Error applying affiliate:", error)
    res.status(500).json({ error: "Failed to apply affiliate code" })
  }
})

export default router
