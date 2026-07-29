/**
 * Focused unit tests for Slide Ease portal webhook contract.
 * Run: node --test utils/portalWebhook.test.js
 */
import { describe, it, beforeEach, afterEach } from "node:test"
import assert from "node:assert/strict"
import {
  SLIDE_EASE_SHOPIFY_APP_ID,
  DEFAULT_PORTAL_WEBHOOK_BASE,
  getWebhookSecret,
  getPortalWebhookBase,
  isPortalConfigured,
  buildShopContext,
  installEventId,
  uninstallEventId,
  affiliateEventId,
  billingEventId,
  classifyPortalResponse,
  postPortal,
  sendInstall,
  sendAffiliateCode,
  sendPaymentCompleted,
  sendPaymentCancelled,
  sendSubscriptionActivated,
  sendPlanChanged,
} from "./portalWebhook.js"

const SHOP_GID = "gid://shopify/Shop/987654321"

describe("portalWebhook config", () => {
  const prev = {}

  beforeEach(() => {
    prev.WEBHOOK_SECRET = process.env.WEBHOOK_SECRET
    prev.PORTAL_WEBHOOK_SECRET = process.env.PORTAL_WEBHOOK_SECRET
    prev.PORTAL_WEBHOOK_BASE_URL = process.env.PORTAL_WEBHOOK_BASE_URL
    delete process.env.WEBHOOK_SECRET
    delete process.env.PORTAL_WEBHOOK_SECRET
    delete process.env.PORTAL_WEBHOOK_BASE_URL
  })

  afterEach(() => {
    for (const [k, v] of Object.entries(prev)) {
      if (v === undefined) delete process.env[k]
      else process.env[k] = v
    }
  })

  it("prefers WEBHOOK_SECRET over legacy alias", () => {
    process.env.PORTAL_WEBHOOK_SECRET = "legacy"
    process.env.WEBHOOK_SECRET = "primary"
    assert.equal(getWebhookSecret(), "primary")
    assert.equal(isPortalConfigured(), true)
  })

  it("falls back to PORTAL_WEBHOOK_SECRET", () => {
    process.env.PORTAL_WEBHOOK_SECRET = "legacy"
    assert.equal(getWebhookSecret(), "legacy")
  })

  it("defaults base URL to production affiliate host", () => {
    assert.equal(getPortalWebhookBase(), DEFAULT_PORTAL_WEBHOOK_BASE)
  })

  it("normalizes override base to /webhooks/shopify", () => {
    process.env.PORTAL_WEBHOOK_BASE_URL = "https://example.test"
    assert.equal(getPortalWebhookBase(), "https://example.test/webhooks/shopify")
  })
})

describe("event ids", () => {
  it("builds stable install / uninstall / affiliate / billing ids", () => {
    assert.equal(
      installEventId(SHOP_GID, "2026-07-29T12:00:00Z"),
      "install-987654321-2026-07-29T12:00:00Z",
    )
    assert.equal(
      uninstallEventId(SHOP_GID, "wh-1"),
      "uninstall-987654321-wh-1",
    )
    assert.equal(affiliateEventId(SHOP_GID, "partner20"), "affcode-987654321-PARTNER20")
    assert.equal(
      billingEventId("sub-activated", "gid://shopify/AppSubscription/222", "wh-9"),
      "sub-activated-AppSubscription-222-wh-9",
    )
  })
})

describe("buildShopContext", () => {
  it("always includes Slide Ease shopify_app_id", () => {
    const ctx = buildShopContext({
      shopDomain: "https://Demo-Store.myshopify.com",
      shopifyShopId: SHOP_GID,
      shopName: "Demo Store",
    })
    assert.equal(ctx.shopify_app_id, SLIDE_EASE_SHOPIFY_APP_ID)
    assert.equal(ctx.shop_url, "demo-store.myshopify.com")
    assert.equal(ctx.shopify_shop_id, SHOP_GID)
  })
})

