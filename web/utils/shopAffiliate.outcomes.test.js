/**
 * Affiliate applyAffiliateCode outcome branches (mocked portal).
 * Run: node --test utils/shopAffiliate.outcomes.test.js
 */
import { describe, it } from "node:test"
import assert from "node:assert/strict"

import { classifyPortalResponse, affiliateEventId } from "./portalWebhook.js"

describe("affiliate outcome mapping (contract)", () => {
  it("same-code locked row is treated as duplicateAttribution at UI layer", () => {
    // Documented client handling: 200 + duplicateAttribution → success UI
    const r = classifyPortalResponse(200, {
      success: true,
      ok: true,
      duplicateAttribution: true,
    })
    assert.equal(r.ok, true)
    assert.equal(r.merchantMessage, "Code applied")
  })

  it("replayed event_id is duplicate success", () => {
    const r = classifyPortalResponse(200, { success: true, ok: true, duplicate: true })
    assert.equal(r.duplicate, true)
    assert.equal(r.ok, true)
  })

  it("conflict never ok", () => {
    const r = classifyPortalResponse(409, {
      success: false,
      error: { code: "ATTRIBUTION_CONFLICT", message: "…" },
    })
    assert.equal(r.ok, false)
    assert.equal(r.outcome, "attributionConflict")
  })

  it("affiliate event id is case-normalized", () => {
    assert.equal(
      affiliateEventId("gid://shopify/Shop/1", "AbC"),
      affiliateEventId("gid://shopify/Shop/1", "abc"),
    )
  })
})
