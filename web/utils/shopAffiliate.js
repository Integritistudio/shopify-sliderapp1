import shopify from "../shopify.js"
import { ShopAffiliate } from "../models/index.js"
import {
  buildShopContext,
  notifyPortal,
  postPortal,
  installEventId,
  affiliateEventId,
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
 * Upsert shop row; optionally merge identity fields.
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
 * Send portal install event (idempotent via event_id).
 */
export async function notifyPortalInstall(row, { status = "installed" } = {}) {
  if (!row) return
  const ctx = buildShopContext({
    shopDomain: row.shop,
    shopifyShopId: row.shopifyShopId,
    shopName: row.shopName,
  })
  const eventId = installEventId(row.shopifyShopId || row.shop)
  return notifyPortal(
    "install",
    {
      ...ctx,
      status,
    },
    eventId,
  )
}

/**
 * Apply affiliate code: lock locally only after portal success or 409 conflict.
 */
export async function applyAffiliateCode(row, rawCode) {
  if (!row) {
    return { ok: false, status: 404, error: "Shop not found" }
  }
  if (isAffiliateLocked(row)) {
    return {
      ok: false,
      status: 409,
      error: "Affiliate code already applied for this store",
      affiliateCode: row.affiliateCode,
      locked: true,
    }
  }

  const affiliate_code = String(rawCode || "")
    .trim()
    .toUpperCase()
  if (!affiliate_code || affiliate_code.length > 64) {
    return { ok: false, status: 400, error: "Invalid affiliate code" }
  }

  if (!isPortalConfigured()) {
    return {
      ok: false,
      status: 503,
      error: "Affiliate portal is not configured. Set PORTAL_WEBHOOK_BASE_URL, PORTAL_WEBHOOK_SECRET, and SHOPIFY_APP_ID.",
      locked: false,
    }
  }

  const ctx = buildShopContext({
    shopDomain: row.shop,
    shopifyShopId: row.shopifyShopId,
    shopName: row.shopName,
  })

  const result = await postPortal(
    "affiliate-code",
    {
      ...ctx,
      affiliate_code,
    },
    affiliateEventId(row.shopifyShopId || row.shop, affiliate_code),
  )

  if (result.ok) {
    row.affiliateCode = affiliate_code
    row.affiliateLockedAt = new Date()
    await row.save()
    return { ok: true, status: 200, affiliateCode: affiliate_code, locked: true }
  }

  if (result.conflict) {
    // Portal says shop already attributed — lock so we never accept another code
    const existing =
      result.body?.error?.existing_code ||
      result.body?.affiliate_code ||
      affiliate_code
    row.affiliateCode = String(existing).trim().toUpperCase() || affiliate_code
    row.affiliateLockedAt = new Date()
    await row.save()
    return {
      ok: false,
      status: 409,
      error:
        result.body?.error?.message ||
        "This store is already attributed to a different affiliate.",
      code: result.body?.error?.code || "ATTRIBUTION_CONFLICT",
      affiliateCode: row.affiliateCode,
      locked: true,
    }
  }

  return {
    ok: false,
    status: result.status || 502,
    error: result.body?.error?.message || result.body?.error || "Failed to apply affiliate code",
    locked: false,
  }
}
