

"use client"

import { useState } from "react"
import { Modal, FormLayout, TextField, Button, Stack, Text, Spinner } from "@shopify/polaris"
import { useToast } from "../contexts/toast-context"

export default function AddSlideModal({ isOpen, onClose, onAddSlide, sliderName }) {
  const { showToast } = useToast()
  const [formData, setFormData] = useState({
    imageUrl: "",
    title: "",
    description: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageLoading, setImageLoading] = useState(false)

  const handleInputChange = (value, name) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))

    if (name === "imageUrl") {
      setImageLoaded(false)
      if (value.trim()) {
        setImageLoading(true)
      }
    }
  }

  const handleImageLoad = () => {
    setImageLoaded(true)
    setImageLoading(false)
  }

  const handleImageError = () => {
    setImageLoaded(false)
    setImageLoading(false)
    showToast("Failed to load image. Please check the URL.", { error: true })
  }

  const handleSubmit = async () => {
    if (!formData.title.trim()) {
      showToast("Please enter a title for the slide", { error: true })
      return
    }

    setIsSubmitting(true)
    try {
      const slideData = {
        imageUrl: formData.imageUrl.trim() || "/placeholder.svg?height=250&width=400",
        title: formData.title.trim(),
        description: formData.description.trim(),
      }

      await onAddSlide(slideData)

      // Reset form
      setFormData({
        imageUrl: "",
        title: "",
        description: "",
      })
      setImageLoaded(false)
      setImageLoading(false)
      onClose()
      showToast("Slide added successfully!")
    } catch (error) {
      console.error("Error adding slide:", error)
      showToast("Error adding slide. Please try again.", { error: true })
    } finally {
      setIsSubmitting(false)
    }
  }


  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      title={`Add New Slide to "${sliderName}"`}
      primaryAction={{
        content: isSubmitting ? "Adding..." : "Add Slide",
        onAction: handleSubmit,
        loading: isSubmitting,
        disabled: !formData.title.trim(),
      }}
      secondaryActions={[
        {
          content: "Cancel",
          onAction: onClose,
        },
      ]}
    >
      <Modal.Section>
        <FormLayout>
          <Stack>
            <div style={{ flex: 1 }}>
              <TextField
                label="Image URL"
                value={formData.imageUrl}
                onChange={(value) => handleInputChange(value, "imageUrl")}
                placeholder="https://example.com/image.jpg (optional)"
                helpText="Leave empty to use a default placeholder image"
              />
            </div>

          </Stack>

          <TextField
            label="Title"
            value={formData.title}
            onChange={(value) => handleInputChange(value, "title")}
            placeholder="Enter slide title"
            requiredIndicator
          />

          <TextField
            label="Description"
            value={formData.description}
            onChange={(value) => handleInputChange(value, "description")}
            placeholder="Enter slide description (optional)"
            multiline={4}
          />

          {/* Image Preview */}
          {formData.imageUrl && (
            <div style={{ marginTop: "1rem" }}>
              <Text variant="headingMd">Image Preview</Text>
              <div
                style={{
                  marginTop: "0.5rem",
                  border: "1px solid #e1e3e5",
                  borderRadius: "8px",
                  overflow: "hidden",
                  position: "relative",
                  backgroundColor: "#f6f6f7",
                  minHeight: "200px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {imageLoading && (
                  <Stack vertical alignment="center">
                    <Spinner size="large" />
                    <Text color="subdued">Loading image...</Text>
                  </Stack>
                )}
                <img
                  src={formData.imageUrl || "/placeholder.svg"}
                  alt="Preview"
                  style={{
                    width: "100%",
                    maxHeight: "250px",
                    objectFit: "contain",
                    display: imageLoading ? "none" : "block",
                  }}
                  onLoad={handleImageLoad}
                  onError={handleImageError}
                />
              </div>
            </div>
          )}

          {/* Text Preview */}
          {(formData.title || formData.description) && (
            <div
              style={{
                marginTop: "1rem",
                padding: "1rem",
                border: "1px solid #e1e3e5",
                borderRadius: "8px",
                backgroundColor: "#f9f9f9",
              }}
            >
              <Stack vertical spacing="tight">
                <Text variant="headingMd">Preview</Text>
                {formData.title && (
                  <Text variant="headingSm" fontWeight="semibold">
                    {formData.title}
                  </Text>
                )}
                {formData.description && <Text color="subdued">{formData.description}</Text>}
              </Stack>
            </div>
          )}
        </FormLayout>
      </Modal.Section>
    </Modal>
  )
}
