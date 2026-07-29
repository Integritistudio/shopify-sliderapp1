import shopify from "../shopify.js"
import { ShopAffiliate } from "../models/index.js"
import {
  sendInstall,
  sendAffiliateCode,
  installEventId,
  uninstallEventId,
  isPortalConfigured,
} from "./portalWebhook.js"

const SHOP_QUERY = `#graphql
  query SlideEaseShopIdentity {
    shop {
      id
      name
      myshopifyDomain
    }
  }
`

/**
 * Normalize myshopify domain.
 */
export function normalizeShopDomain(shop) {
  return String(shop || "")
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
}

/**
 * Fetch shop GID + name from Admin GraphQL when we have a session.
 */
export async function fetchShopIdentity(session) {
  if (!session) return null
  try {
    const client = new shopify.api.clients.Graphql({ session })
    const response = await client.request(SHOP_QUERY)
    const shop = response?.data?.shop
    if (!shop) return null
    return {
      shopifyShopId: shop.id,
      shopName: shop.name,
      shop: normalizeShopDomain(shop.myshopifyDomain || session.shop),
    }
  } catch (error) {
    console.warn("fetchShopIdentity failed:", error?.message || error)
    return {
      shopifyShopId: null,
      shopName: null,
      shop: normalizeShopDomain(session.shop),
    }
  }
}

/**
 * Upsert shop row; optionally merge identity / install fields.
 */
export async function upsertShopAffiliate(shopDomain, fields = {}) {
  const shop = normalizeShopDomain(shopDomain)
  if (!shop) return null

  const [row] = await ShopAffiliate.findOrCreate({
    where: { shop },
    defaults: {
      shop,
      shopifyShopId: fields.shopifyShopId || null,
      shopName: fields.shopName || null,
      lastPlanId: fields.lastPlanId || null,
      lastSubscriptionId: fields.lastSubscriptionId || null,
      installStatus: fields.installStatus || null,
      installEventId: fields.installEventId || null,
      uninstallEventId: fields.uninstallEventId || null,
    },
  })

  let dirty = false
  if (fields.shopifyShopId && row.shopifyShopId !== fields.shopifyShopId) {
    row.shopifyShopId = fields.shopifyShopId
    dirty = true
  }
  if (fields.shopName && row.shopName !== fields.shopName) {
    row.shopName = fields.shopName
    dirty = true
  }
  if (fields.lastPlanId !== undefined && row.lastPlanId !== fields.lastPlanId) {
    row.lastPlanId = fields.lastPlanId
    dirty = true
  }
  if (fields.lastSubscriptionId !== undefined && row.lastSubscriptionId !== fields.lastSubscriptionId) {
    row.lastSubscriptionId = fields.lastSubscriptionId
    dirty = true
  }
  if (fields.installStatus !== undefined && row.installStatus !== fields.installStatus) {
    row.installStatus = fields.installStatus
    dirty = true
  }
  if (fields.installEventId !== undefined && row.installEventId !== fields.installEventId) {
    row.installEventId = fields.installEventId
    dirty = true
  }
  if (fields.uninstallEventId !== undefined && row.uninstallEventId !== fields.uninstallEventId) {
    row.uninstallEventId = fields.uninstallEventId
    dirty = true
  }
  if (dirty) await row.save()
  return row
}

export async function getShopAffiliate(shopDomain) {
  const shop = normalizeShopDomain(shopDomain)
  if (!shop) return null
  return ShopAffiliate.findOne({ where: { shop } })
}

export function isAffiliateLocked(row) {
  return Boolean(row?.affiliateLockedAt || row?.affiliateCode)
}

/**
 * Ensure shop identity is populated from session, then return row.
 */
export async function ensureShopIdentity(session) {
  const identity = await fetchShopIdentity(session)
  const shop = identity?.shop || normalizeShopDomain(session?.shop)
  if (!shop) return null
  return upsertShopAffiliate(shop, {
    shopifyShopId: identity?.shopifyShopId,
    shopName: identity?.shopName,
  })
}

/**
 * Begin a new install cycle if needed, persist stable installEventId, notify portal.
 * Routine OAuth while already installed skips the portal call entirely.
 *
 * Returns { sent: boolean, result?, row, skipped?: boolean }
 */
export async function notifyPortalInstall(row, { status = "installed", forceNewCycle = false } = {}) {
  if (!row) return { sent: false, skipped: true, row }

  const alreadyInstalled = row.installStatus === "installed" && row.installEventId
  if (alreadyInstalled && !forceNewCycle) {
    return { sent: false, skipped: true, row }
  }

  const eventId = installEventId(row.shopifyShopId || row.shop)
  row.installEventId = eventId
  row.installStatus = "installed"
  row.uninstallEventId = null
  await row.save()

  const result = await sendInstall(
    {
      shopDomain: row.shop,
      shopifyShopId: row.shopifyShopId,
      shopName: row.shopName,
    },
    { eventId, status },
  )

  return { sent: true, result, row, skipped: false }
}

