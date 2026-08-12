/**
 * After OAuth: register webhooks, upsert shop identity, notify portal install.
 * Only mints a new install event_id when the shop is not currently installed
 * (first install or reinstall after uninstall). OAuth re-entry reuses the same id.
 */
import { ensureShopIdentity, notifyPortalInstall } from "../utils/shopAffiliate.js"
import { ensureWebhooksRegistered } from "../utils/registerWebhooks.js"

export async function afterAuth(req, res, next) {
  try {
    const session = res.locals.shopify?.session
    if (!session) {
      return next()
    }

    try {
      await ensureWebhooksRegistered(session, { force: true })
    } catch (error) {
      console.warn("registerWebhooks failed:", error?.message || error)
    }

    try {
      const row = await ensureShopIdentity(session)
      if (row) {
        const { result } = await notifyPortalInstall(row, { status: "installed" })
        if (result && !result.ok && result.outcome !== "duplicate") {
          console.warn("portal install notify failed:", result.errorMessage || result.outcome)
        }
      }
    } catch (error) {
      console.warn("afterAuth shop/portal setup failed:", error?.message || error)
    }
  } catch (error) {
    console.warn("afterAuth error:", error?.message || error)
  }

  return next()
}
