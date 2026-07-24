"use client"

import { useEffect, useState } from "react"
import {
  FormLayout,
  TextField,
  RangeSlider,
  Text,
  Button,
  Banner,
  Checkbox,
  ButtonGroup,
} from "@shopify/polaris"
import MediaPickerInline from "./media-picker-inline"
import ColorField from "./color-field"
import SeSelect from "./se-select"
import { HERO_SLIDER_TYPES, HERO_CONTENT_POSITION_OPTIONS, resolveContentPlacement } from "../utils/sliderConfig"
import { canShow } from "../utils/settingsVisibility"

const EMPTY_SLIDE = {
  imageUrl: "",
  title: "",
  description: "",
  heading: "",
  subheading: "",
  ctaText: "",
  ctaUrl: "",
  ctaStyle: "primary",
  ctaResourceType: null,
  ctaResourceId: null,
  ctaOpenInNewTab: false,
  cta2Text: "",
  cta2Url: "",
  cta2OpenInNewTab: false,
  textAlign: "center",
  contentPosition: null,
  overlayColor: "#000000",
  overlayOpacity: 0.35,
  textColor: "#ffffff",
  buttonBg: "#1a2f4a",
  buttonTextColor: "#ffffff",
  imageAlt: "",
  shopifyFileId: null,
  mediaType: "image",
  videoUrl: "",
  videoProvider: null,
  isVisible: true,
}

function detectVideoProvider(url) {
  if (!url) return null
  if (/youtube\.com|youtu\.be/i.test(url)) return "youtube"
  if (/vimeo\.com/i.test(url)) return "vimeo"
  return "shopify"
}

