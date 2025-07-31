"use client"

import CollectionSlider from "./collection-slider"

const SlidersSection = ({ sliders, onDeleteSlider, onCopyCode, onCreateSlider }) => {
  if (sliders.length === 0) {
    return (
      <div
        style={{
          textAlign: "center",
          padding: "60px 20px",
          backgroundColor: "#ffffff",
          borderRadius: "8px",
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
        }}
      >
        <h3
          style={{
            margin: "0 0 12px 0",
            fontSize: "20px",
            color: "#637381",
          }}
        >
          No sliders created yet
        </h3>
        <p
          style={{
            margin: "0 0 24px 0",
            color: "#637381",
          }}
        >
          Click "Create Slider" to get started with your first collection slider
        </p>
        <button
          onClick={onCreateSlider}
          style={{
            backgroundColor: "#0066cc",
            color: "#ffffff",
            border: "none",
            padding: "12px 24px",
            borderRadius: "6px",
            fontSize: "14px",
            fontWeight: "500",
            cursor: "pointer",
            transition: "background-color 0.2s ease",
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = "#0052a3"
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = "#0066cc"
          }}
        >
          Create Your First Slider
        </button>
      </div>
    )
  }

  return (
    <div>
      {sliders.map((slider) => (
        <CollectionSlider key={slider.id} collection={slider} onDelete={onDeleteSlider} onCopyCode={onCopyCode} />
      ))}
    </div>
  )
}

export default SlidersSection
