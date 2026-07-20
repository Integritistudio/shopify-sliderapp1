"use client"

import { FormLayout, TextField, Select, RangeSlider, Stack, Text, Button } from "@shopify/polaris"
import { SLIDER_TYPES } from "../utils/sliderConfig"

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
        label={`Height: ${settings.height || 420}px`}
        value={settings.height || 420}
        min={240}
        max={720}
        onChange={(value) => update("height", value)}
        disabled={disabled}
      />

      <RangeSlider
        label={`Corner radius: ${settings.borderRadius ?? 12}px`}
        value={settings.borderRadius ?? 12}
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
        value={settings.objectFit || "contain"}
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
