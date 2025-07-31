"use client"

import { useState } from "react"
import { CopyIcon, TrashIcon, ArrowLeft, ArrowRight, ChevronDown, ChevronUp } from "./icons"

const CollectionSlider = ({ collection, onDelete, onCopyCode }) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isCollapsed, setIsCollapsed] = useState(false)

  const itemsPerView = 4
  const maxIndex = Math.max(0, collection.products.length - itemsPerView)

  const nextSlide = () => {
    setCurrentIndex((prev) => Math.min(prev + 1, maxIndex))
  }

  const prevSlide = () => {
    setCurrentIndex((prev) => Math.max(prev - 1, 0))
  }

  return (
    <div
      style={{
        marginBottom: "32px",
        border: "1px solid #e1e3e5",
        borderRadius: "8px",
        backgroundColor: "#ffffff",
        overflow: "hidden",
      }}
    >
      {/* Slider Header */}
      <div
        style={{
          padding: "16px 20px",
          backgroundColor: "#f8f9fa",
          borderBottom: "1px solid #e1e3e5",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              color: "#637381",
            }}
          >
            {isCollapsed ? <ChevronDown /> : <ChevronUp />}
          </button>
          <h3
            style={{
              margin: 0,
              fontSize: "18px",
              fontWeight: "600",
              color: "#202223",
            }}
          >
            {collection.name}
          </h3>
          <span
            style={{
              backgroundColor: "#e3f2fd",
              color: "#1976d2",
              padding: "4px 8px",
              borderRadius: "12px",
              fontSize: "12px",
              fontWeight: "500",
            }}
          >
            {collection.products.length} products
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <button
            onClick={() => onCopyCode(collection)}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#0066cc",
              padding: "8px",
              borderRadius: "4px",
              display: "flex",
              alignItems: "center",
              transition: "background-color 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = "#e3f2fd"
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = "transparent"
            }}
            title="Copy Slider Code"
          >
            <CopyIcon />
          </button>
          <button
            onClick={() => onDelete(collection.id)}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#d73502",
              padding: "8px",
              borderRadius: "4px",
              display: "flex",
              alignItems: "center",
              transition: "background-color 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = "#fef2f2"
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = "transparent"
            }}
            title="Delete Slider"
          >
            <TrashIcon />
          </button>
        </div>
      </div>

      {/* Slider Content */}
      {!isCollapsed && (
        <div
          style={{
            position: "relative",
            padding: "20px",
            backgroundColor: "#f6f6f7",
          }}
        >
          {/* Navigation Buttons */}
          <button
            onClick={prevSlide}
            disabled={currentIndex === 0}
            style={{
              position: "absolute",
              left: "10px",
              top: "50%",
              transform: "translateY(-50%)",
              zIndex: 10,
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              border: "1px solid #c9cccf",
              backgroundColor: "#ffffff",
              cursor: currentIndex === 0 ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: currentIndex === 0 ? "#c9cccf" : "#637381",
              transition: "all 0.2s ease",
              opacity: currentIndex === 0 ? 0.5 : 1,
            }}
            onMouseEnter={(e) => {
              if (currentIndex !== 0) {
                e.target.style.backgroundColor = "#000000"
                e.target.style.color = "#ffffff"
              }
            }}
            onMouseLeave={(e) => {
              if (currentIndex !== 0) {
                e.target.style.backgroundColor = "#ffffff"
                e.target.style.color = "#637381"
              }
            }}
          >
            <ArrowLeft />
          </button>

          <button
            onClick={nextSlide}
            disabled={currentIndex === maxIndex}
            style={{
              position: "absolute",
              right: "10px",
              top: "50%",
              transform: "translateY(-50%)",
              zIndex: 10,
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              border: "1px solid #c9cccf",
              backgroundColor: "#ffffff",
              cursor: currentIndex === maxIndex ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: currentIndex === maxIndex ? "#c9cccf" : "#637381",
              transition: "all 0.2s ease",
              opacity: currentIndex === maxIndex ? 0.5 : 1,
            }}
            onMouseEnter={(e) => {
              if (currentIndex !== maxIndex) {
                e.target.style.backgroundColor = "#000000"
                e.target.style.color = "#ffffff"
              }
            }}
            onMouseLeave={(e) => {
              if (currentIndex !== maxIndex) {
                e.target.style.backgroundColor = "#ffffff"
                e.target.style.color = "#637381"
              }
            }}
          >
            <ArrowRight />
          </button>

          {/* Products Container */}
          <div
            style={{
              overflow: "hidden",
              margin: "0 50px",
            }}
          >
            <div
              style={{
                display: "flex",
                transform: `translateX(-${currentIndex * (100 / itemsPerView + 4)}%)`,
                transition: "transform 0.3s ease",
                gap: "16px",
              }}
            >
              {collection.products.map((product) => (
                <div
                  key={product.id}
                  style={{
                    flex: `0 0 calc(${100 / itemsPerView}% - 12px)`,
                    minWidth: 0,
                  }}
                >
                  <div
                    style={{
                      backgroundColor: "#ffffff",
                      borderRadius: "8px",
                      overflow: "hidden",
                      boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
                      transition: "box-shadow 0.2s ease",
                      height: "420px", // Fixed height for all cards
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    <div style={{ position: "relative" }}>
                      {/* Sale Badge */}
                      {product.onSale && (
                        <div
                          style={{
                            position: "absolute",
                            top: "8px",
                            left: "8px",
                            backgroundColor: "#d73502",
                            color: "white",
                            padding: "4px 8px",
                            fontSize: "12px",
                            fontWeight: "500",
                            borderRadius: "2px",
                            zIndex: 5,
                          }}
                        >
                          Sale
                        </div>
                      )}

                      {/* Product Image */}
                      <div
                        style={{
                          position: "relative",
                          paddingBottom: "75%",
                          overflow: "hidden",
                          backgroundColor: "#f6f6f7",
                        }}
                      >
                        <img
                          src={product.image || "/placeholder.svg"}
                          alt={product.title}
                          style={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            transition: "transform 0.3s ease",
                            cursor: "pointer",
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.transform = "scale(1.05)"
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.transform = "scale(1)"
                          }}
                        />
                      </div>

                      {/* Product Info */}
                      <div
                        style={{
                          padding: "16px",
                          flex: "1",
                          display: "flex",
                          flexDirection: "column",
                          justifyContent: "space-between",
                        }}
                      >
                        {/* Vendor */}
                        <p
                          style={{
                            margin: "0 0 4px 0",
                            fontSize: "12px",
                            color: "#637381",
                          }}
                        >
                          {product.vendor}
                        </p>

                        {/* Product Title */}
                        <p
                          style={{
                            margin: "0 0 8px 0",
                            fontSize: "13px",
                            lineHeight: "1.4",
                            color: "#637381",
                          }}
                        >
                          ({product.productNumber}) {product.title}
                        </p>

                        {/* Price */}
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            marginBottom: "12px",
                          }}
                        >
                          {product.originalPrice && (
                            <span
                              style={{
                                textDecoration: "line-through",
                                fontSize: "12px",
                                color: "#637381",
                              }}
                            >
                              {product.originalPrice}
                            </span>
                          )}
                          {product.originalPrice && (
                            <span
                              style={{
                                fontSize: "12px",
                                color: "#637381",
                              }}
                            >
                              From
                            </span>
                          )}
                          <span
                            style={{
                              color: "#000000",
                              fontWeight: "600",
                              fontSize: "16px",
                            }}
                          >
                            {product.salePrice}
                          </span>
                        </div>

                        {/* Color Options */}
                        <div
                          style={{
                            display: "flex",
                            gap: "6px",
                            marginBottom: "16px",
                          }}
                        >
                          {product.colors.map((color, index) => (
                            <div
                              key={index}
                              style={{
                                width: "16px",
                                height: "16px",
                                borderRadius: "50%",
                                backgroundColor: color === "transparent" ? "#f0f0f0" : color,
                                border:
                                  color === "#ffffff" || color === "#f5f5dc" || color === "transparent"
                                    ? "1px solid #c9cccf"
                                    : "1px solid transparent",
                                cursor: "pointer",
                              }}
                            />
                          ))}
                        </div>

                        {/* Search Product Button */}
                        <button
                          style={{
                            width: "100%",
                            padding: "10px 16px",
                            border: "1px solid #c9cccf",
                            backgroundColor: "transparent",
                            color: "#637381",
                            fontSize: "13px",
                            fontWeight: "500",
                            borderRadius: "3px",
                            cursor: "pointer",
                            transition: "all 0.2s ease",
                            textTransform: "uppercase",
                            letterSpacing: "0.5px",
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.backgroundColor = "#000000"
                            e.target.style.color = "#ffffff"
                            e.target.style.borderColor = "#000000"
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.backgroundColor = "transparent"
                            e.target.style.color = "#637381"
                            e.target.style.borderColor = "#c9cccf"
                          }}
                        >
                          SEARCH PRODUCT
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CollectionSlider
