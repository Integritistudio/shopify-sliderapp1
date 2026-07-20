"use client"

import { useEffect, useState } from "react"
import {
  Modal,
  FormLayout,
  TextField,
  Select,
  RangeSlider,
  Stack,
  Text,
  Button,
  Thumbnail,
} from "@shopify/polaris"
import MediaPickerModal from "./media-picker-modal"

const EMPTY_SLIDE = {
  imageUrl: "",
  title: "",
  description: "",
  heading: "",
  subheading: "",
  ctaText: "",
  ctaUrl: "",
  ctaStyle: "primary",
  textAlign: "center",
  overlayColor: "#000000",
  overlayOpacity: 0.3,
  textColor: "#ffffff",
  buttonBg: "#008060",
  buttonTextColor: "#ffffff",
  imageAlt: "",
  shopifyFileId: null,
  isVisible: true,
}

export default function SlideEditorModal({
  open,
  onClose,
  onSave,
  initialSlide = null,
  title = "Edit slide",
}) {
  const [form, setForm] = useState(EMPTY_SLIDE)
  const [saving, setSaving] = useState(false)
  const [pickerOpen, setPickerOpen] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (open) {
      setForm({ ...EMPTY_SLIDE, ...(initialSlide || {}) })
      setError("")
    }
  }, [open, initialSlide])

  const update = (key, value) => setForm((prev) => ({ ...prev, [key]: value }))

  const handleSave = async () => {
    if (!form.imageUrl?.trim()) {
      setError("Please select or enter an image")
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
        imageUrl: form.imageUrl.trim(),
        title: form.title.trim(),
        description: form.description?.trim() || "",
        heading: form.heading?.trim() || form.title.trim(),
        imageAlt: form.imageAlt?.trim() || form.title.trim(),
      })
      onClose()
    } catch (err) {
      setError(err.message || "Failed to save slide")
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <Modal
        open={open}
        onClose={onClose}
        title={title}
        large
        primaryAction={{
          content: saving ? "Saving..." : "Save slide",
          onAction: handleSave,
          loading: saving,
        }}
        secondaryActions={[{ content: "Cancel", onAction: onClose }]}
      >
        <Modal.Section>
          <FormLayout>
            {error && (
              <Text color="critical">{error}</Text>
            )}

            <Stack alignment="center" distribution="equalSpacing">
              <Stack alignment="center" spacing="tight">
                {form.imageUrl ? (
                  <Thumbnail source={form.imageUrl} alt={form.title || "Slide"} size="large" />
                ) : (
                  <div
                    style={{
                      width: 60,
                      height: 60,
                      background: "#f6f6f7",
                      borderRadius: 8,
                      border: "1px dashed #c9cccf",
                    }}
                  />
                )}
                <Text variant="bodyMd">{form.imageUrl ? "Image selected" : "No image selected"}</Text>
              </Stack>
              <Button onClick={() => setPickerOpen(true)}>Choose from Shopify Files</Button>
            </Stack>

            <TextField
              label="Image URL (optional fallback)"
              value={form.imageUrl}
              onChange={(value) => update("imageUrl", value)}
              placeholder="https://..."
              helpText="Pick from Shopify Files above, or paste a public image URL"
            />

            <FormLayout.Group>
              <TextField label="Title" value={form.title} onChange={(value) => update("title", value)} requiredIndicator />
              <TextField label="Image alt text" value={form.imageAlt} onChange={(value) => update("imageAlt", value)} />
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
              <TextField label="CTA URL" value={form.ctaUrl} onChange={(value) => update("ctaUrl", value)} placeholder="https:// or /collections/all" />
            </FormLayout.Group>

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

            <FormLayout.Group>
              <TextField label="Text color" value={form.textColor} onChange={(value) => update("textColor", value)} />
              <TextField label="Button background" value={form.buttonBg} onChange={(value) => update("buttonBg", value)} />
              <TextField label="Button text color" value={form.buttonTextColor} onChange={(value) => update("buttonTextColor", value)} />
            </FormLayout.Group>

            <FormLayout.Group>
              <TextField label="Overlay color" value={form.overlayColor} onChange={(value) => update("overlayColor", value)} />
              <RangeSlider
                label={`Overlay opacity: ${Number(form.overlayOpacity || 0).toFixed(2)}`}
                value={Number(form.overlayOpacity || 0)}
                min={0}
                max={1}
                step={0.05}
                onChange={(value) => update("overlayOpacity", value)}
              />
            </FormLayout.Group>
          </FormLayout>
        </Modal.Section>
      </Modal>

      <MediaPickerModal
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={(file) => {
          setForm((prev) => ({
            ...prev,
            imageUrl: file.url,
            shopifyFileId: file.id,
            imageAlt: prev.imageAlt || file.alt || "",
            title: prev.title || file.alt || prev.title,
          }))
        }}
      />
    </>
  )
}
