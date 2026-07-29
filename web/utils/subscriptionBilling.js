/**
 * Map Managed Pricing APP_SUBSCRIPTIONS_UPDATE → portal billing events.
 *
 * Note: quiet monthly renewals often do NOT fire this webhook; lifecycle
 * (activate / change / cancel / decline) is what we report here.
 */
import {
  buildShopContext,
  notifyPortal,
  billingEventId,
} from "./portalWebhook.js"
import { mapShopifyHandleToPlanId } from "./plans.js"
import { upsertShopPlanCache } from "./shopPlanCache.js"
import {
  upsertShopAffiliate,
  normalizeShopDomain,
  getShopAffiliate,
} from "./shopAffiliate.js"

function parseAmount(price) {
  if (price == null || price === "") return undefined
  const n = Number.parseFloat(String(price))
  return Number.isFinite(n) ? n : undefined
}

function planIdFromSubscription(sub) {
  return (
    mapShopifyHandleToPlanId(sub?.plan_handle) ||
    mapShopifyHandleToPlanId(sub?.name) ||
    null
  )
}

/**
 * @param {object} params
 * @param {string} params.shopDomain
 * @param {object} params.appSubscription - Shopify webhook app_subscription object
 * @param {string} [params.webhookId]
 */
export async function handleSubscriptionUpdate({ shopDomain, appSubscription, webhookId }) {
  const sub = appSubscription || {}
  const shop = normalizeShopDomain(shopDomain)
  const shopifyShopId = sub.admin_graphql_api_shop_id || null
  const subscriptionId = sub.admin_graphql_api_id || null
  const status = String(sub.status || "").toUpperCase()
  const planId = planIdFromSubscription(sub) || "free"
  const amount = parseAmount(sub.price)
  const currency = sub.currency || "USD"

  let row = shop ? await getShopAffiliate(shop) : null
  if (shop) {
    row = await upsertShopAffiliate(shop, {
      shopifyShopId: shopifyShopId || row?.shopifyShopId,
      shopName: row?.shopName,
    })
  }

  const previousPlanId = row?.lastPlanId || null
  const ctx = buildShopContext({
    shopDomain: shop || row?.shop,
    shopifyShopId: shopifyShopId || row?.shopifyShopId,
    shopName: row?.shopName,
  })

  const baseBilling = {
    ...ctx,
    shopify_subscription_id: subscriptionId || undefined,
    shopify_plan_id: planId,
    amount,
    currency,
  }

  // Refresh local plan cache for storefront
  if (shop) {
    const cachePlan =
      status === "ACTIVE" || status === "ACCEPTED" ? planId : "free"
    await upsertShopPlanCache(shop, cachePlan).catch((err) => {
      console.warn("ShopPlan cache from subscription webhook failed:", err?.message || err)
    })
  }

  if (status === "ACTIVE" || status === "ACCEPTED") {
    const planChanged =
      previousPlanId && previousPlanId !== planId && previousPlanId !== "free"

    if (planChanged) {
      await notifyPortal(
        "billing",
        {
          ...baseBilling,
          event_type: "plan_changed",
          previous_shopify_plan_id: previousPlanId,
        },
        billingEventId(`plan-change-${webhookId || "x"}`, subscriptionId),
      )
    } else {
      await notifyPortal(
        "billing",
        {
          ...baseBilling,
          event_type: "subscription_activated",
        },
        billingEventId(`sub-activated-${webhookId || "x"}`, subscriptionId),
      )
    }

    // Report payment on activation / paid plan change (not silent renewals)
    if (amount != null && amount > 0) {
      await notifyPortal(
        "billing",
        {
          ...baseBilling,
          event_type: "payment_completed",
          shopify_payment_id: subscriptionId
            ? `${subscriptionId}/charge/${sub.updated_at || webhookId || Date.now()}`
            : undefined,
        },
        billingEventId(`pay-completed-${webhookId || sub.updated_at || "x"}`, subscriptionId),
      )
    }

    if (row) {
      await upsertShopAffiliate(shop, {
        lastPlanId: planId,
        lastSubscriptionId: subscriptionId,
        shopifyShopId: shopifyShopId || row.shopifyShopId,
      })
    }
    return
  }

  if (status === "CANCELLED" || status === "EXPIRED") {
    await notifyPortal(
      "billing",
      {
        ...baseBilling,
        event_type: "subscription_cancelled",
      },
      billingEventId(`sub-cancelled-${webhookId || "x"}`, subscriptionId),
    )
    if (row) {
      await upsertShopAffiliate(shop, {
        lastPlanId: "free",
        lastSubscriptionId: subscriptionId,
      })
    }
    return
  }

  if (status === "DECLINED" || status === "FROZEN") {
    await notifyPortal(
      "billing",
      {
        ...baseBilling,
        event_type: "payment_declined",
        shopify_payment_id: subscriptionId
          ? `${subscriptionId}/declined/${webhookId || sub.updated_at || Date.now()}`
          : undefined,
      },
      billingEventId(`pay-declined-${webhookId || "x"}`, subscriptionId),
    )
    if (row) {
      await upsertShopAffiliate(shop, {
        lastPlanId: previousPlanId || "free",
        lastSubscriptionId: subscriptionId,
      })
    }
  }
}
