"use client"

import { TextField, Text } from "@shopify/polaris"

function pickerValue(value, fallback) {
  const color = String(value || "").trim()
  if (/^#[0-9a-f]{6}$/i.test(color)) return color
  if (/^#[0-9a-f]{3}$/i.test(color)) {
    return `#${color
      .slice(1)
      .split("")
      .map((part) => part + part)
      .join("")}`
  }
  return fallback
}

export default function ColorField({ label, value, fallback = "#000000", onChange, disabled }) {
  return (
    <div>
      <Text variant="bodyMd" as="p">
        {label}
      </Text>
      <div style={{ display: "flex", alignItems: "center", gap: "0.65rem", marginTop: "0.35rem" }}>
        <input
          type="color"
          value={pickerValue(value, fallback)}
          onChange={(event) => onChange(event.target.value)}
          disabled={disabled}
          aria-label={`${label} picker`}
          style={{
            width: 44,
            height: 36,
            padding: 3,
            border: "1px solid #c9cccf",
            borderRadius: 8,
            background: "#ffffff",
            cursor: disabled ? "not-allowed" : "pointer",
            flexShrink: 0,
          }}
        />
        <div style={{ flex: 1, minWidth: 0 }}>
          <TextField
            label={label}
            labelHidden
            value={value || fallback}
            onChange={onChange}
            disabled={disabled}
            autoComplete="off"
          />
        </div>
      </div>
    </div>
  )
}
