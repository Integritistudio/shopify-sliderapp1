import { ShopPlan } from "../models/index.js"
import {
  getPlan,
  buildManagedPricingUrl,
  publicPlanPayload,
  canPlaceOnPageType,
  normalizePageType,
} from "./plans.js"

export async function upsertShopPlanCache(shop, planId) {
  if (!shop) return null
  const plan = getPlan(planId)
  const [row] = await ShopPlan.findOrCreate({
    where: { shop },
    defaults: {
      shop,
      planId: plan.id,
      placementAnyPage: Boolean(plan.placementAnyPage),
    },
  })
  row.planId = plan.id
  row.placementAnyPage = Boolean(plan.placementAnyPage)
  await row.save()
  return row
}

/**
 * Storefront plan lookup — defaults to Free (homepage only) when unknown.
 */
export async function getCachedShopPlan(shop) {
  const pricingUrl = buildManagedPricingUrl(shop)
  if (!shop) {
    return {
      planId: "free",
      placementAnyPage: false,
      allowedPageTypes: getPlan("free").allowedPageTypes,
      pricingUrl,
      plan: publicPlanPayload("free"),
    }
  }

  try {
    const row = await ShopPlan.findOne({ where: { shop } })
    if (row) {
      const plan = getPlan(row.planId)
      return {
        planId: plan.id,
        // Always derive from plan config so Standard/Pro stay unrestricted
        placementAnyPage: Boolean(plan.placementAnyPage),
        allowedPageTypes: plan.allowedPageTypes,
        pricingUrl,
        plan: publicPlanPayload(plan.id),
      }
    }
  } catch (error) {
    console.warn("getCachedShopPlan failed:", error?.message || error)
  }

  const free = getPlan("free")
  return {
    planId: free.id,
    placementAnyPage: false,
    allowedPageTypes: free.allowedPageTypes,
    pricingUrl,
    plan: publicPlanPayload("free"),
  }
}

export function isHomepagePageType(pageType) {
  return normalizePageType(pageType) === "index"
}

/**
 * Storefront placement check for a cached shop plan + page type.
 * When pageType is missing, Free is deferred (CDN uses path fallback).
 */
export function evaluatePlacement(cachedPlan, pageType) {
  const planId = cachedPlan?.planId || "free"
  const type = normalizePageType(pageType)

  if (cachedPlan?.placementAnyPage) {
    return { allowed: true, reason: null, pageType: type || null }
  }

  // Free + known non-home page → block
  if (type) {
    const result = canPlaceOnPageType(planId, type, { unknown: "deny" })
    return { ...result, pageType: type }
  }

  // Unknown page type: allow payload; CDN enforces with homepage path fallback
  return { allowed: true, reason: null, pageType: null }
}

export { canPlaceOnPageType, normalizePageType }
