"use client"
import { useState, useEffect } from "react"
import { Page, Stack, Heading, Button, Text, Badge, Spinner } from "@shopify/polaris"
import { ToastProvider, useToast } from "../contexts/toast-context"
import SliderSection from "../components/slider-section"
import CreateSliderModal from "../components/create-slider-modal"

function SliderPageContent() {
  const { showToast } = useToast()
  const [sliders, setSliders] = useState([])
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)


  useEffect(() => {
    fetchSliders()
  }, [])

  const fetchSliders = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await fetch("/api/sliders", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })
      if (!response.ok) {
        throw new Error(`Failed to fetch sliders: ${response.status} ${response.statusText}`)
      }
      const data = await response.json()
      console.log("Fetched sliders data:", data)
      const validatedSliders = data.map((slider) => ({
        id: slider.id,
        name: slider.name || "Unnamed Slider",
        sliderType: slider.sliderType || "center",
        isExpanded: Boolean(slider.isExpanded),
        shop: slider.shop,
        slides: Array.isArray(slider.slides)
          ? slider.slides
            .filter((slide) => slide && slide.id)
            .map((slide) => ({
              id: slide.id,
              imageUrl: slide.imageUrl || "",
              title: slide.title || "",
              description: slide.description || "",
              createdAt: slide.createdAt,
            }))
          : [],
        createdAt: slider.createdAt,
        updatedAt: slider.updatedAt,
      }))
      setSliders(validatedSliders)
      if (validatedSliders.length === 0) {
        showToast("No sliders found. Create your first slider to get started!")
      }
    } catch (err) {
      console.error("Fetch error:", err)
      setError(err.message)
      showToast(`Error fetching sliders: ${err.message}`, { error: true })
    } finally {
      setIsLoading(false)
    }
  }

  const createSlider = async (name, sliderType) => {
    try {
      if (!name || !name.trim()) {
        throw new Error("Slider name is required")
      }
      const response = await fetch("/api/sliders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          sliderType: sliderType || "center",
        }),
      })
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `Failed to create slider: ${response.status}`)
      }
      const newSlider = await response.json()
      console.log("Created new slider:", newSlider)
      const formattedSlider = {
        id: newSlider.id,
        name: newSlider.name,
        sliderType: newSlider.sliderType || "center",
        isExpanded: newSlider.isExpanded || false,
        shop: newSlider.shop,
        slides: [],
        createdAt: newSlider.createdAt,
        updatedAt: newSlider.updatedAt,
      }
      setSliders((prev) => [...prev, formattedSlider])
      setIsCreateModalOpen(false)
      showToast(`Slider "${newSlider.name}" created successfully!`)
    } catch (err) {
      console.error("Create slider error:", err)
      showToast(`Failed to create slider: ${err.message}`, { error: true })
    }
  }

  // New function to create slider from collection
  const createSliderFromCollection = async (name, sliderType, products) => {
    try {
      if (!products || products.length === 0) {
        throw new Error("No products provided")
      }

      // Check if there are any empty sliders (sliders with no slides)
      const emptySliders = sliders.filter(slider => !slider.slides || slider.slides.length === 0)

      let targetSlider
      let isNewSlider = false

      if (emptySliders.length > 0) {
        // Use the first empty slider
        targetSlider = emptySliders[0]
        console.log(`Using existing empty slider: "${targetSlider.name}" (ID: ${targetSlider.id})`)
      } else {
        // Create a new slider if no empty sliders exist
        if (!name || !name.trim()) {
          throw new Error("Slider name is required")
        }

        const sliderResponse = await fetch("/api/sliders", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: name.trim(),
            sliderType: sliderType || "center",
          }),
        })

        if (!sliderResponse.ok) {
          const errorData = await sliderResponse.json().catch(() => ({}))
          throw new Error(errorData.error || `Failed to create slider: ${sliderResponse.status}`)
        }

        targetSlider = await sliderResponse.json()
        isNewSlider = true
        console.log("Created new slider from collection:", targetSlider)
      }

      // Then add all products as slides
      const slides = []
      for (const product of products) {
        try {
          const slideResponse = await fetch(`/api/sliders/${targetSlider.id}/slides`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              imageUrl: product.imageUrl || "/placeholder.svg?height=250&width=400",
              title: product.title,
              description: product.description || "",
            }),
          })

          if (slideResponse.ok) {
            const slide = await slideResponse.json()
            slides.push({
              id: slide.id,
              imageUrl: slide.imageUrl,
              title: slide.title,
              description: slide.description,
              createdAt: slide.createdAt,
            })
          }
        } catch (slideError) {
          console.error("Error adding slide:", slideError)
          // Continue with other slides even if one fails
        }
      }

      if (isNewSlider) {
        // If it's a new slider, add it to the list
        const formattedSlider = {
          id: targetSlider.id,
          name: targetSlider.name,
          sliderType: targetSlider.sliderType || "center",
          isExpanded: true, // Expand to show the new slides
          shop: targetSlider.shop,
          slides: slides,
          createdAt: targetSlider.createdAt,
          updatedAt: targetSlider.updatedAt,
        }

        setSliders((prev) => [...prev, formattedSlider])
        showToast(`Slider "${targetSlider.name}" created with ${slides.length} slides from collection!`)
      } else {
        // If it's an existing slider, update it in the list
        setSliders((prev) =>
          prev.map(slider =>
            slider.id === targetSlider.id
              ? { ...slider, slides: slides, isExpanded: true }
              : slider
          )
        )
        showToast(`Added ${slides.length} slides from collection to "${targetSlider.name}"!`)
      }
    } catch (err) {
      console.error("Create slider from collection error:", err)
      showToast(`Failed to create slider from collection: ${err.message}`, { error: true })
      throw err
    }
  }

  const toggleSliderExpanded = async (sliderId) => {
    try {
      const slider = sliders.find((s) => s.id === sliderId)
      if (!slider) {
        throw new Error("Slider not found")
      }
      const response = await fetch(`/api/sliders/${sliderId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isExpanded: !slider.isExpanded }),
      })
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || "Failed to update slider")
      }
      const updatedSlider = await response.json()
      setSliders((prev) =>
        prev.map((slider) => (slider.id === sliderId ? { ...slider, isExpanded: updatedSlider.isExpanded } : slider)),
      )
    } catch (err) {
      console.error("Toggle expansion error:", err)
      showToast(`Failed to update slider: ${err.message}`, { error: true })
    }
  }

  const addSlideToSlider = async (sliderId, newSlide) => {
    try {
      if (!newSlide.imageUrl || !newSlide.title) {
        throw new Error("Image URL and title are required")
      }
      const response = await fetch(`/api/sliders/${sliderId}/slides`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          imageUrl: newSlide.imageUrl.trim(),
          title: newSlide.title.trim(),
          description: newSlide.description?.trim() || "",
        }),
      })
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || "Failed to add slide")
      }
      const createdSlide = await response.json()
      setSliders((prev) =>
        prev.map((slider) =>
          slider.id === sliderId
            ? {
              ...slider,
              slides: [
                ...slider.slides,
                {
                  id: createdSlide.id,
                  imageUrl: createdSlide.imageUrl,
                  title: createdSlide.title,
                  description: createdSlide.description,
                  createdAt: createdSlide.createdAt,
                },
              ],
            }
            : slider,
        ),
      )
      showToast("Slide added successfully!")
    } catch (err) {
      console.error("Add slide error:", err)
      showToast(`Failed to add slide: ${err.message}`, { error: true })
      throw err
    }
  }

  const updateSlideInSlider = async (updatedSlide) => {
    try {
      const slider = sliders.find((s) => s.slides && s.slides.some((slide) => slide.id === updatedSlide.id))
      if (!slider) {
        throw new Error("Slider not found for slide")
      }
      if (!updatedSlide.imageUrl || !updatedSlide.title) {
        throw new Error("Image URL and title are required")
      }
      const response = await fetch(`/api/sliders/${slider.id}/slides/${updatedSlide.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          imageUrl: updatedSlide.imageUrl.trim(),
          title: updatedSlide.title.trim(),
          description: updatedSlide.description?.trim() || "",
        }),
      })
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || "Failed to update slide")
      }
      const updatedSlideData = await response.json()
      setSliders((prev) =>
        prev.map((sliderItem) =>
          sliderItem.id === slider.id
            ? {
              ...sliderItem,
              slides: sliderItem.slides.map((slide) =>
                slide.id === updatedSlide.id
                  ? {
                    id: updatedSlideData.id,
                    imageUrl: updatedSlideData.imageUrl,
                    title: updatedSlideData.title,
                    description: updatedSlideData.description,
                    createdAt: slide.createdAt,
                    updatedAt: updatedSlideData.updatedAt,
                  }
                  : slide,
              ),
            }
            : sliderItem,
        ),
      )
      showToast("Slide updated successfully!")
    } catch (err) {
      console.error("Update slide error:", err)
      showToast(`Failed to update slide: ${err.message}`, { error: true })
      throw err
    }
  }

  const removeSlideFromSlider = async (sliderId, slideId) => {
    try {
      const response = await fetch(`/api/sliders/${sliderId}/slides/${slideId}`, {
        method: "DELETE",
      })
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || "Failed to delete slide")
      }
      setSliders((prev) =>
        prev.map((slider) =>
          slider.id === sliderId
            ? {
              ...slider,
              slides: slider.slides.filter((slide) => slide.id !== slideId),
            }
            : slider,
        ),
      )
      showToast("Slide deleted successfully!")
    } catch (err) {
      console.error("Error deleting slide:", err)
      showToast(`Failed to delete slide: ${err.message}`, { error: true })
      throw err
    }
  }

  const updateSliderName = async (sliderId, newName) => {
    try {
      if (!newName || !newName.trim()) {
        throw new Error("Slider name cannot be empty")
      }
      const response = await fetch(`/api/sliders/${sliderId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: newName.trim() }),
      })
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || "Failed to update slider name")
      }
      const updatedSlider = await response.json()
      setSliders((prev) =>
        prev.map((slider) =>
          slider.id === sliderId ? { ...slider, name: updatedSlider.name, updatedAt: updatedSlider.updatedAt } : slider,
        ),
      )
      showToast("Slider name updated successfully!")
    } catch (err) {
      console.error("Update slider name error:", err)
      showToast(`Failed to update slider name: ${err.message}`, { error: true })
      throw err
    }
  }

  const updateSliderType = async (sliderId, newType) => {
    try {
      const response = await fetch(`/api/sliders/${sliderId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ sliderType: newType }),
      })
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || "Failed to update slider type")
      }
      const updatedSlider = await response.json()
      setSliders((prev) =>
        prev.map((slider) =>
          slider.id === sliderId
            ? {
              ...slider,
              sliderType: updatedSlider.sliderType,
              updatedAt: updatedSlider.updatedAt,
            }
            : slider,
        ),
      )
      showToast(`Slider type changed to "${newType}"!`)
    } catch (err) {
      console.error("Update slider type error:", err)
      showToast(`Failed to update slider type: ${err.message}`, { error: true })
      throw err
    }
  }

  const deleteSlider = async (sliderId) => {
    try {
      const slider = sliders.find((s) => s.id === sliderId)
      if (!slider) {
        throw new Error("Slider not found")
      }
      const response = await fetch(`/api/sliders/${sliderId}`, {
        method: "DELETE",
      })
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || "Failed to delete slider")
      }
      setSliders((prev) => prev.filter((slider) => slider.id !== sliderId))
      showToast(`Slider "${slider.name}" deleted successfully!`)
    } catch (err) {
      console.error("Delete slider error:", err)
      showToast(`Failed to delete slider: ${err.message}`, { error: true })
      throw err
    }
  }

  const totalSlides = sliders.reduce((total, slider) => total + (slider.slides?.length || 0), 0)

  if (isLoading) {
    return (
      <Page>
        <div style={{ textAlign: "center", padding: "4rem 2rem" }}>
          <Stack vertical spacing="loose" alignment="center">
            <Spinner size="large" />
            <Text variant="headingMd" color="subdued">
              Loading sliders...
            </Text>
          </Stack>
        </div>
      </Page>
    )
  }

  if (error) {
    return (
      <Page>
        <div style={{ textAlign: "center", padding: "4rem 2rem" }}>
          <Stack vertical spacing="loose" alignment="center">
            <div
              style={{
                padding: "2rem",
                background: "#fff5f5",
                border: "1px solid #fed7d7",
                borderRadius: "8px",
                maxWidth: "500px",
              }}
            >
              <Stack vertical spacing="tight" alignment="center">
                <Text variant="headingMd" color="critical">
                  ⚠️ Error Loading Sliders
                </Text>
                <Text color="subdued">{error}</Text>
                <Button onClick={fetchSliders} primary>
                  Try Again
                </Button>
              </Stack>
            </div>
          </Stack>
        </div>
      </Page>
    )
  }

  return (
    <Page>
      <div style={{ padding: "2rem", backgroundColor: "#f6f6f7", minHeight: "100vh" }}>
        <div style={{ textAlign: "center", marginBottom: "3rem" }}>
          <Stack vertical spacing="tight" alignment="center">
            <Heading element="h1">🎠 Multi-Slider Manager</Heading>
            <Text variant="headingMd" color="subdued">
              Create and manage multiple sliders with ease
            </Text>
            <Stack alignment="center" spacing="tight">
              <Badge status="success">
                {sliders.length} Slider{sliders.length !== 1 ? "s" : ""}
              </Badge>
              <Badge status="info">
                {totalSlides} Total Slide{totalSlides !== 1 ? "s" : ""}
              </Badge>
            </Stack>
          </Stack>
        </div>
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <Button primary size="large" onClick={() => setIsCreateModalOpen(true)}>
            ➕ Create New Slider
          </Button>
        </div>
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <Button primary size="large" onClick="">
            ➕ Create New Slider from collection
          </Button>

        </div>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <Stack vertical spacing="loose">
            {sliders.map((slider) => (
              <SliderSection
                key={slider.id}
                slider={slider}
                onToggleExpanded={toggleSliderExpanded}
                onAddSlide={addSlideToSlider}
                onUpdateSlide={updateSlideInSlider}
                onRemoveSlide={removeSlideFromSlider}
                onUpdateSliderName={updateSliderName}
                onUpdateSliderType={updateSliderType}
                onDeleteSlider={deleteSlider}
                onCreateFromCollection={createSliderFromCollection}
              />
            ))}
            {sliders.length === 0 && (
              <div style={{ textAlign: "center", padding: "4rem 2rem" }}>
                <div
                  style={{
                    background: "white",
                    padding: "3rem",
                    borderRadius: "12px",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                    maxWidth: "500px",
                    margin: "0 auto",
                  }}
                >
                  <Stack vertical spacing="loose" alignment="center">
                    <div style={{ fontSize: "4rem" }}>🎠</div>
                    <Heading>No Sliders Yet</Heading>
                    <Text color="subdued" variant="bodyMd">
                      Create your first slider to get started! You can add beautiful image sliders to showcase your
                      products and content.
                    </Text>
                    <Button primary onClick={() => setIsCreateModalOpen(true)}>
                      Create Your First Slider
                    </Button>
                  </Stack>
                </div>
              </div>
            )}
          </Stack>
        </div>
        <CreateSliderModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onCreateSlider={createSlider}
        />
      </div>
    </Page>
  )
}

export default function SliderPage() {
  return (
    <ToastProvider>
      <SliderPageContent />
    </ToastProvider>
  )
}
