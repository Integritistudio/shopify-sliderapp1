/**
 * After OAuth: register webhooks, upsert shop identity, notify portal install.
 */
import shopify from "../shopify.js"
import { ensureShopIdentity, notifyPortalInstall } from "../utils/shopAffiliate.js"

export async function afterAuth(req, res, next) {
  try {
    const session = res.locals.shopify?.session
    if (!session) {
      return next()
    }

    try {
      await shopify.registerWebhooks({ session })
    } catch (error) {
      console.warn("registerWebhooks failed:", error?.message || error)
    }

    try {
      const row = await ensureShopIdentity(session)
      if (row) {
        // Fire-and-forget install enrollment
        notifyPortalInstall(row, { status: "installed" }).catch((err) => {
          console.warn("portal install notify failed:", err?.message || err)
        })
      }
    } catch (error) {
      console.warn("afterAuth shop/portal setup failed:", error?.message || error)
    }
  } catch (error) {
    console.warn("afterAuth error:", error?.message || error)
  }

  return next()
}
