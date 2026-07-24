/**
 * Resolve the merchant's active Managed Pricing plan from Shopify Admin GraphQL.
 */
import shopify from "../shopify.js"
import {
  getPlan,
  mapShopifyHandleToPlanId,
  publicPlanPayload,
  getPlanLimits,
  buildManagedPricingUrl,
} from "./plans.js"

const ACTIVE_STATUSES = new Set(["ACTIVE", "ACCEPTED", "active", "accepted"])

const SUBSCRIPTIONS_QUERY = `#graphql
  query SlideEaseActiveSubscriptions {
    currentAppInstallation {
      activeSubscriptions {
        name
        status
        test
      }
    }
  }
`

/**
 * @param {import('@shopify/shopify-api').Session} session
 * @param {{ planHandleHint?: string | null }} [options]
 * @returns {Promise<{ planId: string, plan: object, limits: object, pricingUrl: string | null, subscriptionName: string | null }>}
 */
export async function resolveShopPlan(session, options = {}) {
  const shop = session?.shop || ""
  const pricingUrl = buildManagedPricingUrl(shop)

  const hint = options.planHandleHint
  if (hint) {
    const fromHint = mapShopifyHandleToPlanId(hint)
    if (fromHint) {
      return {
        planId: fromHint,
        plan: publicPlanPayload(fromHint),
        limits: getPlanLimits(fromHint),
        pricingUrl,
        subscriptionName: hint,
      }
    }
  }

  let planId = "free"
  let subscriptionName = null

  try {
    if (session) {
      const client = new shopify.api.clients.Graphql({ session })
      const response = await client.request(SUBSCRIPTIONS_QUERY)
      const subs = response?.data?.currentAppInstallation?.activeSubscriptions || []
      const active = subs.filter((sub) => ACTIVE_STATUSES.has(String(sub?.status || "")))

      // Prefer highest tier among active subscriptions
      let bestRank = -1
      for (const sub of active) {
        const mapped = mapShopifyHandleToPlanId(sub?.name)
        if (!mapped) continue
        const rank = mapped === "pro" ? 2 : mapped === "standard" ? 1 : 0
        if (rank > bestRank) {
          bestRank = rank
          planId = mapped
          subscriptionName = sub.name
        }
      }
    }
  } catch (error) {
    console.warn("resolveShopPlan: failed to query subscriptions, defaulting to free", error?.message || error)
    planId = "free"
  }

  return {
    planId,
    plan: publicPlanPayload(planId),
    limits: getPlanLimits(planId),
    pricingUrl,
    subscriptionName,
  }
}

export function getPlanOrFree(planId) {
  return getPlan(planId)
}
