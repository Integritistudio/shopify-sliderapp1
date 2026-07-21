"use client"

import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  Page,
  FormLayout,
  TextField,
  RangeSlider,
  Button,
  Stack,
  Text,
  Spinner,
} from "@shopify/polaris"
import { ToastProvider, useToast } from "../contexts/toast-context"

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

function BrandColorPicker({ label, value, fallback, onChange }) {
  const color = pickerValue(value, fallback)

  return (
    <div>
      <Text variant="bodyMd" as="p">
        {label}
      </Text>
      <label
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginTop: 6,
          padding: "6px 10px 6px 6px",
          border: "1px solid #aeb4bc",
          borderRadius: 8,
          background: "#fff",
          cursor: "pointer",
        }}
      >
        <input
          type="color"
          value={color}
          onChange={(event) => onChange(event.target.value)}
          aria-label={`${label} picker`}
          style={{
            width: 44,
            height: 34,
            padding: 2,
            border: 0,
            borderRadius: 6,
            background: "transparent",
            cursor: "pointer",
          }}
        />
        <span style={{ color: "#4a5568", fontFamily: "monospace", fontSize: 14 }}>
          {color.toUpperCase()}
        </span>
      </label>
    </div>
  )
}

function BrandKitContent() {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [form, setForm] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    ;(async () => {
      try {
        const response = await fetch("/api/brand-kit")
        if (!response.ok) throw new Error("Failed to load brand kit")
        setForm(await response.json())
      } catch (err) {
        showToast(err.message, { error: true })
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  const update = (key, value) => setForm((prev) => ({ ...prev, [key]: value }))

  const save = async () => {
    setSaving(true)
    try {
      const response = await fetch("/api/brand-kit", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      if (!response.ok) throw new Error("Failed to save brand kit")
      setForm(await response.json())
      showToast("Brand kit saved — new slides inherit these defaults")
    } catch (err) {
      showToast(err.message, { error: true })
    } finally {
      setSaving(false)
    }
  }

  if (loading || !form) {
    return (
      <Page fullWidth title="Brand kit" backAction={{ content: "Sliders", onAction: () => navigate("/") }}>
        <div style={{ textAlign: "center", padding: "3rem" }}>
          <Spinner size="large" />
        </div>
      </Page>
    )
  }

  return (
    <Page
      fullWidth
      title="Brand kit"
      subtitle="Default colors for new slides"
      backAction={{ content: "Sliders", onAction: () => navigate("/") }}
      primaryAction={{ content: "Save", onAction: save, loading: saving }}
    >
      <div className="se-page">
      <Stack vertical>
        <div className="se-hero" style={{ padding: "1.25rem 1.4rem" }}>
          <h1 className="se-hero__title" style={{ fontSize: "1.45rem" }}>
            Your default look
          </h1>
          <p className="se-hero__sub">
            Set colors once — new slides inherit them automatically.
          </p>
        </div>
        <div className="se-panel">
          <div className="se-panel__body">
          <FormLayout>
            <FormLayout.Group>
              <BrandColorPicker
                label="Text color"
                value={form.textColor}
                fallback="#ffffff"
                onChange={(v) => update("textColor", v)}
              />
              <BrandColorPicker
                label="Button background"
                value={form.buttonBg}
                fallback="#1a2f4a"
                onChange={(v) => update("buttonBg", v)}
              />
              <BrandColorPicker
                label="Button text"
                value={form.buttonTextColor}
                fallback="#ffffff"
                onChange={(v) => update("buttonTextColor", v)}
              />
              <BrandColorPicker
                label="Overlay color"
                value={form.overlayColor}
                fallback="#000000"
                onChange={(v) => update("overlayColor", v)}
              />
            </FormLayout.Group>
            <RangeSlider
              label={`Overlay opacity: ${Number(form.overlayOpacity || 0).toFixed(2)}`}
              value={Number(form.overlayOpacity || 0)}
              min={0}
              max={1}
              step={0.05}
              onChange={(v) => update("overlayOpacity", v)}
            />
            <TextField
              label="Default border radius"
              type="number"
              value={String(form.borderRadius ?? 12)}
              onChange={(v) => update("borderRadius", Number(v) || 0)}
              autoComplete="off"
            />
            <TextField
              label="Font note"
              value={form.fontNote || ""}
              onChange={(v) => update("fontNote", v)}
              helpText="Reminder for your theme font (not applied automatically)."
              autoComplete="off"
            />
          </FormLayout>
          <div style={{ marginTop: 16 }}>
            <Button primary onClick={save} loading={saving}>
              Save brand kit
            </Button>
          </div>
          </div>
        </div>
        <div className="se-panel">
          <div className="se-panel__body">
          <Text variant="headingSm" as="h3">
            Preview swatch
          </Text>
          <div
            style={{
              marginTop: 12,
              height: 140,
              borderRadius: form.borderRadius || 12,
              background: `linear-gradient(135deg, ${form.overlayColor}, #0f172a)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: form.textColor,
              boxShadow: "0 12px 28px rgba(15,23,42,0.18)",
            }}
          >
            <span
              style={{
                background: form.buttonBg,
                color: form.buttonTextColor,
                padding: "10px 16px",
                borderRadius: 8,
                fontWeight: 600,
              }}
            >
              Shop now
            </span>
          </div>
          </div>
        </div>
      </Stack>
      </div>
    </Page>
  )
}

export default function BrandKitPage() {
  return (
    <ToastProvider>
      <BrandKitContent />
    </ToastProvider>
  )
}
