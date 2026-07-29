"use client"

import { useCallback, useEffect, useState } from "react"
import { Page, Layout, Text, Banner, Badge, TextField, FormLayout, Stack } from "@shopify/polaris"
import { useNavigate } from "react-router-dom"
import { PLANS, PLAN_IDS, formatPlanPrice, formatLimit, planRank } from "../utils/plans"
import { useShopPlan, openManagedPricing } from "../hooks/useShopPlan"

const FEATURE_ROWS = [
  {
    key: "sliders",
    label: "Slider limit",
    value: (plan) => formatLimit(plan.maxSliders),
  },
  {
    key: "slides",
    label: "Slides per slider",
    value: (plan) => formatLimit(plan.maxSlidesPerSlider),
  },
  {
    key: "templates",
    label: "Templates",
    value: (plan) => plan.templatesLabel,
  },
  {
    key: "placement",
    label: "Placement",
    value: (plan) => plan.placementLabel,
  },
  {
    key: "support",
    label: "Support",
    value: (plan) => plan.supportLabel,
  },
]

export default function PricingPage() {
  const navigate = useNavigate()
  const { planId, plan, pricingUrl, loading } = useShopPlan()

  const [affiliateCode, setAffiliateCode] = useState("")
  const [affiliateLocked, setAffiliateLocked] = useState(false)
  const [affiliateLoading, setAffiliateLoading] = useState(true)
  const [affiliateSubmitting, setAffiliateSubmitting] = useState(false)
  const [affiliateError, setAffiliateError] = useState(null)
  const [affiliateSuccess, setAffiliateSuccess] = useState(null)

  const loadAffiliate = useCallback(async () => {
    try {
      setAffiliateLoading(true)
      setAffiliateError(null)
      const response = await fetch("/api/billing/affiliate")
      const data = await response.json().catch(() => ({}))
      if (!response.ok) {
        throw new Error(data.error || "Failed to load affiliate status")
      }
      setAffiliateLocked(Boolean(data.locked))
      setAffiliateCode(data.affiliateCode || "")
    } catch (error) {
      setAffiliateError(error.message)
    } finally {
      setAffiliateLoading(false)
    }
  }, [])

  useEffect(() => {
    loadAffiliate()
  }, [loadAffiliate])

  const submitAffiliate = async () => {
    setAffiliateSubmitting(true)
    setAffiliateError(null)
    setAffiliateSuccess(null)
    try {
      const response = await fetch("/api/billing/affiliate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ affiliateCode }),
      })
      const data = await response.json().catch(() => ({}))

      if (response.ok) {
        setAffiliateLocked(true)
        setAffiliateCode(data.affiliateCode || affiliateCode)
        setAffiliateSuccess(
          data.duplicateAttribution || data.outcome === "duplicateAttribution"
            ? "Code applied (already linked to this partner)."
            : data.message || "Code applied",
        )
        return
      }

      if (data.locked) {
        setAffiliateLocked(true)
        if (data.affiliateCode) setAffiliateCode(data.affiliateCode)
      }

      const code = data.code || data.outcome
      let message = data.error || "Failed to apply affiliate code"
      if (code === "ATTRIBUTION_CONFLICT" || data.outcome === "attributionConflict") {
        message =
          "This store is already linked to another partner. The existing affiliation cannot be overwritten."
      } else if (
        code === "CODE_INACTIVE" ||
        data.outcome === "codeInactive" ||
        data.outcome === "affiliateInactive"
      ) {
        message = "Invalid or inactive code"
      } else if (data.outcome === "wrongApp") {
        message = "Code doesn’t apply to Slide Ease"
      } else if (data.outcome === "notConfigured" || response.status === 503) {
        message = "Affiliate portal is not configured. Contact support."
      } else if (data.outcome === "unauthorized" || response.status === 401) {
        message = "Affiliate service authentication failed. Contact support."
      } else if (data.outcome === "networkError" || response.status >= 500) {
        message = "Could not reach the affiliate portal. Try again shortly."
      }

      throw new Error(message)
    } catch (error) {
      setAffiliateError(error.message)
    } finally {
      setAffiliateSubmitting(false)
    }
  }

  return (
    <Page
      title="Pricing"
      subtitle="Choose the plan that fits your storefront"
      backAction={{ content: "Sliders", onAction: () => navigate("/") }}
    >
      <Layout>
        <Layout.Section>
          {loading ? (
            <Banner status="info">
              <p>Loading your current plan…</p>
            </Banner>
          ) : (
            <Banner status="info" title={`You are on ${plan.name}`}>
              <p>
                {plan.priceMonthly
                  ? `${formatPlanPrice(plan)} · `
                  : "Free forever for getting started · "}
                Limits apply to new sliders and new slides. Existing content keeps working.
              </p>
            </Banner>
          )}
        </Layout.Section>

        <Layout.Section>
          <div className="se-pricing-grid">
            {PLAN_IDS.map((id) => {
              const p = PLANS[id]
              const isCurrent = id === planId
              const isUpgradeTarget = planRank(id) > planRank(planId)

              return (
                <div
                  key={id}
                  className={`se-pricing-card${isCurrent ? " is-current" : ""}`}
                >
                  <div className="se-pricing-card__header">
                    <Text variant="headingMd" as="h2">
                      {p.name}
                    </Text>
                    {isCurrent ? <Badge status="attention">Current</Badge> : null}
                  </div>

                  <p className="se-pricing-card__price">{formatPlanPrice(p)}</p>

                  <div className="se-pricing-card__features">
                    {FEATURE_ROWS.map((row) => (
                      <div key={row.key} className="se-pricing-card__row">
                        <span className="se-pricing-card__label">{row.label}</span>
                        <span className="se-pricing-card__value">{row.value(p)}</span>
                      </div>
                    ))}
                  </div>

                  <div className="se-pricing-card__footer">
                    {isCurrent ? (
                      <button type="button" className="se-btn se-btn--secondary" disabled>
                        Current plan
                      </button>
                    ) : isUpgradeTarget ? (
                      <button
                        type="button"
                        className="se-btn se-btn--primary"
                        onClick={() => openManagedPricing(pricingUrl)}
                        disabled={!pricingUrl}
                      >
                        Upgrade to {p.name}
                      </button>
                    ) : (
                      <button type="button" className="se-btn se-btn--secondary" disabled>
                        Included in higher plans
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          <div style={{ marginTop: 16 }}>
            <button
              type="button"
              className="se-btn se-btn--ghost"
              onClick={() => openManagedPricing(pricingUrl)}
              disabled={!pricingUrl}
            >
              Manage subscription on Shopify
            </button>
          </div>
        </Layout.Section>

        <Layout.Section>
          <div className="se-pricing-affiliate">
            <Text variant="headingMd" as="h2">
              Affiliate code
            </Text>
            <Text as="p" tone="subdued">
              Apply a partner code once. After it is saved, it cannot be changed — even if you
              reinstall the app.
            </Text>

            {affiliateSuccess ? (
              <div style={{ marginTop: 12 }}>
                <Banner status="success" onDismiss={() => setAffiliateSuccess(null)}>
                  <p>{affiliateSuccess}</p>
                </Banner>
              </div>
            ) : null}
            {affiliateError ? (
              <div style={{ marginTop: 12 }}>
                <Banner status="critical" onDismiss={() => setAffiliateError(null)}>
                  <p>{affiliateError}</p>
                </Banner>
              </div>
            ) : null}

            <div style={{ marginTop: 16 }}>
              {affiliateLoading ? (
                <Banner status="info">
                  <p>Loading affiliate status…</p>
                </Banner>
              ) : affiliateLocked ? (
                <Banner status="success" title="Affiliate code applied">
                  <p>
                    {affiliateCode ? (
                      <>
                        Code <strong>{affiliateCode}</strong> is locked to this store.
                      </>
                    ) : (
                      <>This store is already linked to a partner and cannot accept another code.</>
                    )}
                  </p>
                </Banner>
              ) : (
                <FormLayout>
                  <Stack alignment="trailing" spacing="tight" wrap={false}>
                    <Stack.Item fill>
                      <TextField
                        label="Affiliate code"
                        value={affiliateCode}
                        onChange={setAffiliateCode}
                        autoComplete="off"
                        placeholder="PARTNER20"
                        disabled={affiliateSubmitting}
                      />
                    </Stack.Item>
                    <button
                      type="button"
                      className="se-btn se-btn--primary"
                      onClick={submitAffiliate}
                      disabled={affiliateSubmitting || !affiliateCode.trim()}
                    >
                      {affiliateSubmitting ? "Applying…" : "Apply code"}
                    </button>
                  </Stack>
                </FormLayout>
              )}
            </div>
          </div>
        </Layout.Section>
      </Layout>
    </Page>
  )
}
