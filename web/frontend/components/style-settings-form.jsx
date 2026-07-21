"use client"

import { FormLayout, TextField, Select, RangeSlider, Stack, Text, Button } from "@shopify/polaris"
import { SLIDER_TYPES } from "../utils/sliderConfig"

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

function ColorField({ label, value, fallback, onChange, disabled }) {
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
          }}
        />
        <div style={{ flex: 1 }}>
          <TextField label={label} labelHidden value={value || fallback} onChange={onChange} disabled={disabled} autoComplete="off" />
        </div>
      </div>
    </div>
  )
}

export default function StyleSettingsForm({
  sliderType,
  settings,
  onTypeChange,
  onSettingsChange,
  disabled = false,
}) {
  const update = (key, value) => {
    onSettingsChange({
      ...settings,
      [key]: value,
    })
  }

  const updateMobile = (key, value) => {
    onSettingsChange({
      ...settings,
      mobile: {
        ...(settings.mobile || {}),
        [key]: value,
      },
    })
  }

  return (
    <FormLayout>
      <Select
        label="Slider preset"
        options={SLIDER_TYPES.map((type) => ({
          label: `${type.group || "Style"} · ${type.label}`,
          value: type.value,
        }))}
        value={sliderType}
        onChange={onTypeChange}
        disabled={disabled}
        helpText={SLIDER_TYPES.find((t) => t.value === sliderType)?.description}
      />

      <RangeSlider
        label={`Height: ${settings.height || 640}px`}
        value={settings.height || 640}
        min={320}
        max={900}
        onChange={(value) => update("height", value)}
        disabled={disabled}
      />

      <RangeSlider
        label={`Corner radius: ${settings.borderRadius ?? 0}px`}
        value={settings.borderRadius ?? 0}
        min={0}
        max={40}
        onChange={(value) => update("borderRadius", value)}
        disabled={disabled}
      />

      <Select
        label="Image fit"
        options={[
          { label: "Cover", value: "cover" },
          { label: "Contain", value: "contain" },
        ]}
        value={settings.objectFit || "cover"}
        onChange={(value) => update("objectFit", value)}
        disabled={disabled}
      />

      <FormLayout.Group>
        <TextField
          label="Slides to show"
          type="number"
          value={String(settings.slidesToShow ?? 1)}
          onChange={(value) => update("slidesToShow", Number(value) || 1)}
          disabled={disabled}
        />
        <TextField
          label="Autoplay speed (ms)"
          type="number"
          value={String(settings.autoplaySpeed ?? 3000)}
          onChange={(value) => update("autoplaySpeed", Number(value) || 3000)}
          disabled={disabled}
        />
      </FormLayout.Group>

      <Stack spacing="tight">
        <Button pressed={Boolean(settings.autoplay)} onClick={() => update("autoplay", !settings.autoplay)} disabled={disabled}>
          Autoplay {settings.autoplay ? "On" : "Off"}
        </Button>
        <Button pressed={settings.arrows !== false} onClick={() => update("arrows", settings.arrows === false)} disabled={disabled}>
          Arrows {settings.arrows === false ? "Off" : "On"}
        </Button>
        <Button pressed={settings.dots !== false} onClick={() => update("dots", settings.dots === false)} disabled={disabled}>
          Dots {settings.dots === false ? "Off" : "On"}
        </Button>
        <Button pressed={settings.infinite !== false} onClick={() => update("infinite", settings.infinite === false)} disabled={disabled}>
          Infinite {settings.infinite === false ? "Off" : "On"}
        </Button>
      </Stack>

      <FormLayout.Group>
        <TextField
          label="Arrow color"
          value={settings.arrowColor || "#ffffff"}
          onChange={(value) => update("arrowColor", value)}
          disabled={disabled}
        />
        <TextField
          label="Dot color"
          value={settings.dotColor || "#2c4a6e"}
          onChange={(value) => update("dotColor", value)}
          disabled={disabled}
        />
      </FormLayout.Group>

      <Text variant="headingSm">CTA button</Text>
      <FormLayout.Group>
        <ColorField
          label="Button background"
          value={settings.ctaBackground || "#1a2f4a"}
          onChange={(value) => update("ctaBackground", value)}
          fallback="#1a2f4a"
          disabled={disabled}
        />
        <ColorField
          label="Text color"
          value={settings.ctaTextColor || "#ffffff"}
          onChange={(value) => update("ctaTextColor", value)}
          fallback="#ffffff"
          disabled={disabled}
        />
      </FormLayout.Group>

      <FormLayout.Group>
        <ColorField
          label="Border color"
          value={settings.ctaBorderColor || "#ffffff"}
          onChange={(value) => update("ctaBorderColor", value)}
          fallback="#ffffff"
          disabled={disabled}
        />
        <ColorField
          label="Icon color"
          value={settings.ctaIconColor || "#ffffff"}
          onChange={(value) => update("ctaIconColor", value)}
          fallback="#ffffff"
          disabled={disabled}
        />
      </FormLayout.Group>

      <Select
        label="Button icon"
        options={[
          { label: "Arrow", value: "arrow" },
          { label: "Chevron", value: "chevron" },
          { label: "No icon", value: "none" },
        ]}
        value={settings.ctaIcon || "arrow"}
        onChange={(value) => update("ctaIcon", value)}
        disabled={disabled}
      />

      <RangeSlider
        label={`Button border: ${settings.ctaBorderWidth ?? 1}px`}
        value={settings.ctaBorderWidth ?? 1}
        min={0}
        max={6}
        onChange={(value) => update("ctaBorderWidth", value)}
        disabled={disabled}
      />

      <RangeSlider
        label={`Button corners: ${settings.ctaBorderRadius ?? 50}px`}
        value={settings.ctaBorderRadius ?? 50}
        min={0}
        max={50}
        onChange={(value) => update("ctaBorderRadius", value)}
        disabled={disabled}
      />

      <RangeSlider
        label={`Button font size: ${settings.ctaFontSize ?? 16}px`}
        value={settings.ctaFontSize ?? 16}
        min={12}
        max={24}
        onChange={(value) => update("ctaFontSize", value)}
        disabled={disabled}
      />

      <Text variant="headingSm">Mobile overrides</Text>
      <FormLayout.Group>
        <TextField
          label="Mobile slides to show"
          type="number"
          value={String(settings.mobile?.slidesToShow ?? 1)}
          onChange={(value) => updateMobile("slidesToShow", Number(value) || 1)}
          disabled={disabled}
        />
        <TextField
          label="Mobile slides to scroll"
          type="number"
          value={String(settings.mobile?.slidesToScroll ?? 1)}
          onChange={(value) => updateMobile("slidesToScroll", Number(value) || 1)}
          disabled={disabled}
        />
      </FormLayout.Group>
    </FormLayout>
  )
}
