"use client"

import { useState, useEffect } from "react"
import CreateSliderSection from "../components/Collection-slider/create-slider-section"
import SlidersSection from "../components/Collection-slider/sliders-section"
import CollectionModal from "../components/Collection-slider/collection-modal"
import CodeModal from "../components/Collection-slider/code-modal"

const SliderManagementSystem = () => {
  const [sliders, setSliders] = useState([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isCodeModalOpen, setIsCodeModalOpen] = useState(false)
  const [selectedSliderForCode, setSelectedSliderForCode] = useState(null)
  const [collections, setCollections] = useState([])
  const [loadingCollections, setLoadingCollections] = useState(true)
  const [errorCollections, setErrorCollections] = useState(null)

  // Fetch all collections when the component mounts
  useEffect(() => {
    const fetchCollections = async () => {
      try {
        setLoadingCollections(true)
        const response = await fetch("/api/collections")
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json()
        const formattedCollections = data.map((col) => ({
          id: col.id,
          name: col.title,
          productCount: col.products_count,
          products: [], // Products will be fetched when a slider is created
        }))
        setCollections(formattedCollections)
      } catch (error) {
        console.error("Error fetching collections:", error)
        setErrorCollections("Failed to load collections. Please try again.")
      } finally {
        setLoadingCollections(false)
      }
    }

    fetchCollections()
  }, [])

  const handleCreateSlider = async (collection) => {
    const existingSlider = sliders.find((slider) => slider.id === collection.id)
    if (existingSlider) {
      alert("A slider for this collection already exists!")
      setIsModalOpen(false)
      return
    }

    try {
      const response = await fetch(`/api/collections/${collection.id}/products`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const productsData = await response.json()

      const newSlider = {
        ...collection,
        products: productsData.map((product) => {
          // Assuming your backend will eventually provide these fields
          // For now, they will be null/N/A if not present in your backend's response
          const originalPrice = product.originalPrice || null
          const salePrice = product.salePrice || "N/A"
          const colors = product.colors || []
          const onSale = product.onSale || false

          return {
            id: product.id,
            title: product.title,
            description: product.description,
            image: product.imageUrl,
            vendor: product.vendor,
            productNumber: product.product_type, // Still using product_type as productNumber
            originalPrice,
            salePrice,
            colors,
            onSale,
          }
        }),
      }
      setSliders((prev) => [...prev, newSlider])
      setIsModalOpen(false)
    } catch (error) {
      console.error("Error fetching products for collection:", error)
      alert("Failed to create slider: Could not fetch products for this collection.")
    }
  }

  const handleDeleteSlider = (sliderId) => {
    if (window.confirm("Are you sure you want to delete this slider?")) {
      setSliders((prev) => prev.filter((slider) => slider.id !== sliderId))
    }
  }

  const handleCopyCode = (collection) => {
    setSelectedSliderForCode(collection)
    setIsCodeModalOpen(true)
  }

  const openCreateModal = () => {
    setIsModalOpen(true)
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#f8f9fa",
        padding: "20px",
      }}
    >
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
        }}
      >
        {/* Create Slider Section */}
        <CreateSliderSection onCreateSlider={openCreateModal} />

        {/* Sliders Section */}
        {loadingCollections ? (
          <div style={{ textAlign: "center", padding: "60px", color: "#637381" }}>Loading collections...</div>
        ) : errorCollections ? (
          <div style={{ textAlign: "center", padding: "60px", color: "#d73502" }}>{errorCollections}</div>
        ) : (
          <SlidersSection
            sliders={sliders}
            onDeleteSlider={handleDeleteSlider}
            onCopyCode={handleCopyCode}
            onCreateSlider={openCreateModal}
          />
        )}

        {/* Collection Selection Modal */}
        <CollectionModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSelectCollection={handleCreateSlider}
          collections={collections}
        />

        {/* Code Modal */}
        <CodeModal
          isOpen={isCodeModalOpen}
          onClose={() => {
            setIsCodeModalOpen(false)
            setSelectedSliderForCode(null)
          }}
          collection={selectedSliderForCode}
        />
      </div>
    </div>
  )
}

export default SliderManagementSystem
