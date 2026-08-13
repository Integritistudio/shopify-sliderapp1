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
  rating: 5,
  verified: false,
  creatorHandle: "",
  avatarUrl: "",
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
  const [showAvatarPicker, setShowAvatarPicker] = useState(false)
  const [error, setError] = useState("")
  const [showSecondButton, setShowSecondButton] = useState(false)

  const showSlideCta = canShow(sliderType, "slideCtaFields")
  const isAnnouncement = sliderType === "announcement"
  const isTestimonials3d = sliderType === "testimonials-3d"
  const isUgcFeed = sliderType === "ugc-feed"

  const fieldLabels = {
    testimonials: { heading: "Quote", subheading: "Author", description: "Role / detail", image: "Avatar image URL" },
    "testimonials-3d": { heading: "Quote", subheading: "Author", description: "Role / detail", image: "Avatar image URL" },
    "ugc-feed": { heading: "Title", subheading: "Creator name", description: "Caption", image: "Poster / image URL" },
    "logo-3d": { heading: "Brand name", subheading: "Subheading", description: "Subtitle (optional)", image: "Logo image URL" },
    "logo-grid": { heading: "Brand name", subheading: "Subheading", description: "Description", image: "Logo image URL" },
    stories: { heading: "Story label", subheading: "Subheading", description: "Description", image: "Story media URL" },
    announcement: { heading: "Announcement message", subheading: "Subheading", description: "Description", image: "Image URL" },
    "product-carousel": { heading: "Product title", subheading: "Subheading", description: "Price", image: "Product image URL" },
    "product-showcase": { heading: "Product title", subheading: "Subheading", description: "Price", image: "Product image URL" },
    "collection-rail": { heading: "Product title", subheading: "Subheading", description: "Price", image: "Product image URL" },
    "premium-coverflow": { heading: "Product title", subheading: "Handle / detail", description: "Price", image: "Product image URL" },
    "premium-circular": { heading: "Product title", subheading: "Handle / detail", description: "Price", image: "Product image URL" },
    "premium-stacked": { heading: "Product title", subheading: "Handle / detail", description: "Price", image: "Product image URL" },
    "collection-carousel": { heading: "Collection title", subheading: "Item count", description: "Collection description", image: "Collection image URL" },
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
    setShowAvatarPicker(false)
  }, [initialSlide, brandKit])

  const update = (key, value) => setForm((prev) => ({ ...prev, [key]: value }))

  const handleSave = async () => {
    const isCollectionCarousel = sliderType === "collection-carousel"
    const allowEmptyImage = isCollectionCarousel || isTestimonials3d
    if (!isAnnouncement) {
      if (isUgcFeed) {
        if (!form.imageUrl?.trim() && !form.videoUrl?.trim()) {
          setError("Add a poster/image URL or a video URL")
          return
        }
      } else if (form.mediaType === "video") {
        if (!form.videoUrl?.trim() && !form.imageUrl?.trim()) {
          setError("Add a video URL (YouTube/Vimeo/Shopify) or upload a video")
          return
        }
      } else if (!allowEmptyImage && !form.imageUrl?.trim()) {
        setError("Choose an image from Shopify Files or paste an image URL")
        return
      }
    }
    if (!form.title?.trim()) {
      setError("Title is required")
      return
    }
    if (isAnnouncement && !(form.heading?.trim() || form.title?.trim())) {
      setError("Announcement message is required")
      return
    }

    setSaving(true)
    setError("")
    try {
      const videoUrl = isAnnouncement ? "" : form.videoUrl?.trim() || ""
      const mediaType = isAnnouncement
        ? "image"
        : isUgcFeed
          ? videoUrl
            ? "video"
            : "image"
          : form.mediaType
      await onSave({
        ...form,
        imageUrl: isAnnouncement
          ? form.imageUrl?.trim() || ""
          : form.imageUrl?.trim() || videoUrl || "",
        videoUrl,
        videoProvider: isAnnouncement ? null : detectVideoProvider(videoUrl),
        mediaType,
        title: form.title.trim(),
        description: isAnnouncement ? "" : form.description?.trim() || "",
        subheading: isAnnouncement ? "" : form.subheading?.trim() || "",
        heading: form.heading?.trim() || form.title.trim(),
        imageAlt: form.imageAlt?.trim() || form.title.trim(),
        rating: isTestimonials3d
          ? Math.min(5, Math.max(1, Math.round(Number(form.rating) || 5)))
          : form.rating,
        verified: isTestimonials3d ? Boolean(form.verified) : form.verified,
        creatorHandle: isUgcFeed ? form.creatorHandle?.trim() || "" : form.creatorHandle,
        avatarUrl: isUgcFeed ? form.avatarUrl?.trim() || "" : form.avatarUrl,
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

      {!isAnnouncement ? (
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
      ) : null}

      {!isAnnouncement ? (
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
      ) : null}

      {!isAnnouncement && showPicker ? (
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
      ) : null}

      {!isAnnouncement && form.imageUrl ? (
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
      ) : null}

      <FormLayout>
        {!isAnnouncement && (form.mediaType === "video" || isUgcFeed) ? (
          <TextField
            label={isUgcFeed ? "Video URL (optional)" : "Video URL"}
            value={form.videoUrl}
            onChange={(value) => {
              setForm((prev) => ({
                ...prev,
                videoUrl: value,
                mediaType: isUgcFeed ? (value?.trim() ? "video" : "image") : prev.mediaType,
              }))
            }}
            placeholder={isUgcFeed ? "https://…/video.mp4" : "YouTube, Vimeo, or Shopify video URL"}
            helpText={
              isUgcFeed
                ? "Leave empty for an image-only card. Poster/image is still recommended."
                : "Paste a YouTube/Vimeo link or upload a Shopify video above."
            }
          />
        ) : null}

        {!isAnnouncement ? (
          <TextField
            label={fieldLabels.image}
            value={form.imageUrl}
            onChange={(value) => update("imageUrl", value)}
            placeholder="https://cdn.shopify.com/..."
            helpText={
              isTestimonials3d
                ? "Optional — leave empty to show author initials."
                : "Prefer Shopify Files above. URL is an optional fallback."
            }
          />
        ) : null}

        {isAnnouncement ? (
          <FormLayout.Group>
            <TextField label="Title" value={form.title} onChange={(value) => update("title", value)} requiredIndicator />
            <TextField
              label={fieldLabels.heading}
              value={form.heading}
              onChange={(value) => update("heading", value)}
              placeholder="Free shipping on orders over $50"
            />
          </FormLayout.Group>
        ) : (
          <FormLayout.Group>
            <TextField label="Title" value={form.title} onChange={(value) => update("title", value)} requiredIndicator />
            <TextField label="Alt text" value={form.imageAlt} onChange={(value) => update("imageAlt", value)} />
          </FormLayout.Group>
        )}

        {!isAnnouncement ? (
          <FormLayout.Group>
            <TextField label={fieldLabels.heading} value={form.heading} onChange={(value) => update("heading", value)} />
            <TextField label={fieldLabels.subheading} value={form.subheading} onChange={(value) => update("subheading", value)} />
          </FormLayout.Group>
        ) : null}

        {!isAnnouncement ? (
          <TextField
            label={fieldLabels.description}
            value={form.description}
            onChange={(value) => update("description", value)}
            multiline={3}
          />
        ) : null}

        {isTestimonials3d ? (
          <FormLayout.Group>
            <SeSelect
              label="Rating"
              options={[
                { label: "5 stars", value: "5" },
                { label: "4 stars", value: "4" },
                { label: "3 stars", value: "3" },
                { label: "2 stars", value: "2" },
                { label: "1 star", value: "1" },
              ]}
              value={String(Math.min(5, Math.max(1, Math.round(Number(form.rating) || 5))))}
              onChange={(value) => update("rating", Number(value))}
            />
            <div style={{ display: "flex", alignItems: "flex-end", height: "100%", paddingBottom: 4 }}>
              <Checkbox
                label="Verified buyer"
                checked={Boolean(form.verified)}
                onChange={(value) => update("verified", value)}
              />
            </div>
          </FormLayout.Group>
        ) : null}

        {isUgcFeed ? (
          <>
            <TextField
              label="Creator handle"
              value={form.creatorHandle || ""}
              onChange={(value) => update("creatorHandle", value)}
              placeholder="@maya.studio"
              autoComplete="off"
              helpText="Shown next to the profile picture on the card"
            />
            <div
              style={{
                border: "1px solid var(--p-color-border, #e1e3e5)",
                borderRadius: 10,
                padding: 12,
                background: "var(--p-color-bg-surface-secondary, #f6f6f7)",
              }}
            >
              <Text as="h3" variant="headingSm">
                Creator profile picture
              </Text>
              <div style={{ marginTop: 4, marginBottom: 10 }}>
                <Text variant="bodySm" color="subdued">
                  Replaces the initials circle (e.g. R4) on the UGC card.
                </Text>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                {form.avatarUrl?.trim() ? (
                  <img
                    src={form.avatarUrl.trim()}
                    alt=""
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: "50%",
                      objectFit: "cover",
                      border: "2px solid rgba(0,0,0,0.12)",
                      flexShrink: 0,
                      background: "#fff",
                    }}
                  />
                ) : (
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: 48,
                      height: 48,
                      borderRadius: "50%",
                      background: "#5c5f62",
                      color: "#fff",
                      fontSize: 13,
                      fontWeight: 700,
                      flexShrink: 0,
                    }}
                    aria-hidden="true"
                  >
                    {(form.creatorHandle || form.subheading || form.title || "?").replace(/^@/, "").slice(0, 2).toUpperCase()}
                  </span>
                )}
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <Button
                    onClick={() => {
                      setShowPicker(false)
                      setShowAvatarPicker((v) => !v)
                    }}
                  >
                    {showAvatarPicker ? "Hide Files" : "Choose from Shopify Files"}
                  </Button>
                  {form.avatarUrl?.trim() ? (
                    <Button onClick={() => update("avatarUrl", "")}>Clear picture</Button>
                  ) : null}
                </div>
              </div>
              {showAvatarPicker ? (
                <div style={{ marginBottom: 12 }}>
                  <MediaPickerInline
                    mediaType="image"
                    onClose={() => setShowAvatarPicker(false)}
                    onSelect={(file) => {
                      update("avatarUrl", file.url || file.previewUrl || "")
                      setShowAvatarPicker(false)
                    }}
                  />
                </div>
              ) : null}
              <TextField
                label="Or paste profile picture URL"
                value={form.avatarUrl || ""}
                onChange={(value) => update("avatarUrl", value)}
                placeholder="https://cdn.shopify.com/..."
                autoComplete="off"
              />
            </div>
          </>
        ) : null}

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
