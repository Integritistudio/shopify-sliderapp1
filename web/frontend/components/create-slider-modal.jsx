"use client"

import { useState } from "react"
import { Modal, FormLayout, TextField, Select, Card, Stack, Text } from "@shopify/polaris"
import { useToast } from "../contexts/toast-context"
import { SLIDER_TYPES, settingsFromPreset } from "../utils/sliderConfig"
import SliderPreview from "./slider-preview"

export default function CreateSliderModal({ isOpen, onClose, onCreateSlider }) {
  const { showToast } = useToast()
  const [sliderName, setSliderName] = useState("")
  const [sliderType, setSliderType] = useState("center")
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
      setSliderName("")
      setSliderType("center")
    } catch (error) {
      showToast(error.message || "Failed to create slider", { error: true })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    if (!isSubmitting) {
      setSliderName("")
      setSliderType("center")
      onClose()
    }
  }

  return (
    <Modal
      open={isOpen}
      onClose={handleClose}
      title="Create new slider"
      large
      primaryAction={{
        content: isSubmitting ? "Creating..." : "Create slider",
        onAction: handleSubmit,
        loading: isSubmitting,
        disabled: !sliderName.trim() || isSubmitting,
      }}
      secondaryActions={[{ content: "Cancel", onAction: handleClose, disabled: isSubmitting }]}
    >
      <Modal.Section>
        <FormLayout>
          <TextField
            label="Slider name"
            value={sliderName}
            onChange={setSliderName}
            placeholder="Homepage hero, Featured products..."
            requiredIndicator
            disabled={isSubmitting}
          />

          <Select
            label="Slider preset"
            options={SLIDER_TYPES.map((option) => ({ label: option.label, value: option.value }))}
            value={sliderType}
            onChange={setSliderType}
            disabled={isSubmitting}
          />

          {selected && (
            <Card sectioned>
              <Stack vertical spacing="tight">
                <Text variant="headingSm">{selected.label}</Text>
                <Text color="subdued">{selected.description}</Text>
              </Stack>
            </Card>
          )}

          <Card title="Sample preview" sectioned>
            <SliderPreview
              sliderType={sliderType}
              settings={settingsFromPreset(sliderType)}
              useSampleWhenEmpty
              showDeviceToggle={false}
            />
          </Card>
        </FormLayout>
      </Modal.Section>
    </Modal>
  )
}
