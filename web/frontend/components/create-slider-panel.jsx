"use client"

import { useState } from "react"
import { FormLayout, TextField, Text } from "@shopify/polaris"
import { useToast } from "../contexts/toast-context"
import { SLIDER_TYPES, settingsFromPreset } from "../utils/sliderConfig"
import SliderPreview from "./slider-preview"
import { IconPlus, IconClose } from "./icons"

export default function CreateSliderPanel({ onCreateSlider, onCancel }) {
  const { showToast } = useToast()
  const [sliderName, setSliderName] = useState("")
  const [sliderType, setSliderType] = useState("fade")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const selected = SLIDER_TYPES.find((option) => option.value === sliderType)

  const handleSubmit = async () => {
    if (!sliderName.trim() || sliderName.trim().length < 3) {
      showToast("Slider name must be at least 3 characters", { error: true })
      return
    }

    setIsSubmitting(true)
    try {
      await onCreateSlider(sliderName.trim(), sliderType)
    } catch (error) {
      showToast(error.message || "Failed to create slider", { error: true })
    } finally {
      setIsSubmitting(false)
    }
  }

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
            disabled={isSubmitting}
          >
            {isSubmitting ? <span className="se-btn__spin" /> : <IconPlus size={14} />}
            Create
          </button>
        </div>
      </div>

      <div className="se-create__body">
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
            Motion style · {SLIDER_TYPES.length} presets
          </Text>
          <div style={{ marginTop: 2 }}>
            <Text variant="bodySm" color="subdued">
              {selected?.description}
            </Text>
          </div>
          {["Classic", "Layout", "Motion"].map((group) => (
            <div key={group} style={{ marginTop: 14 }}>
              <Text variant="bodySm" color="subdued">
                {group}
              </Text>
              <div className="se-type-grid" style={{ marginTop: 8 }}>
                {SLIDER_TYPES.filter((option) => option.group === group).map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    className={`se-type-card${sliderType === option.value ? " is-active" : ""}`}
                    onClick={() => setSliderType(option.value)}
                    disabled={isSubmitting}
                  >
                    <span className="se-type-card__label">{option.label}</span>
                    <span className="se-type-card__desc">{option.description}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 18 }}>
          <Text variant="headingSm" as="h3">
            Preview
          </Text>
          <div style={{ marginTop: 10 }}>
            <SliderPreview
              sliderType={sliderType}
              settings={settingsFromPreset(sliderType)}
              useSampleWhenEmpty
              showDeviceToggle={false}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
