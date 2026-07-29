/**
 * Map Managed Pricing APP_SUBSCRIPTIONS_UPDATE → portal billing events.
 *
 * Note: quiet monthly renewals often do NOT fire this webhook; lifecycle
 * (activate / change / cancel / decline) is what we report here.
 * payment_cancelled is supported by the portal contract but has no reliable
 * Managed Pricing trigger — do not synthesize it.
 */
import {
  sendSubscriptionActivated,
  sendPlanChanged,
  sendPaymentCompleted,
  sendSubscriptionCancelled,
  sendPaymentDeclined,
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
  const ctx = {
    shopDomain: shop || row?.shop,
    shopifyShopId: shopifyShopId || row?.shopifyShopId,
    shopName: row?.shopName,
  }

  const billingFields = {
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
      await sendPlanChanged(
        ctx,
        {
          ...billingFields,
          previous_shopify_plan_id: previousPlanId,
        },
        billingEventId("plan-change", subscriptionId, webhookId),
      )
    } else {
      await sendSubscriptionActivated(
        ctx,
        billingFields,
        billingEventId("sub-activated", subscriptionId, webhookId),
      )
    }

    // Report payment on activation / paid plan change (not silent renewals)
    if (amount != null && amount > 0) {
      await sendPaymentCompleted(
        ctx,
        {
          ...billingFields,
          shopify_payment_id: subscriptionId
            ? `${subscriptionId}/charge/${webhookId || sub.updated_at || "activation"}`
            : undefined,
        },
        billingEventId("pay-completed", subscriptionId, webhookId || sub.updated_at),
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
    await sendSubscriptionCancelled(
      ctx,
      billingFields,
      billingEventId("sub-cancelled", subscriptionId, webhookId),
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
    await sendPaymentDeclined(
      ctx,
      {
        ...billingFields,
        shopify_payment_id: subscriptionId
          ? `${subscriptionId}/declined/${webhookId || sub.updated_at || "x"}`
          : undefined,
      },
      billingEventId("pay-declined", subscriptionId, webhookId),
    )
    if (row) {
      await upsertShopAffiliate(shop, {
        lastPlanId: previousPlanId || "free",
        lastSubscriptionId: subscriptionId,
      })
    }
  }
}

// Re-export buildShopContext for callers that previously imported it here
export { buildShopContext } from "./portalWebhook.js"
