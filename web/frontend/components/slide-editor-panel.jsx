"use client"

import { useEffect, useState } from "react"
import {
  FormLayout,
  TextField,
  Select,
  RangeSlider,
  Text,
  Button,
  Banner,
  Checkbox,
  ButtonGroup,
} from "@shopify/polaris"
import { useAppBridge } from "@shopify/app-bridge-react"
import MediaPickerInline from "./media-picker-inline"

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
  textAlign: "center",
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
}) {
  const shopify = useAppBridge()
  const [form, setForm] = useState(EMPTY_SLIDE)
  const [saving, setSaving] = useState(false)
  const [showPicker, setShowPicker] = useState(false)
  const [error, setError] = useState("")

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
    setError("")
    setShowPicker(false)
  }, [initialSlide, brandKit])

  const update = (key, value) => setForm((prev) => ({ ...prev, [key]: value }))

  const pickResource = async (type) => {
    try {
      if (!shopify?.resourcePicker) {
        setError("Resource picker is unavailable in this session. Paste a storefront path instead.")
        return
      }
      const result = await shopify.resourcePicker({
        type,
        multiple: false,
        action: "select",
      })
      const resources = Array.isArray(result) ? result : result?.selection
      if (!resources?.length) return
      const resource = resources[0]
      const handle = resource.handle
      const path =
        type === "product"
          ? `/products/${handle}`
          : type === "collection"
            ? `/collections/${handle}`
            : `/pages/${handle}`
      setForm((prev) => ({
        ...prev,
        ctaUrl: path,
        ctaResourceType: type,
        ctaResourceId: resource.id || null,
        ctaText: prev.ctaText || resource.title || "Shop now",
      }))
    } catch (err) {
      setError(err.message || "Could not open resource picker")
    }
  }

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
          label={form.mediaType === "video" ? "Poster / fallback image URL" : "Image URL"}
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
          <TextField label="Heading" value={form.heading} onChange={(value) => update("heading", value)} />
          <TextField label="Subheading" value={form.subheading} onChange={(value) => update("subheading", value)} />
        </FormLayout.Group>

        <TextField
          label="Description"
          value={form.description}
          onChange={(value) => update("description", value)}
          multiline={3}
        />

        <FormLayout.Group>
          <TextField label="CTA text" value={form.ctaText} onChange={(value) => update("ctaText", value)} placeholder="Shop now" />
          <TextField
            label="CTA URL"
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
            helpText="Storefront path or absolute URL"
          />
        </FormLayout.Group>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <Button size="slim" onClick={() => pickResource("product")}>
            Pick product
          </Button>
          <Button size="slim" onClick={() => pickResource("collection")}>
            Pick collection
          </Button>
          <Button size="slim" onClick={() => pickResource("page")}>
            Pick page
          </Button>
          <Button
            size="slim"
            onClick={() =>
              setForm((prev) => ({
                ...prev,
                ctaUrl: "/pages/",
                ctaResourceType: "page",
                ctaResourceId: null,
              }))
            }
          >
            Page path helper
          </Button>
        </div>

        {form.ctaResourceType && (
          <Text variant="bodySm" color="subdued">
            Linked {form.ctaResourceType}
            {form.ctaResourceId ? ` · ${form.ctaResourceId}` : ""}
          </Text>
        )}

        <Checkbox
          label="Open CTA in new tab"
          checked={Boolean(form.ctaOpenInNewTab)}
          onChange={(value) => update("ctaOpenInNewTab", value)}
        />

        <Select
          label="Text alignment"
          options={[
            { label: "Left", value: "left" },
            { label: "Center", value: "center" },
            { label: "Right", value: "right" },
          ]}
          value={form.textAlign}
          onChange={(value) => update("textAlign", value)}
        />

        <FormLayout.Group condensed>
          <TextField label="Text color" value={form.textColor} onChange={(value) => update("textColor", value)} />
          <TextField label="Button background" value={form.buttonBg} onChange={(value) => update("buttonBg", value)} />
          <TextField label="Button text" value={form.buttonTextColor} onChange={(value) => update("buttonTextColor", value)} />
          <TextField label="Overlay color" value={form.overlayColor} onChange={(value) => update("overlayColor", value)} />
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

      <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
        <Button primary onClick={handleSave} loading={saving}>
          Save slide
        </Button>
        <Button onClick={onCancel} disabled={saving}>
          Cancel
        </Button>
      </div>
    </div>
  )
}
