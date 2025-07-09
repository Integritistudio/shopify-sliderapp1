"use client"

import { useState } from "react"
import { Card, Stack, Text, Button, Badge, Collapsible, Icon } from "@shopify/polaris"
import { ChevronDownMinor, ChevronUpMinor } from "@shopify/polaris-icons"
import { useToast } from "../contexts/toast-context"
import DynamicSlickSlider from "./dynamic-slick-slider"
import AddSlideModal from "./add-slide-modal"
import EditSliderModal from "./edit-slider-modal"
import AddToThemeModal from "./add-to-theme-modal"

export default function SliderSection({
  slider,
  onToggleExpanded,
  onAddSlide,
  onUpdateSlide,
  onRemoveSlide,
  onUpdateSliderName,
  onDeleteSlider,
  onRefresh,
  onUpdateSliderType,
}) {
  const { showToast } = useToast()
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isAddToThemeModalOpen, setIsAddToThemeModalOpen] = useState(false)
  const [isEditingName, setIsEditingName] = useState(false)
  const [tempName, setTempName] = useState(slider.name)
  const [isLoading, setIsLoading] = useState(false)

  const slides = Array.isArray(slider.slides)
    ? slider.slides.filter((slide) => slide && typeof slide === "object" && slide.id)
    : []

  const handleNameSave = async () => {
    if (!tempName.trim()) {
      showToast("Slider name cannot be empty", { error: true })
      return
    }

    try {
      setIsLoading(true)
      await onUpdateSliderName(slider.id, tempName.trim())
      setIsEditingName(false)
      showToast("Slider name updated successfully!")
    } catch (error) {
      console.error("Failed to update slider name:", error)
      showToast("Failed to update slider name", { error: true })
    } finally {
      setIsLoading(false)
    }
  }

  const handleNameCancel = () => {
    setTempName(slider.name)
    setIsEditingName(false)
  }

  const handleAddSlide = async (slideData) => {
    try {
      setIsLoading(true)
      await onAddSlide(slider.id, slideData)
      setIsAddModalOpen(false)
    } catch (error) {
      console.error("Failed to add slide:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRemoveSlide = async (slideId) => {
    try {
      setIsLoading(true)
      await onRemoveSlide(slider.id, slideId)
    } catch (error) {
      console.error("Failed to remove slide:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteSlider = () => {
    if (confirm("Are you sure you want to delete this slider? This action cannot be undone.")) {
      onDeleteSlider(slider.id)
    }
  }

  function getSliderTypeInfo(type) {
    const types = {
      center: { label: "Center Mode", color: "info" },
      fade: { label: "Fade Transition", color: "success" },
      lazy: { label: "Lazy Loading", color: "warning" },
      autoplay: { label: "Autoplay", color: "highlight" },
      infinite: { label: "Infinite Loop", color: "attention" },
      variable: { label: "Variable Width", color: "new" },
      vertical: { label: "Vertical", color: "info" },
    }
    return types[type] || types.center
  }

  const sliderTypeInfo = getSliderTypeInfo(slider.sliderType)

  return (
    <>
      {/* Fixed: Removed extra spacing and improved card structure */}
      <Card>
        <div style={{ padding: "1.5rem" }}>
          {/* Header - Fixed: Better spacing and alignment */}
          <div
            style={{ cursor: "pointer", marginBottom: slider.isExpanded ? "1.5rem" : "0" }}
            onClick={() => onToggleExpanded(slider.id)}
          >
            <Stack alignment="center" distribution="equalSpacing">
              <Stack alignment="center" spacing="tight">
                <Icon source={slider.isExpanded ? ChevronUpMinor : ChevronDownMinor} />

                {isEditingName ? (
                  <Stack alignment="center" spacing="tight">
                    <input
                      type="text"
                      value={tempName}
                      onChange={(e) => setTempName(e.target.value)}
                      style={{
                        padding: "8px 12px",
                        border: "2px solid #008060",
                        borderRadius: "6px",
                        fontSize: "16px",
                        fontWeight: "600",
                        minWidth: "200px",
                        outline: "none",
                      }}
                      onClick={(e) => e.stopPropagation()}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleNameSave()
                        if (e.key === "Escape") handleNameCancel()
                      }}
                      autoFocus
                    />
                    <Button
                      primary
                      size="slim"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleNameSave()
                      }}
                      loading={isLoading}
                    >
                      Save
                    </Button>
                    <Button
                      size="slim"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleNameCancel()
                      }}
                    >
                      Cancel
                    </Button>
                  </Stack>
                ) : (
                  <Stack alignment="center" spacing="tight">
                    <Text variant="headingMd" fontWeight="semibold">
                      {slider.name}
                    </Text>
                    <Button
                      plain
                      size="slim"
                      onClick={(e) => {
                        e.stopPropagation()
                        setIsEditingName(true)
                      }}
                    >
                      Edit Name
                    </Button>
                  </Stack>
                )}

                <Badge status="info">{slides.length} slides</Badge>
                <Badge status={sliderTypeInfo.color}>{sliderTypeInfo.label}</Badge>
              </Stack>

              <Stack alignment="center" spacing="tight">
                <Button
                  primary
                  size="slim"
                  onClick={(e) => {
                    e.stopPropagation()
                    setIsAddToThemeModalOpen(true)
                  }}
                  disabled={slides.length === 0}
                >
                  Get Code
                </Button>
                <Button
                  destructive
                  size="slim"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDeleteSlider()
                  }}
                >
                  Delete
                </Button>
              </Stack>
            </Stack>
          </div>

          {/* Fixed: Collapsible Content - No extra spacing issues */}
          <Collapsible open={slider.isExpanded}>
            <div>
              <Stack vertical spacing="loose">
                {/* Slider Display */}
                {slides.length > 0 ? (
                  <div
                    style={{
                      border: "1px solid #e1e3e5",
                      borderRadius: "8px",
                      overflow: "hidden",
                      backgroundColor: "#fff",
                    }}
                  >
                    <DynamicSlickSlider
                      slides={slides}
                      sliderId={slider.id}
                      sliderType={slider.sliderType || "center"}
                      key={`${slider.id}-${slides.length}-${slides.map((s) => s.id).join("-")}`}
                    />
                  </div>
                ) : (
                  <div
                    style={{
                      textAlign: "center",
                      padding: "3rem 2rem",
                      background: "#f9f9f9",
                      borderRadius: "12px",
                      border: "2px dashed #c9cccf",
                    }}
                  >
                    <Stack vertical spacing="tight" alignment="center">
                      <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🎠</div>
                      <Text variant="headingMd" color="subdued">
                        No Slides Yet
                      </Text>
                      <Text color="subdued">Add your first slide to get started!</Text>
                    </Stack>
                  </div>
                )}

                {/* Action Buttons */}
                <div style={{ textAlign: "center", paddingTop: "1rem" }}>
                  <Stack distribution="center" spacing="loose">
                    <Button primary size="large" onClick={() => setIsAddModalOpen(true)} loading={isLoading}>
                      Add New Slide
                    </Button>
                    <Button
                      size="large"
                      onClick={() => setIsEditModalOpen(true)}
                      disabled={slides.length === 0 || isLoading}
                    >
                      Edit Slides ({slides.length})
                    </Button>
                  </Stack>
                </div>
              </Stack>
            </div>
          </Collapsible>
        </div>
      </Card>

      {/* Modals */}
      <AddSlideModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddSlide={handleAddSlide}
        sliderName={slider.name}
      />

      <EditSliderModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        slides={slides}
        onUpdateSlide={onUpdateSlide}
        onRemoveSlide={handleRemoveSlide}
        sliderName={slider.name}
        isLoading={isLoading}
      />

      <AddToThemeModal
        isOpen={isAddToThemeModalOpen}
        onClose={() => setIsAddToThemeModalOpen(false)}
        slider={slider}
        onDeploy={() => {
          if (onRefresh) {
            onRefresh()
          }
        }}
      />
    </>
  )
}
