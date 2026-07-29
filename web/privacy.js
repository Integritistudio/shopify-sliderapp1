/**
 * Shopify inbound webhook handlers: privacy + app lifecycle + subscriptions.
 */
import { DeliveryMethod } from "@shopify/shopify-api"
import { Slider } from "./models/index.js"
import shopify from "./shopify.js"
import {
  getShopAffiliate,
  upsertShopAffiliate,
  normalizeShopDomain,
} from "./utils/shopAffiliate.js"
import {
  buildShopContext,
  notifyPortal,
  uninstallEventId,
} from "./utils/portalWebhook.js"
import { upsertShopPlanCache } from "./utils/shopPlanCache.js"
import { handleSubscriptionUpdate } from "./utils/subscriptionBilling.js"

/**
 * @type {{[key: string]: import("@shopify/shopify-api").WebhookHandler}}
 */
export default {
  CUSTOMERS_DATA_REQUEST: {
    deliveryMethod: DeliveryMethod.Http,
    callbackUrl: "/api/webhooks",
    callback: async (topic, shop, body, webhookId) => {
      const payload = JSON.parse(body)
      console.log("CUSTOMERS_DATA_REQUEST received:", payload)
      console.log(`Customer data request for ${payload.customer?.email} in shop ${payload.shop_domain}`)
    },
  },

  CUSTOMERS_REDACT: {
    deliveryMethod: DeliveryMethod.Http,
    callbackUrl: "/api/webhooks",
    callback: async (topic, shop, body, webhookId) => {
      const payload = JSON.parse(body)
      console.log("CUSTOMERS_REDACT received:", payload)
      console.log(`Redacting customer ${payload.customer?.email} in shop ${payload.shop_domain}`)
    },
  },

  SHOP_REDACT: {
    deliveryMethod: DeliveryMethod.Http,
    callbackUrl: "/api/webhooks",
    callback: async (topic, shop, body, webhookId) => {
      const payload = JSON.parse(body)
      console.log("SHOP_REDACT received:", payload)

      const shopDomain = payload.shop_domain

      try {
        // Delete merchant content only — do NOT clear ShopAffiliates (referral lock survives)
        const deletedCount = await Slider.destroy({
          where: { shop: shopDomain },
          cascade: true,
        })

        console.log(`Deleted ${deletedCount} sliders for shop ${shopDomain}`)
      } catch (error) {
        console.error("Error redacting shop data:", error)
      }
    },
  },

  APP_UNINSTALLED: {
    deliveryMethod: DeliveryMethod.Http,
    callbackUrl: "/api/webhooks",
    callback: async (topic, shop, body, webhookId) => {
      const payload = JSON.parse(body)
      const shopDomain = normalizeShopDomain(shop || payload.myshopify_domain || payload.domain)
      console.log("APP_UNINSTALLED received:", shopDomain, webhookId)

      try {
        let row = await getShopAffiliate(shopDomain)
        if (!row && shopDomain) {
          row = await upsertShopAffiliate(shopDomain, {
            shopName: payload.name || null,
            shopifyShopId: payload.admin_graphql_api_id || null,
          })
        }

        if (row) {
          const ctx = buildShopContext({
            shopDomain: row.shop,
            shopifyShopId: row.shopifyShopId || payload.admin_graphql_api_id,
            shopName: row.shopName || payload.name,
          })
          await notifyPortal("uninstall", ctx, uninstallEventId(ctx.shopify_shop_id, new Date().toISOString()))
        }

        // Reset plan cache to free; keep affiliate row intact
        if (shopDomain) {
          await upsertShopPlanCache(shopDomain, "free").catch(() => {})
        }

        // Clear OAuth sessions for this shop
        try {
          const sessions = await shopify.config.sessionStorage.findSessionsByShop(shopDomain)
          if (sessions?.length) {
            const ids = sessions.map((s) => s.id).filter(Boolean)
            if (ids.length) {
              await shopify.config.sessionStorage.deleteSessions(ids)
            }
          }
        } catch (sessionErr) {
          console.warn("APP_UNINSTALLED session cleanup failed:", sessionErr?.message || sessionErr)
        }
      } catch (error) {
        console.error("APP_UNINSTALLED handler error:", error)
      }
    },
  },

  APP_SUBSCRIPTIONS_UPDATE: {
    deliveryMethod: DeliveryMethod.Http,
    callbackUrl: "/api/webhooks",
    callback: async (topic, shop, body, webhookId) => {
      const payload = JSON.parse(body)
      console.log("APP_SUBSCRIPTIONS_UPDATE received:", shop, webhookId)

      try {
        const appSubscription = payload.app_subscription || payload
        await handleSubscriptionUpdate({
          shopDomain: shop,
          appSubscription,
          webhookId,
        })
      } catch (error) {
        console.error("APP_SUBSCRIPTIONS_UPDATE handler error:", error)
      }
    },
  },
}
