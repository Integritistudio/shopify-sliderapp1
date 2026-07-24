"use client"

import { useRef, useState } from "react"
import { FormLayout, TextField, Text } from "@shopify/polaris"
import { useToast } from "../contexts/toast-context"
import { SLIDER_TYPES, SLIDER_TYPE_GROUPS, settingsFromPreset } from "../utils/sliderConfig"
import {
  isPresetAllowed,
  requiredPlanForPreset,
  canCreateSlider,
  getPlan,
  formatPlanPrice,
} from "../utils/plans"
import { scrollPreviewIntoView } from "../utils/scrollPreview"
import { openManagedPricing } from "../hooks/useShopPlan"
import SliderPreview from "./slider-preview"
import { IconPlus, IconClose, IconLock } from "./icons"

export default function CreateSliderPanel({
  onCreateSlider,
  onCancel,
  planId = "free",
  sliderCount = 0,
  pricingUrl = null,
}) {
  const { showToast } = useToast()
  const [sliderName, setSliderName] = useState("")
  const [sliderType, setSliderType] = useState("hero-fullwidth")
  const [previewType, setPreviewType] = useState("hero-fullwidth")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [upgradeNotice, setUpgradeNotice] = useState(null)
  const previewRef = useRef(null)
  const calloutRef = useRef(null)

  const selected = SLIDER_TYPES.find((option) => option.value === previewType)
  const selectedAllowed = isPresetAllowed(planId, sliderType)
  const previewLocked = !isPresetAllowed(planId, previewType)
  const plan = getPlan(planId)
  const atSliderLimit = plan.maxSliders != null && sliderCount >= plan.maxSliders
  const limitRequiredPlanId = planId === "free" ? "standard" : "pro"
  const canSubmit = selectedAllowed && !atSliderLimit

  const showUpgradeNotice = ({ title, message, requiredPlanId }) => {
    setUpgradeNotice({
      title: title || "Upgrade to unlock",
      message: message || "",
      requiredPlanId: requiredPlanId || "standard",
    })
  }

  const dismissUpgradeNotice = () => setUpgradeNotice(null)

  const selectSliderType = (type) => {
    setPreviewType(type)

    if (!isPresetAllowed(planId, type)) {
      const required = requiredPlanForPreset(type)
      const label = SLIDER_TYPES.find((t) => t.value === type)?.label || "this"
      showUpgradeNotice({
        title: "Preset locked",
        message: `${getPlan(required).name} (${formatPlanPrice(getPlan(required))}) is required to create a ${label} slider. Preview is shown below.`,
        requiredPlanId: required,
      })
      window.setTimeout(() => {
        scrollPreviewIntoView(calloutRef.current || previewRef.current)
      }, 80)
      return
    }

    if (atSliderLimit) {
      showUpgradeNotice({
        title: "Slider limit reached",
        message: `Your ${plan.name} plan allows up to ${plan.maxSliders} sliders. You can browse presets here — upgrade to create more.`,
        requiredPlanId: limitRequiredPlanId,
      })
    } else {
      setUpgradeNotice(null)
    }
    setSliderType(type)
    window.setTimeout(() => {
      scrollPreviewIntoView(previewRef.current)
    }, 80)
  }

  const handleSubmit = async () => {
    if (!sliderName.trim() || sliderName.trim().length < 3) {
      showToast("Slider name must be at least 3 characters", { error: true })
      return
    }

    const check = canCreateSlider({
      planId,
      currentCount: sliderCount,
      sliderType,
    })
    if (!check.ok) {
      showUpgradeNotice({
        title: check.code === "PLAN_PRESET_LOCKED" ? "Preset locked" : "Slider limit reached",
        message: check.message,
        requiredPlanId: check.requiredPlan,
      })
      window.setTimeout(() => {
        scrollPreviewIntoView(calloutRef.current || previewRef.current)
      }, 80)
      return
    }

    setIsSubmitting(true)
    try {
      await onCreateSlider(sliderName.trim(), sliderType)
    } catch (error) {
      if (error?.code && String(error.code).startsWith("PLAN_")) {
        showUpgradeNotice({
          title: "Upgrade required",
          message: error.message,
          requiredPlanId: error.requiredPlan || "standard",
        })
        window.setTimeout(() => {
          scrollPreviewIntoView(calloutRef.current || previewRef.current)
        }, 80)
      } else {
        showToast(error.message || "Failed to create slider", { error: true })
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const requiredPlan = upgradeNotice ? getPlan(upgradeNotice.requiredPlanId) : null

  return (
    <div className="se-create">
      <div className="se-create__header">
        <div>
          <Text variant="headingMd" as="h2">
            Create a slider
          </Text>
          <div style={{ marginTop: 4 }}>
            <Text color="subdued">Name it, pick a motion style, then refine slides in the editor.</Text>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
          <button type="button" className="se-btn se-btn--secondary" onClick={onCancel} disabled={isSubmitting}>
            <IconClose size={14} />
            Cancel
          </button>
          <button
            type="button"
            className="se-btn se-btn--primary"
            onClick={handleSubmit}
            disabled={isSubmitting || !canSubmit}
            title={
              atSliderLimit
                ? `Your ${plan.name} plan allows up to ${plan.maxSliders} sliders`
                : !selectedAllowed
                  ? "This preset requires a higher plan"
                  : undefined
            }
          >
            {isSubmitting ? <span className="se-btn__spin" /> : <IconPlus size={14} />}
            Create
          </button>
        </div>
      </div>

      <div className="se-create__body">
        {atSliderLimit ? (
          <div className="se-upgrade-callout" role="status" style={{ marginTop: 0, marginBottom: 14 }}>
            <div className="se-upgrade-callout__title">
              <IconLock size={14} />
              <span>Slider limit reached</span>
            </div>
            <p className="se-upgrade-callout__msg">
              Your {plan.name} plan allows up to {plan.maxSliders} sliders ({sliderCount}/{plan.maxSliders}).
              Browse and preview all presets below — upgrade to create another slider.
            </p>
            <div className="se-upgrade-callout__actions">
              <button
                type="button"
                className="se-btn se-btn--primary se-btn--sm"
                onClick={() => openManagedPricing(pricingUrl)}
                disabled={!pricingUrl}
              >
                Upgrade to {getPlan(limitRequiredPlanId).name}
              </button>
            </div>
          </div>
        ) : null}

        <FormLayout>
          <TextField
            label="Slider name"
            value={sliderName}
            onChange={setSliderName}
            placeholder="Homepage hero, Featured products…"
            requiredIndicator
            disabled={isSubmitting}
            autoComplete="off"
          />
        </FormLayout>

        <div style={{ marginTop: 18 }}>
          <Text variant="headingSm" as="h3">
            Slider type · {SLIDER_TYPES.length} presets
          </Text>
          <div style={{ marginTop: 2 }}>
            <Text variant="bodySm" color="subdued">
              {selected?.description}
              {previewLocked ? ` · Requires ${getPlan(requiredPlanForPreset(previewType)).name}` : ""}
            </Text>
          </div>
          {SLIDER_TYPE_GROUPS.map((group) => (
            <div key={group} style={{ marginTop: 14 }}>
              <Text variant="bodySm" color="subdued">
                {group}
              </Text>
              <div className="se-type-grid" style={{ marginTop: 8 }}>
                {SLIDER_TYPES.filter((option) => option.group === group).map((option) => {
                  const locked = !isPresetAllowed(planId, option.value)
                  const required = requiredPlanForPreset(option.value)
                  const isSelected = sliderType === option.value
                  const isPreview = previewType === option.value
                  return (
                    <button
                      key={option.value}
                      type="button"
                      className={`se-type-card${isSelected ? " is-active" : ""}${
                        isPreview && locked ? " is-preview" : ""
                      }${locked ? " is-locked" : ""}`}
                      onClick={() => selectSliderType(option.value)}
                      disabled={isSubmitting}
                      aria-label={
                        locked
                          ? `${option.label} (requires ${getPlan(required).name})`
                          : option.label
                      }
                    >
                      <span className="se-type-card__top">
                        <span className="se-type-card__label">{option.label}</span>
                        {locked ? (
                          <span className="se-type-card__badge">
                            <IconLock size={12} />
                            {getPlan(required).name}
                          </span>
                        ) : null}
                      </span>
                      <span className="se-type-card__desc">{option.description}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        {upgradeNotice && requiredPlan ? (
          <div ref={calloutRef} className="se-upgrade-callout" role="status">
            <div className="se-upgrade-callout__main">
              <div className="se-upgrade-callout__title">
                <IconLock size={14} />
                <span>{upgradeNotice.title}</span>
              </div>
              <p className="se-upgrade-callout__msg">{upgradeNotice.message}</p>
              <div className="se-upgrade-callout__actions">
                <button
                  type="button"
                  className="se-btn se-btn--primary se-btn--sm"
                  onClick={() => openManagedPricing(pricingUrl)}
                  disabled={!pricingUrl}
                >
                  Upgrade to {requiredPlan.name}
                </button>
                <button type="button" className="se-btn se-btn--secondary se-btn--sm" onClick={dismissUpgradeNotice}>
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        ) : null}

        <div ref={previewRef} className="se-create__preview" style={{ marginTop: 18 }}>
          <Text variant="headingSm" as="h3">
            Preview{selected ? ` · ${selected.label}` : ""}
          </Text>
          <div style={{ marginTop: 10 }}>
            <SliderPreview
              sliderType={previewType}
              settings={settingsFromPreset(previewType)}
              useSampleWhenEmpty
              showDeviceToggle={false}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
