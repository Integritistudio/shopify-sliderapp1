"use client"

import { Modal, Text, Stack, Badge } from "@shopify/polaris"
import { getPlan, formatPlanPrice } from "../utils/plans"
import { openManagedPricing } from "../hooks/useShopPlan"

/**
 * Friendly upgrade prompt when a plan limit or locked preset blocks an action.
 * Pass hideBackdrop on index (and similar) to keep the popup without the grey overlay.
 */
export default function UpgradeModal({
  open,
  onClose,
  title = "Upgrade to unlock",
  message,
  currentPlanId = "free",
  requiredPlanId = "standard",
  pricingUrl,
  hint,
  hideBackdrop = false,
}) {
  const current = getPlan(currentPlanId)
  const required = getPlan(requiredPlanId || "standard")

  const handleUpgrade = () => {
    openManagedPricing(pricingUrl)
  }

  const body = (
    <Stack vertical spacing="loose">
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
        <Badge>{current.name} plan</Badge>
        <Text as="span" color="subdued">
          →
        </Text>
        <Badge status="info">{required.name} plan</Badge>
        <Text as="span" color="subdued" variant="bodySm">
          {formatPlanPrice(required)}
        </Text>
      </div>

      {message ? (
        <Text as="p">{message}</Text>
      ) : (
        <Text as="p">
          Your {current.name} plan does not include this feature. Upgrade to {required.name} to unlock it.
        </Text>
      )}

      {hint ? (
        <Text as="p" color="subdued" variant="bodySm">
          {hint}
        </Text>
      ) : null}

      {!pricingUrl ? (
        <Text as="p" color="subdued" variant="bodySm">
          Pricing is unavailable right now. Open Pricing from the app menu to choose a plan.
        </Text>
      ) : null}
    </Stack>
  )

  if (!open) return null

  if (hideBackdrop) {
    return (
      <div className="se-upgrade-popup" role="dialog" aria-modal="false" aria-label={title}>
        <div className="se-upgrade-popup__card">
          <div className="se-upgrade-popup__header">
            <h2 className="se-upgrade-popup__title">{title}</h2>
            <button type="button" className="se-upgrade-popup__close" onClick={onClose} aria-label="Close">
              ×
            </button>
          </div>
          <div className="se-upgrade-popup__body">{body}</div>
          <div className="se-upgrade-popup__footer">
            <button type="button" className="se-btn se-btn--secondary" onClick={onClose}>
              Not now
            </button>
            <button
              type="button"
              className="se-btn se-btn--primary"
              onClick={handleUpgrade}
              disabled={!pricingUrl}
            >
              Upgrade to {required.name}
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      primaryAction={{
        content: `Upgrade to ${required.name}`,
        onAction: handleUpgrade,
        disabled: !pricingUrl,
      }}
      secondaryActions={[
        {
          content: "Not now",
          onAction: onClose,
        },
      ]}
    >
      <Modal.Section>{body}</Modal.Section>
    </Modal>
  )
}
