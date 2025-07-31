"use client"

import { useState } from "react"
import CreateSliderSection from "../components/Collection-slider/create-slider-section"
import SlidersSection from "../components/Collection-slider/sliders-section"
import CollectionModal from "../components/Collection-slider/collection-modal"
import CodeModal from "../components/Collection-slider/code-modal"
import { dummyCollections } from "../data/dummy-collections"

const SliderManagementSystem = () => {
  const [sliders, setSliders] = useState([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isCodeModalOpen, setIsCodeModalOpen] = useState(false)
  const [selectedSliderForCode, setSelectedSliderForCode] = useState(null)

  const handleCreateSlider = (collection) => {
    // Check if slider already exists for this collection
    const existingSlider = sliders.find((slider) => slider.id === collection.id)
    if (existingSlider) {
      alert("A slider for this collection already exists!")
      setIsModalOpen(false)
      return
    }

    setSliders((prev) => [...prev, collection])
    setIsModalOpen(false)
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
        <SlidersSection
          sliders={sliders}
          onDeleteSlider={handleDeleteSlider}
          onCopyCode={handleCopyCode}
          onCreateSlider={openCreateModal}
        />

        {/* Collection Selection Modal */}
        <CollectionModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSelectCollection={handleCreateSlider}
          collections={dummyCollections}
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