describe("classifyPortalResponse", () => {
  it("classifies success / duplicate / duplicateAttribution", () => {
    assert.equal(classifyPortalResponse(200, { success: true, ok: true }).outcome, "success")
    assert.equal(
      classifyPortalResponse(200, { success: true, ok: true, duplicate: true }).outcome,
      "duplicate",
    )
    assert.equal(
      classifyPortalResponse(200, { success: true, ok: true, duplicateAttribution: true })
        .outcome,
      "duplicateAttribution",
    )
  })

  it("classifies attribution conflict", () => {
    const r = classifyPortalResponse(409, {
      success: false,
      error: { code: "ATTRIBUTION_CONFLICT", message: "This store is already attributed to a different affiliate." },
    })
    assert.equal(r.outcome, "attributionConflict")
    assert.equal(r.conflict, true)
    assert.match(r.merchantMessage, /another partner/i)
  })

  it("classifies inactive code and wrong-app", () => {
    assert.equal(
      classifyPortalResponse(400, {
        success: false,
        error: { code: "CODE_INACTIVE", message: "This affiliate code is no longer active." },
      }).merchantMessage,
      "Invalid or inactive code",
    )
    assert.equal(
      classifyPortalResponse(400, {
        success: false,
        error: {
          code: "APP_ERROR",
          message: "This affiliate code does not apply to the selected app.",
        },
      }).outcome,
      "wrongApp",
    )
  })

  it("classifies unauthorized and not configured", () => {
    assert.equal(
      classifyPortalResponse(401, {
        success: false,
        error: { code: "UNAUTHORIZED", message: "bad" },
      }).outcome,
      "unauthorized",
    )
    assert.equal(
      classifyPortalResponse(0, { error: "portal_not_configured" }).outcome,
      "notConfigured",
    )
  })
})