export default function SlideEditorPanel({
  initialSlide = null,
  onSave,
  onCancel,
  title = "Edit slide",
  brandKit = null,
  sliderType = "fade",
  settings = {},
}) {
  const [form, setForm] = useState(EMPTY_SLIDE)
  const [saving, setSaving] = useState(false)
  const [showPicker, setShowPicker] = useState(false)
  const [error, setError] = useState("")
  const [showSecondButton, setShowSecondButton] = useState(false)

  const showSlideCta = canShow(sliderType, "slideCtaFields")

  const fieldLabels = {
    testimonials: { heading: "Quote", subheading: "Author", description: "Role / detail", image: "Avatar image URL" },
    "logo-grid": { heading: "Brand name", subheading: "Subheading", description: "Description", image: "Logo image URL" },
    stories: { heading: "Story label", subheading: "Subheading", description: "Description", image: "Story media URL" },
    announcement: { heading: "Announcement message", subheading: "Subheading", description: "Description", image: "Image URL" },
    "product-carousel": { heading: "Product title", subheading: "Subheading", description: "Price", image: "Product image URL" },
    "product-showcase": { heading: "Product title", subheading: "Subheading", description: "Price", image: "Product image URL" },
    "collection-rail": { heading: "Product title", subheading: "Subheading", description: "Price", image: "Product image URL" },
  }[sliderType] || {
    heading: "Heading",
    subheading: "Subheading",
    description: "Description",
    image: form.mediaType === "video" ? "Poster / fallback image URL" : "Image URL",
  }

  useEffect(() => {
    const defaults = brandKit
      ? {
          textColor: brandKit.textColor,
          buttonBg: brandKit.buttonBg,
          buttonTextColor: brandKit.buttonTextColor,
          overlayColor: brandKit.overlayColor,
          overlayOpacity: brandKit.overlayOpacity,
        }
      : {}
    setForm({ ...EMPTY_SLIDE, ...defaults, ...(initialSlide || {}) })
    setShowSecondButton(Boolean(initialSlide?.cta2Text?.trim()))
    setError("")
    setShowPicker(false)
  }, [initialSlide, brandKit])

  const update = (key, value) => setForm((prev) => ({ ...prev, [key]: value }))

  const handleSave = async () => {
    if (form.mediaType === "video") {
      if (!form.videoUrl?.trim() && !form.imageUrl?.trim()) {
        setError("Add a video URL (YouTube/Vimeo/Shopify) or upload a video")
        return
      }
    } else if (!form.imageUrl?.trim()) {
      setError("Choose an image from Shopify Files or paste an image URL")
      return
    }
    if (!form.title?.trim()) {
      setError("Title is required")
      return
    }

    setSaving(true)
    setError("")
    try {
      await onSave({
        ...form,
        imageUrl: form.imageUrl?.trim() || form.videoUrl?.trim() || "",
        videoUrl: form.videoUrl?.trim() || "",
        videoProvider: detectVideoProvider(form.videoUrl),
        title: form.title.trim(),
        description: form.description?.trim() || "",
        heading: form.heading?.trim() || form.title.trim(),
        imageAlt: form.imageAlt?.trim() || form.title.trim(),
      })
    } catch (err) {
      setError(err.message || "Failed to save slide")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div
      id="slideease-slide-editor"
      style={{
        border: "1px solid #e2e5e9",
        borderRadius: 14,
        background: "#ffffff",
        padding: 16,
        marginTop: 12,
      }}
    >
      <Text variant="headingSm" as="h3">
        {title}
      </Text>
      <div style={{ margin: "4px 0 14px" }}>
        <Text variant="bodySm" color="subdued">
          Fill this form on the page — no popup. Preview at the bottom updates after you save.
        </Text>
      </div>

      {error && (
        <div style={{ marginBottom: 12 }}>
          <Banner status="critical">{error}</Banner>
        </div>
      )}

      <div style={{ marginBottom: 12 }}>
        <ButtonGroup segmented>
          <Button pressed={form.mediaType === "image"} onClick={() => update("mediaType", "image")}>
            Image
          </Button>
          <Button pressed={form.mediaType === "video"} onClick={() => update("mediaType", "video")}>
            Video
          </Button>
        </ButtonGroup>
      </div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
        <Button onClick={() => setShowPicker((v) => !v)}>
          {showPicker ? "Hide Shopify Files" : "Choose from Shopify Files"}
        </Button>
        {form.imageUrl && (
          <Button
            onClick={() =>
              setForm((prev) => ({ ...prev, imageUrl: "", shopifyFileId: null, videoUrl: prev.mediaType === "video" ? prev.videoUrl : "" }))
            }
          >
            Clear media
          </Button>
        )}
      </div>

      {showPicker && (
        <div style={{ marginBottom: 14 }}>
          <MediaPickerInline
            mediaType={form.mediaType}
            onClose={() => setShowPicker(false)}
            onSelect={(file) => {
              if (file.mediaType === "video" || form.mediaType === "video") {
                setForm((prev) => ({
                  ...prev,
                  mediaType: "video",
                  videoUrl: file.url || prev.videoUrl,
                  imageUrl: file.previewUrl || file.url || prev.imageUrl,
                  shopifyFileId: file.id,
                  videoProvider: "shopify",
                  imageAlt: prev.imageAlt || file.alt || "",
                  title: prev.title || file.alt || prev.title,
                }))
              } else {
                setForm((prev) => ({
                  ...prev,
                  imageUrl: file.url,
                  shopifyFileId: file.id,
                  imageAlt: prev.imageAlt || file.alt || "",
                  title: prev.title || file.alt || prev.title,
                }))
              }
              setShowPicker(false)
            }}
          />
        </div>
      )}

      {form.imageUrl && (
        <div
          style={{
            width: "100%",
            maxWidth: 280,
            height: 140,
            borderRadius: 10,
            overflow: "hidden",
            marginBottom: 14,
            border: "1px solid #e1e3e5",
          }}
        >
          <img
            src={form.imageUrl}
            alt={form.title || "Selected"}
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          />
        </div>
      )}

      <FormLayout>
        {form.mediaType === "video" && (
          <TextField
            label="Video URL"
            value={form.videoUrl}
            onChange={(value) => update("videoUrl", value)}
            placeholder="YouTube, Vimeo, or Shopify video URL"
            helpText="Paste a YouTube/Vimeo link or upload a Shopify video above."
          />
        )}

        <TextField
          label={fieldLabels.image}
          value={form.imageUrl}
          onChange={(value) => update("imageUrl", value)}
          placeholder="https://cdn.shopify.com/..."
          helpText="Prefer Shopify Files above. URL is an optional fallback."
        />

        <FormLayout.Group>
          <TextField label="Title" value={form.title} onChange={(value) => update("title", value)} requiredIndicator />
          <TextField label="Alt text" value={form.imageAlt} onChange={(value) => update("imageAlt", value)} />
        </FormLayout.Group>

        <FormLayout.Group>
          <TextField label={fieldLabels.heading} value={form.heading} onChange={(value) => update("heading", value)} />
          <TextField label={fieldLabels.subheading} value={form.subheading} onChange={(value) => update("subheading", value)} />
        </FormLayout.Group>

        <TextField
          label={fieldLabels.description}
          value={form.description}
          onChange={(value) => update("description", value)}
          multiline={3}
        />

        {showSlideCta ? (
          <FormLayout.Group>
            <TextField label="Button text" value={form.ctaText} onChange={(value) => update("ctaText", value)} placeholder="Shop now" />
            <TextField
              label="Button URL"
              value={form.ctaUrl}
              onChange={(value) =>
                setForm((prev) => ({
                  ...prev,
                  ctaUrl: value,
                  ctaResourceType: null,
                  ctaResourceId: null,
                }))
              }
              placeholder="/collections/all"
              helpText=""
            />
          </FormLayout.Group>
        ) : null}

        {showSlideCta ? (
          <Checkbox
            label="Open button in new tab"
            checked={Boolean(form.ctaOpenInNewTab)}
            onChange={(value) => update("ctaOpenInNewTab", value)}
          />
        ) : null}

        {showSlideCta && !showSecondButton ? (
          <Button
            onClick={() => {
              setShowSecondButton(true)
              if (!form.cta2Text) update("cta2Text", "Learn more")
            }}
          >
            Add second button
          </Button>
        ) : null}

        {showSlideCta && showSecondButton ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 12, width: "100%" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <TextField
                label="Second button text"
                value={form.cta2Text}
                onChange={(value) => update("cta2Text", value)}
                placeholder="Learn more"
                autoComplete="off"
              />
              <TextField
                label="Second button URL"
                value={form.cta2Url}
                onChange={(value) => update("cta2Url", value)}
                placeholder="/pages/about"
                autoComplete="off"
              />
            </div>
            <Checkbox
              label="Open second button in new tab"
              checked={Boolean(form.cta2OpenInNewTab)}
              onChange={(value) => update("cta2OpenInNewTab", value)}
            />
            <div>
              <Button
                onClick={() => {
                  setShowSecondButton(false)
                  setForm((prev) => ({
                    ...prev,
                    cta2Text: "",
                    cta2Url: "",
                    cta2OpenInNewTab: false,
                  }))
                }}
              >
                Remove second button
              </Button>
            </div>
          </div>
        ) : null}

        {HERO_SLIDER_TYPES.includes(sliderType) ? (
          <SeSelect
            label="Content placement"
            options={HERO_CONTENT_POSITION_OPTIONS.map((option) => ({
              label: option.label,
              value: option.value,
            }))}
            value={resolveContentPlacement(form, settings)}
            onChange={(value) =>
              setForm((prev) => ({
                ...prev,
                contentPosition: value,
                textAlign: value,
              }))
            }
            helpText="Moves heading, subheading, description, and button together. Leave unset on new slides to follow Style settings."
          />
        ) : (
          <SeSelect
            label="Text alignment"
            options={[
              { label: "Left", value: "left" },
              { label: "Center", value: "center" },
              { label: "Right", value: "right" },
            ]}
            value={form.textAlign}
            onChange={(value) => update("textAlign", value)}
          />
        )}

        <FormLayout.Group condensed>
          <ColorField
            label="Text color"
            value={form.textColor}
            fallback="#ffffff"
            onChange={(value) => update("textColor", value)}
          />
          <ColorField
            label="Overlay color"
            value={form.overlayColor}
            fallback="#000000"
            onChange={(value) => update("overlayColor", value)}
          />
        </FormLayout.Group>

        <RangeSlider
          label={`Overlay opacity: ${Number(form.overlayOpacity || 0).toFixed(2)}`}
          value={Number(form.overlayOpacity || 0)}
          min={0}
          max={1}
          step={0.05}
          onChange={(value) => update("overlayOpacity", value)}
        />
      </FormLayout>

      <div style={{ display: "flex", gap: 8, marginTop: 16, alignItems: "center" }}>
        <Button primary onClick={handleSave} disabled={saving}>
          Save slide
        </Button>
        <Button onClick={onCancel} disabled={saving}>
          Cancel
        </Button>
      </div>
    </div>
  )
}
