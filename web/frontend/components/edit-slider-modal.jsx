"use client"

import { useState, useEffect } from "react"
import { Modal, Card, Stack, Text, Button, TextField } from "@shopify/polaris"
import { useToast } from "../contexts/toast-context"

export default function EditSliderModal({
  isOpen,
  onClose,
  slides,
  onUpdateSlide,
  onRemoveSlide,
  sliderName,
  isLoading,
}) {
  const { showToast } = useToast()
  const [editingSlides, setEditingSlides] = useState([])
  const [savingSlides, setSavingSlides] = useState(new Set())

  useEffect(() => {
    if (isOpen && slides) {
      const validSlides = slides.filter((slide) => slide && typeof slide === "object" && slide.id)
      setEditingSlides([...validSlides])
    }
  }, [isOpen, slides])

  const handleSlideChange = (slideId, field, value) => {
    setEditingSlides((prev) =>
      prev
        .map((slide) => (slide && slide.id === slideId ? { ...slide, [field]: value } : slide))
        .filter((slide) => slide && slide.id),
    )
  }

  const handleRemoveSlide = async (slideId) => {
    if (!confirm("Are you sure you want to remove this slide?")) return

    try {
      await onRemoveSlide(slideId)
      setEditingSlides((prev) => prev.filter((slide) => slide && slide.id !== slideId))
      showToast("Slide removed successfully")
    } catch (error) {
      console.error("Failed to remove slide:", error)
      showToast("Failed to remove slide. Please try again.", { error: true })
    }
  }

  const handleSaveSlide = async (slide) => {
    if (!slide.title.trim()) {
      showToast("Title is required", { error: true })
      return
    }

    setSavingSlides((prev) => new Set([...prev, slide.id]))
    try {
      await onUpdateSlide(slide)
      showToast("Slide updated successfully")
    } catch (error) {
      console.error("Failed to update slide:", error)
      showToast("Failed to update slide. Please try again.", { error: true })
    } finally {
      setSavingSlides((prev) => {
        const newSet = new Set(prev)
        newSet.delete(slide.id)
        return newSet
      })
    }
  }

  const validEditingSlides = editingSlides.filter((slide) => slide && typeof slide === "object" && slide.id)

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      title={`Edit "${sliderName}" Slides`}
      large
      secondaryActions={[
        {
          content: "Close",
          onAction: onClose,
        },
      ]}
    >
      <Modal.Section>
        <Stack vertical spacing="loose">
          {validEditingSlides.map((slide) => (
            <Card key={slide.id} sectioned>
              <Stack vertical spacing="tight">
                <Stack alignment="center" distribution="equalSpacing">
                  <Text variant="headingSm">Slide {slide.id}</Text>
                  <Stack>
                    <Button
                      primary
                      size="slim"
                      onClick={() => handleSaveSlide(slide)}
                      loading={savingSlides.has(slide.id)}
                      disabled={!slide.title?.trim()}
                    >
                      Save
                    </Button>
                    <Button destructive size="slim" onClick={() => handleRemoveSlide(slide.id)} loading={isLoading}>
                      Remove
                    </Button>
                  </Stack>
                </Stack>

                <Stack>
                  <div style={{ width: "200px", flexShrink: 0 }}>
                    <img
                      src={slide.imageUrl || "/placeholder.svg?height=120&width=200"}
                      alt={slide.title || "Slide"}
                      style={{
                        width: "100%",
                        height: "120px",
                        objectFit: "cover",
                        borderRadius: "8px",
                        border: "1px solid #e1e3e5",
                      }}
                      onError={(e) => {
                        e.target.src = "/placeholder.svg?height=120&width=200"
                      }}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <Stack vertical spacing="tight">
                      <TextField
                        label="Image URL"
                        value={slide.imageUrl || ""}
                        onChange={(value) => handleSlideChange(slide.id, "imageUrl", value)}
                        placeholder="https://example.com/image.jpg"
                        disabled={isLoading}
                      />
                      <TextField
                        label="Title"
                        value={slide.title || ""}
                        onChange={(value) => handleSlideChange(slide.id, "title", value)}
                        placeholder="Enter slide title"
                        disabled={isLoading}
                        requiredIndicator
                      />
                      <TextField
                        label="Description"
                        value={slide.description || ""}
                        onChange={(value) => handleSlideChange(slide.id, "description", value)}
                        placeholder="Enter slide description"
                        multiline={2}
                        disabled={isLoading}
                      />
                    </Stack>
                  </div>
                </Stack>
              </Stack>
            </Card>
          ))}

          {validEditingSlides.length === 0 && (
            <Card sectioned>
              <Stack alignment="center">
                <Text color="subdued">No slides to edit. Add some slides first!</Text>
              </Stack>
            </Card>
          )}
        </Stack>
      </Modal.Section>
    </Modal>
  )
}
