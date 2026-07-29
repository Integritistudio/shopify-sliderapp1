/**
 * Outbound webhooks to the Shopify App Management Portal.
 *
 * Env:
 *   PORTAL_WEBHOOK_BASE_URL  e.g. https://portal.example.com
 *   PORTAL_WEBHOOK_SECRET    shared secret → X-Webhook-Secret
 */

const DEFAULT_TIMEOUT_MS = 5000

export function isPortalConfigured() {
  return Boolean(
    String(process.env.PORTAL_WEBHOOK_BASE_URL || "").trim() &&
      String(process.env.PORTAL_WEBHOOK_SECRET || "").trim(),
  )
}

/**
 * Common shop fields required by every portal topic.
 */
export function buildShopContext({ shopDomain, shopifyShopId, shopName }) {
  const shop_url = String(shopDomain || "")
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
  return {
    shopify_shop_id: shopifyShopId || `gid://shopify/Shop/unknown`,
    shop_name: shopName || shop_url || "Unknown shop",
    shop_url,
  }
}

/**
 * POST to portal topic endpoint.
 * @param {"install"|"uninstall"|"affiliate-code"|"billing"} topic
 * @param {object} payload
 * @param {string} [eventId]
 * @returns {Promise<{ ok: boolean, status: number, body: any, conflict?: boolean }>}
 */
export async function postPortal(topic, payload, eventId) {
  const base = String(process.env.PORTAL_WEBHOOK_BASE_URL || "")
    .trim()
    .replace(/\/$/, "")
  const webhookBase = base.endsWith("/webhooks/shopify") ? base : `${base}/webhooks/shopify`
  const secret = String(process.env.PORTAL_WEBHOOK_SECRET || "").trim()

  if (!base || !secret) {
    console.warn(`[portal] skipped ${topic}: portal env not configured`)
    return { ok: false, status: 0, body: { error: "portal_not_configured" } }
  }

  const url = `${webhookBase}/${topic}`
  const body = {
    ...payload,
    ...(eventId ? { event_id: eventId } : {}),
  }

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS)

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Webhook-Secret": secret,
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    })

    let parsed = null
    const text = await response.text()
    try {
      parsed = text ? JSON.parse(text) : null
    } catch {
      parsed = { raw: text }
    }

    const conflict = response.status === 409
    if (!response.ok) {
      console.warn(`[portal] ${topic} → ${response.status}`, parsed)
    } else {
      console.log(`[portal] ${topic} → ${response.status} ok`)
    }

    return {
      ok: response.ok,
      status: response.status,
      body: parsed,
      conflict,
    }
  } catch (error) {
    console.error(`[portal] ${topic} failed:`, error?.message || error)
    return { ok: false, status: 0, body: { error: error?.message || "request_failed" } }
  } finally {
    clearTimeout(timer)
  }
}

/** Fire-and-forget wrapper that never throws. */
export function notifyPortal(topic, payload, eventId) {
  return postPortal(topic, payload, eventId).catch((err) => {
    console.error(`[portal] notify ${topic} error:`, err?.message || err)
    return { ok: false, status: 0, body: { error: err?.message || "notify_failed" } }
  })
}

export function installEventId(shopifyShopId, isoTimestamp = new Date().toISOString()) {
  const id = String(shopifyShopId || "unknown").replace(/^gid:\/\/shopify\/Shop\//, "")
  return `install-${id}-${isoTimestamp}`
}

export function uninstallEventId(shopifyShopId, isoTimestamp = new Date().toISOString()) {
  const id = String(shopifyShopId || "unknown").replace(/^gid:\/\/shopify\/Shop\//, "")
  return `uninstall-${id}-${isoTimestamp}`
}

export function affiliateEventId(shopifyShopId, code) {
  const id = String(shopifyShopId || "unknown").replace(/^gid:\/\/shopify\/Shop\//, "")
  const safe = String(code || "")
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9_-]/g, "")
  return `affcode-${id}-${safe}`
}

export function billingEventId(prefix, subscriptionOrPaymentId) {
  const id = String(subscriptionOrPaymentId || "unknown").replace(/^gid:\/\/shopify\//, "").replace(/\//g, "-")
  return `${prefix}-${id}`
}
