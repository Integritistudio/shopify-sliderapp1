/**
 * Slide Ease → Affiliate Portal outbound webhooks (single contract file).
 *
 * Auth: X-Webhook-Secret from WEBHOOK_SECRET (portal .env), NOT the Shopify
 * app secret and NOT the portal form "App secret" field.
 *
 * Env:
 *   WEBHOOK_SECRET            required shared secret
 *   PORTAL_WEBHOOK_BASE_URL   optional override (default production base)
 *   PORTAL_WEBHOOK_SECRET     legacy alias for WEBHOOK_SECRET
 *
 * Base: https://affiliate.integritistudio.us/webhooks/shopify
 * Topics: install | uninstall | affiliate-code | billing
 */

export const SLIDE_EASE_SHOPIFY_APP_ID = "cf7accda894ac7655919f84a7efd7911"
export const DEFAULT_PORTAL_WEBHOOK_BASE =
  "https://affiliate.integritistudio.us/webhooks/shopify"

const DEFAULT_TIMEOUT_MS = 5000

/** @typedef {"success"|"duplicate"|"duplicateAttribution"|"attributionConflict"|"codeInactive"|"wrongApp"|"affiliateInactive"|"unknownApp"|"validationError"|"unauthorized"|"notConfigured"|"networkError"|"error"} PortalOutcome */

/**
 * Resolve secret: WEBHOOK_SECRET preferred, PORTAL_WEBHOOK_SECRET as legacy alias.
 */
export function getWebhookSecret() {
  return (
    String(process.env.WEBHOOK_SECRET || "").trim() ||
    String(process.env.PORTAL_WEBHOOK_SECRET || "").trim()
  )
}

/**
 * Resolve base URL ending at /webhooks/shopify (no trailing slash after topic).
 */
export function getPortalWebhookBase() {
  const raw = String(process.env.PORTAL_WEBHOOK_BASE_URL || "").trim()
  const base = (raw || DEFAULT_PORTAL_WEBHOOK_BASE).replace(/\/$/, "")
  if (base.endsWith("/webhooks/shopify")) return base
  return `${base}/webhooks/shopify`
}

export function isPortalConfigured() {
  return Boolean(getWebhookSecret())
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
    shopify_app_id: SLIDE_EASE_SHOPIFY_APP_ID,
    shopify_shop_id: shopifyShopId || `gid://shopify/Shop/unknown`,
    shop_name: shopName || shop_url || "Unknown shop",
    shop_url,
  }
}

