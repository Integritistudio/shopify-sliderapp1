"use client"

import { useState } from "react"
import { Modal, FormLayout, TextField, Select, Card, Stack, Text } from "@shopify/polaris"
import { useToast } from "../contexts/toast-context"

export default function CreateSliderModal({ isOpen, onClose, onCreateSlider }) {
  const { showToast } = useToast()
  const [sliderName, setSliderName] = useState("")
  const [sliderType, setSliderType] = useState("center")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const sliderOptions = [
    {
      label: "Center Mode",
      value: "center",
      description: "Displays slides in center mode with padding, perfect for showcasing featured content",
      features: ["Center focused display", "Multiple slides visible", "Responsive design", "Navigation arrows & dots"],
    },
    {
      label: "Fade Transition",
      value: "fade",
      description: "Smooth fade transition between slides, ideal for hero sections and banners",
      features: ["Smooth fade effect", "Single slide focus", "Elegant transitions", "Perfect for hero sections"],
    },
    {
      label: "Lazy Loading",
      value: "lazy",
      description: "Optimized for performance with lazy loading, great for image galleries",
      features: ["Performance optimized", "Lazy image loading", "Fast initial load", "Great for many images"],
    },
    {
      label: "Autoplay",
      value: "autoplay",
      description: "Automatically cycles through slides with configurable timing",
      features: ["Auto-rotating slides", "Configurable speed", "Pause on hover", "Great for banners"],
    },
    {
      label: "Infinite Loop",
      value: "infinite",
      description: "Seamless infinite looping through slides",
      features: ["Never-ending loop", "Smooth transitions", "Great for product showcases", "Continuous browsing"],
    },
    {
      label: "Variable Width",
      value: "variable",
      description: "Slides with varying widths for dynamic layouts",
      features: ["Mixed content widths", "Dynamic sizing", "Irregular layouts", "Great for mixed content"],
    },
  ]

  const selectedSliderInfo = sliderOptions.find((option) => option.value === sliderType)

  const handleSubmit = async () => {
    if (!sliderName.trim()) {
      showToast("Please enter a name for the slider", { error: true })
      return
    }

    if (sliderName.trim().length < 3) {
      showToast("Slider name must be at least 3 characters long", { error: true })
      return
    }

    setIsSubmitting(true)
    try {
      await onCreateSlider(sliderName.trim(), sliderType)

      // Reset form
      setSliderName("")
      setSliderType("center")
      onClose()

      // Success toast will be shown by the parent component
    } catch (error) {
      console.error("Error creating slider:", error)
      showToast("Failed to create slider. Please try again.", { error: true })
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
      title="Create New Slider"
      large
      primaryAction={{
        content: isSubmitting ? "Creating..." : "Create Slider",
        onAction: handleSubmit,
        loading: isSubmitting,
        disabled: !sliderName.trim() || isSubmitting,
      }}
      secondaryActions={[
        {
          content: "Cancel",
          onAction: handleClose,
          disabled: isSubmitting,
        },
      ]}
    >
      <Modal.Section>
        <FormLayout>
          <TextField
            label="Slider Name"
            value={sliderName}
            onChange={setSliderName}
            placeholder="Enter slider name (e.g., Product Showcase, Featured Items)"
            requiredIndicator
            helpText="Give your slider a descriptive name to easily identify it (minimum 3 characters)"
            disabled={isSubmitting}
            error={sliderName.trim() && sliderName.trim().length < 3 ? "Name must be at least 3 characters" : undefined}
          />

          <Select
            label="Slider Type"
            options={sliderOptions.map((option) => ({
              label: option.label,
              value: option.value,
            }))}
            value={sliderType}
            onChange={setSliderType}
            helpText="Choose the slider style that best fits your content"
            disabled={isSubmitting}
          />

          {/* Slider Type Preview */}
          {selectedSliderInfo && (
            <Card sectioned>
              <Stack vertical spacing="tight">
                <Stack alignment="center" spacing="tight">
                  <Text variant="headingSm" fontWeight="semibold">
                    {selectedSliderInfo.label}
                  </Text>
                  <div
                    style={{
                      padding: "4px 8px",
                      backgroundColor: "#e3f2fd",
                      borderRadius: "12px",
                      fontSize: "12px",
                      fontWeight: "500",
                      color: "#1976d2",
                    }}
                  >
                    {sliderType}
                  </div>
                </Stack>

                <Text variant="bodyMd" color="subdued">
                  {selectedSliderInfo.description}
                </Text>

                <div>
                  <Text variant="bodySm" fontWeight="semibold" color="success">
                    ✨ Features:
                  </Text>
                  <div style={{ marginTop: "0.5rem" }}>
                    {selectedSliderInfo.features.map((feature, index) => (
                      <div key={index} style={{ marginBottom: "0.25rem", display: "flex", alignItems: "center" }}>
                        <span style={{ color: "#008060", marginRight: "0.5rem", fontSize: "12px" }}>●</span>
                        <Text variant="bodySm" color="subdued">
                          {feature}
                        </Text>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Preview hint */}
                <div
                  style={{
                    marginTop: "1rem",
                    padding: "0.75rem",
                    backgroundColor: "#f0f8ff",
                    borderRadius: "8px",
                    border: "1px solid #e3f2fd",
                  }}
                >
                  <Text variant="bodySm" color="subdued">
                    💡 <strong>Tip:</strong> You can change the slider type later from the slider settings.
                  </Text>
                </div>
              </Stack>
            </Card>
          )}
        </FormLayout>
      </Modal.Section>
    </Modal>
  )
}
