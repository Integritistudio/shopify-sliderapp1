"use client"

const CreateSliderSection = ({ onCreateSlider }) => {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "32px",
        padding: "20px",
        backgroundColor: "#ffffff",
        borderRadius: "8px",
        boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
      }}
    >
      <div>
        <h1
          style={{
            margin: "0 0 8px 0",
            fontSize: "28px",
            fontWeight: "700",
            color: "#202223",
          }}
        >
          Collection Sliders
        </h1>
        <p
          style={{
            margin: 0,
            color: "#637381",
            fontSize: "16px",
          }}
        >
          Create and manage product collection sliders for your store
        </p>
      </div>
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
        + Create Slider
      </button>
    </div>
  )
}

export default CreateSliderSection