function shopNumericId(shopifyShopId) {
  return String(shopifyShopId || "unknown").replace(/^gid:\/\/shopify\/Shop\//, "")
}

function resourceToken(gidOrId) {
  return String(gidOrId || "unknown")
    .replace(/^gid:\/\/shopify\//, "")
    .replace(/\//g, "-")
}

export function installEventId(shopifyShopId, isoTimestamp = new Date().toISOString()) {
  return `install-${shopNumericId(shopifyShopId)}-${isoTimestamp}`
}

export function uninstallEventId(shopifyShopId, webhookIdOrIso = new Date().toISOString()) {
  return `uninstall-${shopNumericId(shopifyShopId)}-${webhookIdOrIso}`
}

export function affiliateEventId(shopifyShopId, code) {
  const safe = String(code || "")
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9_-]/g, "")
  return `affcode-${shopNumericId(shopifyShopId)}-${safe}`
}

/**
 * Deterministic billing event_id from webhook + event type + resource.
 */
export function billingEventId(prefix, subscriptionOrPaymentId, webhookId) {
  const id = resourceToken(subscriptionOrPaymentId)
  const wh = webhookId ? `-${String(webhookId)}` : ""
  return `${prefix}-${id}${wh}`
}

/**
 * Classify portal HTTP response into a structured outcome for UI / callers.
 * @returns {{
 *   ok: boolean,
 *   status: number,
 *   body: any,
 *   outcome: PortalOutcome,
 *   conflict?: boolean,
 *   duplicate?: boolean,
 *   duplicateAttribution?: boolean,
 *   errorCode?: string,
 *   errorMessage?: string,
 *   merchantMessage?: string,
 * }}
 */
export function classifyPortalResponse(status, body) {
  const errorCode = body?.error?.code || (typeof body?.error === "string" ? body.error : undefined)
  const errorMessage =
    body?.error?.message ||
    (typeof body?.error === "string" ? body.error : undefined) ||
    undefined

  if (status === 0) {
    return {
      ok: false,
      status: 0,
      body,
      outcome: body?.error === "portal_not_configured" ? "notConfigured" : "networkError",
      errorCode: body?.error || "NETWORK_ERROR",
      errorMessage: errorMessage || "Portal request failed",
      merchantMessage:
        body?.error === "portal_not_configured"
          ? "Affiliate portal is not configured. Contact support."
          : "Could not reach the affiliate portal. Try again shortly.",
    }
  }

  if (status === 401) {
    return {
      ok: false,
      status,
      body,
      outcome: "unauthorized",
      errorCode: errorCode || "UNAUTHORIZED",
      errorMessage: errorMessage || "Unauthorized",
      merchantMessage: "Affiliate service authentication failed. Contact support.",
    }
  }

  if (status === 409) {
    return {
      ok: false,
      status,
      body,
      outcome: "attributionConflict",
      conflict: true,
      errorCode: errorCode || "ATTRIBUTION_CONFLICT",
      errorMessage:
        errorMessage || "This store is already attributed to a different affiliate.",
      merchantMessage:
        "This store is already linked to another partner. The existing affiliation cannot be overwritten.",
    }
  }

  if (status >= 200 && status < 300) {
    if (body?.duplicate === true) {
      return {
        ok: true,
        status,
        body,
        outcome: "duplicate",
        duplicate: true,
        merchantMessage: "Code applied",
      }
    }
    if (body?.duplicateAttribution === true) {
      return {
        ok: true,
        status,
        body,
        outcome: "duplicateAttribution",
        duplicateAttribution: true,
        merchantMessage: "Code applied",
      }
    }
    return {
      ok: true,
      status,
      body,
      outcome: "success",
      merchantMessage: "Code applied",
    }
  }

  // 400 family
  const msg = String(errorMessage || "").toLowerCase()
  if (errorCode === "CODE_INACTIVE" || msg.includes("no longer active")) {
    const isAffiliateInactive =
      errorCode === "APP_ERROR" && msg.includes("affiliate code is no longer active")
    return {
      ok: false,
      status,
      body,
      outcome: isAffiliateInactive || errorCode === "CODE_INACTIVE" ? "codeInactive" : "codeInactive",
      errorCode: errorCode || "CODE_INACTIVE",
      errorMessage: errorMessage || "This affiliate code is no longer active.",
      merchantMessage: "Invalid or inactive code",
    }
  }

  if (
    errorCode === "APP_ERROR" &&
    (msg.includes("does not apply") || msg.includes("selected app"))
  ) {
    return {
      ok: false,
      status,
      body,
      outcome: "wrongApp",
      errorCode: errorCode || "APP_ERROR",
      errorMessage: errorMessage,
      merchantMessage: "Code doesn’t apply to Slide Ease",
    }
  }

  if (errorCode === "APP_ERROR" && msg.includes("unknown shopify app")) {
    return {
      ok: false,
      status,
      body,
      outcome: "unknownApp",
      errorCode: errorCode || "APP_ERROR",
      errorMessage: errorMessage,
      merchantMessage: "App configuration error. Contact support.",
    }
  }

  if (errorCode === "VALIDATION_ERROR" || status === 400) {
    return {
      ok: false,
      status,
      body,
      outcome: "validationError",
      errorCode: errorCode || "VALIDATION_ERROR",
      errorMessage: errorMessage || "Invalid request",
      merchantMessage: errorMessage || "Invalid affiliate code",
    }
  }

  return {
    ok: false,
    status,
    body,
    outcome: "error",
    errorCode: errorCode || "ERROR",
    errorMessage: errorMessage || `Portal returned ${status}`,
    merchantMessage: errorMessage || "Failed to apply affiliate code",
  }
}

/**
 * POST to portal topic endpoint.
 * @param {"install"|"uninstall"|"affiliate-code"|"billing"} topic
 * @param {object} payload
 * @param {string} eventId — always send a stable event_id
 * @param {{ timeoutMs?: number, fetchImpl?: typeof fetch }} [options]
 */
export async function postPortal(topic, payload, eventId, options = {}) {
  const secret = getWebhookSecret()
  const webhookBase = getPortalWebhookBase()
  const fetchImpl = options.fetchImpl || globalThis.fetch
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS

  if (!secret) {
    console.warn(`[portal] skipped ${topic}: WEBHOOK_SECRET not configured`)
    return classifyPortalResponse(0, { error: "portal_not_configured" })
  }

  if (!eventId) {
    console.warn(`[portal] skipped ${topic}: missing event_id`)
    return classifyPortalResponse(400, {
      error: { code: "VALIDATION_ERROR", message: "event_id is required" },
    })
  }

  const url = `${webhookBase}/${topic}`
  const body = {
    shopify_app_id: SLIDE_EASE_SHOPIFY_APP_ID,
    ...payload,
    event_id: eventId,
  }

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const response = await fetchImpl(url, {
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

    if (!response.ok) {
      console.warn(`[portal] ${topic} → ${response.status}`, {
        event_id: eventId,
        code: parsed?.error?.code,
      })
    } else {
      console.log(`[portal] ${topic} → ${response.status} ok`, { event_id: eventId })
    }

    return classifyPortalResponse(response.status, parsed)
  } catch (error) {
    console.error(`[portal] ${topic} failed:`, error?.message || error)
    return classifyPortalResponse(0, { error: error?.message || "request_failed" })
  } finally {
    clearTimeout(timer)
  }
}

/** Fire-and-forget wrapper that never throws. */
export function notifyPortal(topic, payload, eventId, options) {
  return postPortal(topic, payload, eventId, options).catch((err) => {
    console.error(`[portal] notify ${topic} error:`, err?.message || err)
    return classifyPortalResponse(0, { error: err?.message || "notify_failed" })
  })
}

// ── Typed senders (public-app call sites use these) ──────────────────────────

export async function sendInstall(ctx, { eventId, status = "installed" } = {}) {
  const shopCtx = buildShopContext(ctx)
  const id = eventId || installEventId(shopCtx.shopify_shop_id)
  return postPortal("install", { ...shopCtx, status }, id)
}

export async function sendUninstall(ctx, { eventId, webhookId } = {}) {
  const shopCtx = buildShopContext(ctx)
  const id = eventId || uninstallEventId(shopCtx.shopify_shop_id, webhookId || new Date().toISOString())
  return postPortal("uninstall", shopCtx, id)
}

export async function sendAffiliateCode(ctx, affiliateCode, { eventId } = {}) {
  const shopCtx = buildShopContext(ctx)
  const code = String(affiliateCode || "")
    .trim()
    .toUpperCase()
  const id = eventId || affiliateEventId(shopCtx.shopify_shop_id, code)
  return postPortal("affiliate-code", { ...shopCtx, affiliate_code: code }, id)
}

/**
 * @param {object} ctx shop fields
 * @param {object} billing fields including event_type
 * @param {string} eventId
 */
export async function sendBilling(ctx, billing, eventId) {
  const shopCtx = buildShopContext(ctx)
  return postPortal(
    "billing",
    {
      ...shopCtx,
      ...billing,
    },
    eventId,
  )
}

export async function sendPaymentCompleted(ctx, fields, eventId) {
  return sendBilling(ctx, { event_type: "payment_completed", ...fields }, eventId)
}

export async function sendPaymentCancelled(ctx, fields, eventId) {
  // Supported by contract; Managed Pricing has no reliable trigger — call when available.
  return sendBilling(ctx, { event_type: "payment_cancelled", ...fields }, eventId)
}

export async function sendPaymentDeclined(ctx, fields, eventId) {
  return sendBilling(ctx, { event_type: "payment_declined", ...fields }, eventId)
}

export async function sendSubscriptionActivated(ctx, fields, eventId) {
  return sendBilling(ctx, { event_type: "subscription_activated", ...fields }, eventId)
}

export async function sendSubscriptionCancelled(ctx, fields, eventId) {
  return sendBilling(ctx, { event_type: "subscription_cancelled", ...fields }, eventId)
}

export async function sendPlanChanged(ctx, fields, eventId) {
  return sendBilling(ctx, { event_type: "plan_changed", ...fields }, eventId)
}
