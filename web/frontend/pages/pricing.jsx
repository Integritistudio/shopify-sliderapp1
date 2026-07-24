"use client"

import { Page, Layout, Text, Banner, Badge } from "@shopify/polaris"
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
      </Layout>
    </Page>
  )
}
