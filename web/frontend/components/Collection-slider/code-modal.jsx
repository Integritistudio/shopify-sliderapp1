"use client"

import { useState } from "react"
import { CopyIcon, CheckIcon } from "./icons"

const CodeModal = ({ isOpen, onClose, collection }) => {
  const [copied, setCopied] = useState(false)

  if (!isOpen || !collection) return null

  // Generate the embeddable code for the slider
  const generateSliderCode = (collection) => {
    // Generate a simple slider ID that will be stored in database
    const sliderId = `SLIDER_${collection.id}_${Date.now()}`
    return sliderId
  }

  const sliderCode = generateSliderCode(collection)

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(sliderCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement("textarea")
      textArea.value = sliderCode
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand("copy")
      document.body.removeChild(textArea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: "20px",
      }}
    >
      <div
        style={{
          backgroundColor: "#ffffff",
          borderRadius: "8px",
          padding: "24px",
          maxWidth: "800px",
          width: "100%",
          maxHeight: "90vh",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px",
          }}
        >
          <div>
            <h2
              style={{
                margin: "0 0 4px 0",
                fontSize: "20px",
                fontWeight: "600",
                color: "#202223",
              }}
            >
              Copy Slider Code
            </h2>
            <p
              style={{
                margin: 0,
                color: "#637381",
                fontSize: "14px",
              }}
            >
              {collection.name} - Embed this code on your website
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              fontSize: "24px",
              cursor: "pointer",
              color: "#637381",
            }}
          >
            ×
          </button>
        </div>

        <div
          style={{
            flex: 1,
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "12px",
            }}
          >
            <span
              style={{
                fontSize: "14px",
                fontWeight: "500",
                color: "#637381",
              }}
            >
              Slider Code
            </span>
            <button
              onClick={copyToClipboard}
              style={{
                backgroundColor: copied ? "#10b981" : "#0066cc",
                color: "#ffffff",
                border: "none",
                padding: "8px 16px",
                borderRadius: "6px",
                fontSize: "14px",
                fontWeight: "500",
                cursor: "pointer",
                transition: "background-color 0.2s ease",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              {copied ? <CheckIcon /> : <CopyIcon />}
              {copied ? "Copied!" : "Copy Code"}
            </button>
          </div>

          <div
            style={{
              backgroundColor: "#f8f9fa",
              border: "1px solid #e1e3e5",
              borderRadius: "6px",
              padding: "40px",
              textAlign: "center",
            }}
          >
            <div
              style={{
                fontSize: "24px",
                fontWeight: "600",
                color: "#202223",
                fontFamily: "Monaco, Menlo, 'Ubuntu Mono', monospace",
                backgroundColor: "#ffffff",
                padding: "20px",
                borderRadius: "8px",
                border: "2px solid #0066cc",
                display: "inline-block",
                letterSpacing: "2px",
              }}
            >
              {sliderCode}
            </div>
          </div>
        </div>

        <div
          style={{
            marginTop: "20px",
            padding: "16px",
            backgroundColor: "#f0f9ff",
            borderRadius: "6px",
            border: "1px solid #bae6fd",
          }}
        >
          <h4
            style={{
              margin: "0 0 8px 0",
              fontSize: "14px",
              fontWeight: "600",
              color: "#0369a1",
            }}
          >
            How to use:
          </h4>
          <ul
            style={{
              margin: 0,
              paddingLeft: "20px",
              fontSize: "13px",
              color: "#0369a1",
              lineHeight: "1.5",
            }}
          >
            <li>Copy the slider code above</li>
            <li>Use this code to fetch slider data from your database</li>
            <li>The slider configuration is stored with this unique identifier</li>
            <li>Integrate this code into your website's slider system</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default CodeModal
