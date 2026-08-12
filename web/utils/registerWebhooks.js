import shopify from "../shopify.js"

const webhookRegisterAt = new Map()

/**
 * Best-effort Shopify webhook re-register (throttled).
 * Local/tunnel URLs change often; opening the app refreshes subscriptions.
 */
export async function ensureWebhooksRegistered(session, { force = false } = {}) {
  if (!session?.shop) return null
  const last = webhookRegisterAt.get(session.shop) || 0
  if (!force && Date.now() - last < 5 * 60 * 1000) {
    return { skipped: true, reason: "throttled" }
  }
  const results = await shopify.registerWebhooks({ session })
  webhookRegisterAt.set(session.shop, Date.now())
  console.log(
    `[webhooks] register for ${session.shop}:`,
    JSON.stringify(results || { ok: true }),
  )
  return { ok: true, results: results || null }
}