/**
 * Mark shop uninstalled locally (keeps affiliate attribution) and return
 * a stable uninstall event_id for the portal call.
 */
export async function markShopUninstalled(row, { webhookId } = {}) {
  if (!row) return null
  if (row.installStatus === "uninstalled" && row.uninstallEventId) {
    return row.uninstallEventId
  }

  const eventId =
    row.uninstallEventId ||
    uninstallEventId(row.shopifyShopId || row.shop, webhookId || new Date().toISOString())

  row.installStatus = "uninstalled"
  row.uninstallEventId = eventId
  // Keep installEventId so reinstall can mint a NEW install event_id
  row.installEventId = null
  await row.save()
  return eventId
}

/**
 * Apply affiliate code: lock locally only after portal success / duplicate /
 * duplicateAttribution / conflict. Never steal attribution on 409.
 */
export async function applyAffiliateCode(row, rawCode) {
  if (!row) {
    return { ok: false, status: 404, error: "Shop not found", outcome: "error" }
  }

  const affiliate_code = String(rawCode || "")
    .trim()
    .toUpperCase()
  if (!affiliate_code || affiliate_code.length > 64) {
    return {
      ok: false,
      status: 400,
      error: "Invalid affiliate code",
      outcome: "validationError",
      merchantMessage: "Invalid affiliate code",
    }
  }

  // Same code again while locked → idempotent success (UI: already applied)
  if (isAffiliateLocked(row)) {
    const existing = String(row.affiliateCode || "")
      .trim()
      .toUpperCase()
    if (existing && existing === affiliate_code) {
      return {
        ok: true,
        status: 200,
        affiliateCode: existing,
        locked: true,
        outcome: "duplicateAttribution",
        merchantMessage: "Code applied",
        duplicateAttribution: true,
      }
    }
    return {
      ok: false,
      status: 409,
      error: "This store is already linked to another partner. The existing affiliation cannot be overwritten.",
      code: "ATTRIBUTION_CONFLICT",
      affiliateCode: row.affiliateCode,
      locked: true,
      outcome: "attributionConflict",
      merchantMessage:
        "This store is already linked to another partner. The existing affiliation cannot be overwritten.",
    }
  }

  if (!isPortalConfigured()) {
    return {
      ok: false,
      status: 503,
      error: "Affiliate portal is not configured. Set WEBHOOK_SECRET.",
      locked: false,
      outcome: "notConfigured",
      merchantMessage: "Affiliate portal is not configured. Contact support.",
      code: "NOT_CONFIGURED",
    }
  }

  const result = await sendAffiliateCode(
    {
      shopDomain: row.shop,
      shopifyShopId: row.shopifyShopId,
      shopName: row.shopName,
    },
    affiliate_code,
  )

  if (result.ok) {
    row.affiliateCode = affiliate_code
    row.affiliateLockedAt = new Date()
    await row.save()
    return {
      ok: true,
      status: 200,
      affiliateCode: affiliate_code,
      locked: true,
      outcome: result.outcome,
      merchantMessage: result.merchantMessage || "Code applied",
      duplicate: result.duplicate,
      duplicateAttribution: result.duplicateAttribution,
    }
  }

  if (result.conflict || result.outcome === "attributionConflict") {
    // Portal says shop already attributed — lock WITHOUT storing the submitted
    // code as if it were the existing affiliate.
    const existingFromPortal =
      result.body?.error?.existing_code ||
      result.body?.existing_affiliate_code ||
      result.body?.affiliate_code ||
      null

    row.affiliateLockedAt = new Date()
    if (existingFromPortal) {
      row.affiliateCode = String(existingFromPortal).trim().toUpperCase()
    } else if (!row.affiliateCode) {
      // Lock with sentinel so we never accept another code; don't claim submitted code
      row.affiliateCode = row.affiliateCode || "__CONFLICT__"
    }
    await row.save()

    return {
      ok: false,
      status: 409,
      error: result.merchantMessage || result.errorMessage,
      code: result.errorCode || "ATTRIBUTION_CONFLICT",
      affiliateCode: row.affiliateCode === "__CONFLICT__" ? null : row.affiliateCode,
      locked: true,
      outcome: "attributionConflict",
      merchantMessage: result.merchantMessage,
    }
  }

  return {
    ok: false,
    status: result.status || 502,
    error: result.merchantMessage || result.errorMessage || "Failed to apply affiliate code",
    code: result.errorCode,
    locked: false,
    outcome: result.outcome,
    merchantMessage: result.merchantMessage,
  }
}