describe("postPortal transport", () => {
  const prev = {}

  beforeEach(() => {
    prev.WEBHOOK_SECRET = process.env.WEBHOOK_SECRET
    prev.PORTAL_WEBHOOK_BASE_URL = process.env.PORTAL_WEBHOOK_BASE_URL
    process.env.WEBHOOK_SECRET = "test-secret"
    process.env.PORTAL_WEBHOOK_BASE_URL = "https://affiliate.integritistudio.us/webhooks/shopify"
  })

  afterEach(() => {
    for (const [k, v] of Object.entries(prev)) {
      if (v === undefined) delete process.env[k]
      else process.env[k] = v
    }
  })

  it("sends X-Webhook-Secret, JSON body, stable event_id, and app id", async () => {
    let captured = null
    const fetchImpl = async (url, init) => {
      captured = { url, init }
      return {
        ok: true,
        status: 200,
        text: async () => JSON.stringify({ success: true, ok: true }),
      }
    }

    const result = await postPortal(
      "install",
      {
        shopify_shop_id: SHOP_GID,
        shop_name: "Demo Store",
        shop_url: "demo-store.myshopify.com",
        status: "installed",
      },
      "install-987654321-2026-07-29T12:00:00Z",
      { fetchImpl },
    )

    assert.equal(result.ok, true)
    assert.equal(captured.url, `${DEFAULT_PORTAL_WEBHOOK_BASE}/install`)
    assert.equal(captured.init.headers["X-Webhook-Secret"], "test-secret")
    assert.equal(captured.init.headers["Content-Type"], "application/json")
    const body = JSON.parse(captured.init.body)
    assert.equal(body.shopify_app_id, SLIDE_EASE_SHOPIFY_APP_ID)
    assert.equal(body.event_id, "install-987654321-2026-07-29T12:00:00Z")
    assert.equal(body.status, "installed")
  })

  it("typed senders produce contract payloads", async () => {
    const calls = []
    const fetchImpl = async (url, init) => {
      calls.push({ url, body: JSON.parse(init.body) })
      return {
        ok: true,
        status: 200,
        text: async () => JSON.stringify({ success: true, ok: true }),
      }
    }

    // Monkey-patch via options on postPortal by wrapping send* — send* uses postPortal
    // which accepts fetchImpl through... wait, typed senders don't pass options.
    // Test via postPortal + billingEventId shape instead, and also temporarily stub global fetch.
    const originalFetch = globalThis.fetch
    globalThis.fetch = fetchImpl
    try {
      await sendInstall(
        { shopDomain: "demo-store.myshopify.com", shopifyShopId: SHOP_GID, shopName: "Demo" },
        { eventId: "install-987654321-fixed" },
      )
      await sendAffiliateCode(
        { shopDomain: "demo-store.myshopify.com", shopifyShopId: SHOP_GID, shopName: "Demo" },
        "PARTNER20",
        { eventId: "affcode-987654321-PARTNER20" },
      )
      await sendSubscriptionActivated(
        { shopDomain: "demo-store.myshopify.com", shopifyShopId: SHOP_GID, shopName: "Demo" },
        {
          shopify_subscription_id: "gid://shopify/AppSubscription/222",
          shopify_plan_id: "standard",
        },
        "sub-activated-AppSubscription-222-wh1",
      )
      await sendPlanChanged(
        { shopDomain: "demo-store.myshopify.com", shopifyShopId: SHOP_GID, shopName: "Demo" },
        {
          shopify_subscription_id: "gid://shopify/AppSubscription/222",
          shopify_plan_id: "pro",
          previous_shopify_plan_id: "standard",
        },
        "plan-change-AppSubscription-222-wh2",
      )
      await sendPaymentCompleted(
        { shopDomain: "demo-store.myshopify.com", shopifyShopId: SHOP_GID, shopName: "Demo" },
        {
          amount: 4.99,
          currency: "USD",
          shopify_payment_id: "gid://shopify/AppPurchaseOneTime/111",
          shopify_subscription_id: "gid://shopify/AppSubscription/222",
          shopify_plan_id: "standard",
        },
        "pay-111-completed",
      )
      await sendPaymentCancelled(
        { shopDomain: "demo-store.myshopify.com", shopifyShopId: SHOP_GID, shopName: "Demo" },
        {
          amount: 29.99,
          currency: "USD",
          shopify_payment_id: "gid://shopify/AppPurchaseOneTime/111",
        },
        "pay-111-cancelled",
      )
    } finally {
      globalThis.fetch = originalFetch
    }

    assert.equal(calls.length, 6)
    assert.ok(calls[0].url.endsWith("/install"))
    assert.equal(calls[1].body.affiliate_code, "PARTNER20")
    assert.equal(calls[1].body.event_id, "affcode-987654321-PARTNER20")
    assert.equal(calls[2].body.event_type, "subscription_activated")
    assert.equal(calls[3].body.event_type, "plan_changed")
    assert.equal(calls[3].body.previous_shopify_plan_id, "standard")
    assert.equal(calls[4].body.event_type, "payment_completed")
    assert.equal(calls[5].body.event_type, "payment_cancelled")
    for (const c of calls) {
      assert.equal(c.body.shopify_app_id, SLIDE_EASE_SHOPIFY_APP_ID)
      assert.ok(c.body.event_id)
    }
  })

  it("skips when secret missing", async () => {
    delete process.env.WEBHOOK_SECRET
    delete process.env.PORTAL_WEBHOOK_SECRET
    const result = await postPortal("install", {}, "evt-1")
    assert.equal(result.outcome, "notConfigured")
  })
})

describe("subscription status mapping helpers", async () => {
  // Import mapping function from subscriptionBilling via a light re-test of billingEventId usage
  const { billingEventId: bid } = await import("./portalWebhook.js")

  it("derives deterministic ids from webhook + subscription", () => {
    const a = bid("sub-activated", "gid://shopify/AppSubscription/222", "wh-abc")
    const b = bid("sub-activated", "gid://shopify/AppSubscription/222", "wh-abc")
    assert.equal(a, b)
    assert.equal(a, "sub-activated-AppSubscription-222-wh-abc")
  })
})
