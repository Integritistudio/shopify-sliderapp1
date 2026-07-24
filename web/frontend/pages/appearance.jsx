"use client"

import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Page, Text, Banner } from "@shopify/polaris"
import { ToastProvider, useToast } from "../contexts/toast-context"
import { useAppearance } from "../contexts/appearance-context"
import {
  APPEARANCE_DEFAULTS,
  APPEARANCE_FIELDS,
  normalizeAppearance,
  normalizeHex,
} from "../utils/appearance"

function AppColorPicker({ label, help, value, fallback, onChange }) {
  const color = normalizeHex(value, fallback)

  return (
    <div className="se-appearance-field">
      <Text variant="bodyMd" as="p">
        {label}
      </Text>
      {help ? (
        <div style={{ marginTop: 2 }}>
          <Text variant="bodySm" color="subdued" as="p">
            {help}
          </Text>
        </div>
      ) : null}
      <label className="se-appearance-picker">
        <input
          type="color"
          value={color}
          onChange={(event) => onChange(event.target.value)}
          onInput={(event) => onChange(event.target.value)}
          aria-label={`${label} picker`}
        />
        <span>{color.toUpperCase()}</span>
      </label>
    </div>
  )
}

function AppearanceContent() {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const { appearance, persistAppearance, restoreDefaults } = useAppearance()
  // Draft edits stay local until Save — do not push to app chrome / localStorage.
  const [draft, setDraft] = useState(() => normalizeAppearance(appearance))

  useEffect(() => {
    setDraft(normalizeAppearance(appearance))
  }, [appearance])

  const update = (key, value) => {
    setDraft((prev) =>
      normalizeAppearance({
        ...prev,
        [key]: normalizeHex(value, APPEARANCE_DEFAULTS[key]),
      }),
    )
  }

  const save = () => {
    persistAppearance(draft)
    showToast("Appearance saved")
  }

  const reset = () => {
    const defaults = restoreDefaults()
    setDraft(normalizeAppearance(defaults))
    showToast("Restored default SlideEase colors")
  }

  return (
    <Page
      fullWidth
      title="Appearance"
      subtitle="Customize the SlideEase app chrome — buttons, borders, and surfaces"
      backAction={{ content: "Sliders", onAction: () => navigate("/") }}
      primaryAction={{ content: "Save", onAction: save }}
      secondaryActions={[{ content: "Reset to defaults", onAction: reset }]}
    >
      <div className="se-page">
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Banner status="info" title="App look only">
            <p>
              These colors style the SlideEase admin (Create buttons, borders, panels, hero card). They do not change
              your storefront slider colors. Changes apply only after you click Save.
            </p>
          </Banner>

          <div
            className="se-hero"
            style={{
              padding: "1.25rem 1.4rem",
              background: `linear-gradient(135deg, #ffffff 0%, ${draft.heroFill} 58%, ${draft.heroFill} 100%)`,
              borderColor: draft.heroBorder,
            }}
          >
            <h1 className="se-hero__title" style={{ fontSize: "1.45rem", color: draft.ink }}>
              Make it yours
            </h1>
            <p className="se-hero__sub" style={{ color: draft.muted }}>
              Preview colors here — nothing is saved until you click Save appearance.
            </p>
            <div className="se-hero__actions" style={{ marginTop: 14 }}>
              <button
                type="button"
                className="se-btn se-btn--primary"
                style={{
                  background: draft.accent,
                  borderColor: draft.accent,
                  color: "#fff",
                }}
                onClick={save}
              >
                Primary button
              </button>
              <button
                type="button"
                className="se-btn se-btn--secondary"
                style={{
                  color: draft.ink,
                  borderColor: draft.line,
                  background: draft.panel,
                }}
              >
                Secondary
              </button>
              <button type="button" className="se-btn se-btn--ghost" style={{ color: draft.muted }}>
                Ghost
              </button>
            </div>
          </div>

          <div className="se-panel" style={{ background: draft.panel, borderColor: draft.line }}>
            <div className="se-panel__body">
              <Text variant="headingSm" as="h3">
                Colors
              </Text>
              <div className="se-appearance-grid">
                {APPEARANCE_FIELDS.map((field) => (
                  <AppColorPicker
                    key={field.key}
                    label={field.label}
                    help={field.help}
                    value={draft[field.key]}
                    fallback={APPEARANCE_DEFAULTS[field.key]}
                    onChange={(v) => update(field.key, v)}
                  />
                ))}
              </div>
              <div style={{ marginTop: 18, display: "flex", gap: 8, flexWrap: "wrap" }}>
                <button
                  type="button"
                  className="se-btn se-btn--primary"
                  style={{ background: draft.accent, borderColor: draft.accent, color: "#fff" }}
                  onClick={save}
                >
                  Save appearance
                </button>
                <button
                  type="button"
                  className="se-btn se-btn--secondary"
                  style={{ color: draft.ink, borderColor: draft.line }}
                  onClick={reset}
                >
                  Reset to defaults
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </Page>
  )
}

export default function AppearancePage() {
  return (
    <ToastProvider>
      <AppearanceContent />
    </ToastProvider>
  )
}
