"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { useNavigate, useParams } from "react-router-dom"
import {
  Page,
  Stack,
  Text,
  Button,
  Badge,
  Spinner,
  TextField,
  Tabs,
  Banner,
} from "@shopify/polaris"
import { ToastProvider, useToast } from "../../contexts/toast-context"
import SliderPreview from "../../components/slider-preview"
import StyleSettingsForm from "../../components/style-settings-form"
import SlideEditorPanel from "../../components/slide-editor-panel"
import SeSelect from "../../components/se-select"
import { getSliderTypeInfo, mergeSliderSettings, PRODUCT_SLIDER_TYPES } from "../../utils/sliderConfig"
import { scrollPreviewIntoView } from "../../utils/scrollPreview"
import { SLIDE_HARD_LIMIT, SLIDE_SOFT_LIMIT } from "../../utils/limits"

function SliderEditorContent() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { showToast } = useToast()
  const editorAnchorRef = useRef(null)
  const previewRef = useRef(null)
  const dragIdRef = useRef(null)
  const liveOrderRef = useRef(null)
  const floatStyleRef = useRef(null)
  const cardRefs = useRef({})
  const slidesRef = useRef([])
  const reorderSlidesRef = useRef(null)

  const [slider, setSlider] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [selectedTab, setSelectedTab] = useState(0)
  const [name, setName] = useState("")
  const [sliderType, setSliderType] = useState("center")
  const [settings, setSettings] = useState({})
  const [status, setStatus] = useState("published")
  const [panelMode, setPanelMode] = useState(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState(null)
  const [copied, setCopied] = useState(false)
  const [brandKit, setBrandKit] = useState(null)
  const [metrics, setMetrics] = useState(null)
  const [draggingId, setDraggingId] = useState(null)
  const [liveOrder, setLiveOrder] = useState(null)
  const [floatStyle, setFloatStyle] = useState(null)

  const openAddSlide = () => {
    const count = slider?.slides?.length || 0
    if (count >= SLIDE_HARD_LIMIT) {
      showToast(`Maximum of ${SLIDE_HARD_LIMIT} slides reached`, { error: true })
      return
    }
    setSelectedTab(0)
    setConfirmDeleteId(null)
    setPanelMode("create")
    setTimeout(() => {
      editorAnchorRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
    }, 50)
  }

  const fetchSlider = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch(`/api/sliders/${id}`)
      if (!response.ok) throw new Error("Slider not found")
      const data = await response.json()
      setSlider(data)
      setName(data.name)
      setSliderType(data.sliderType || "center")
      setSettings(mergeSliderSettings(data.sliderType, data.settings || {}))
      setStatus(data.status || "published")
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [id])

  const fetchBrandKit = useCallback(async () => {
    try {
      const response = await fetch("/api/brand-kit")
      if (response.ok) setBrandKit(await response.json())
    } catch {
      // optional
    }
  }, [])

  const fetchMetrics = useCallback(async () => {
    try {
      const response = await fetch(`/api/sliders/${id}/metrics`)
      if (response.ok) setMetrics(await response.json())
    } catch {
      // optional
    }
  }, [id])

  useEffect(() => {
    fetchSlider()
    fetchBrandKit()
    fetchMetrics()
  }, [fetchSlider, fetchBrandKit, fetchMetrics])

  const slides = useMemo(
    () => [...(slider?.slides || [])].sort((a, b) => (a.position ?? 0) - (b.position ?? 0)),
    [slider],
  )

  const displaySlides = useMemo(() => {
    if (!liveOrder) return slides
    const byId = new Map(slides.map((slide) => [slide.id, slide]))
    return liveOrder.map((slideId) => byId.get(slideId)).filter(Boolean)
  }, [slides, liveOrder])

  const draggingSlide = useMemo(
    () => (draggingId ? slides.find((slide) => slide.id === draggingId) : null),
    [draggingId, slides],
  )

  useEffect(() => {
    slidesRef.current = slides
  }, [slides])

  const editingSlide = useMemo(() => {
    if (panelMode === "create" || !panelMode) return null
    return slides.find((slide) => String(slide.id) === String(panelMode)) || null
  }, [panelMode, slides])

  const typeInfo = getSliderTypeInfo(sliderType)
  const softLimitHit = slides.length >= SLIDE_SOFT_LIMIT
  const hardLimitHit = slides.length >= SLIDE_HARD_LIMIT
  const isProductSlider = PRODUCT_SLIDER_TYPES.includes(sliderType)

  const saveSliderMeta = async (overrides = {}) => {
    setSaving(true)
    try {
      const payload = {
        name: overrides.name ?? name,
        sliderType: overrides.sliderType ?? sliderType,
        settings: overrides.settings ?? settings,
        status: overrides.status ?? status,
      }
      const response = await fetch(`/api/sliders/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data.error || "Failed to save slider")
      }
      const updated = await response.json()
      setSlider((prev) => ({ ...prev, ...updated, slides: prev?.slides || [] }))
      showToast("Slider Settings Saved")
    } catch (err) {
      showToast(err.message, { error: true })
    } finally {
      setSaving(false)
    }
  }

  const persistSettings = async () => {
    await saveSliderMeta({ settings, sliderType, name, status })
  }

  const saveSlide = async (slideData) => {
    const isEdit = Boolean(editingSlide?.id)
    if (!isEdit && slides.length >= SLIDE_HARD_LIMIT) {
      throw new Error(`Maximum of ${SLIDE_HARD_LIMIT} slides reached`)
    }
    const url = isEdit ? `/api/sliders/${id}/slides/${editingSlide.id}` : `/api/sliders/${id}/slides`
    const response = await fetch(url, {
      method: isEdit ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(slideData),
    })
    if (!response.ok) {
      const data = await response.json().catch(() => ({}))
      throw new Error(data.error || "Failed to save slide")
    }
    const saved = await response.json()
    if (saved.warning) showToast(saved.warning)
    setSlider((prev) => {
      const existing = prev.slides || []
      const slidesNext = isEdit
        ? existing.map((slide) => (slide.id === saved.id ? saved : slide))
        : [...existing, saved]
      return { ...prev, slides: slidesNext }
    })
    setPanelMode(null)
    showToast(isEdit ? "Slide updated" : "Slide added")
  }

  const removeSlide = async (slideId) => {
    try {
      const response = await fetch(`/api/sliders/${id}/slides/${slideId}`, { method: "DELETE" })
      if (!response.ok) throw new Error("Failed to delete slide")
      setSlider((prev) => ({
        ...prev,
        slides: (prev.slides || []).filter((slide) => slide.id !== slideId),
      }))
      if (String(panelMode) === String(slideId)) setPanelMode(null)
      setConfirmDeleteId(null)
      showToast("Slide deleted")
    } catch (err) {
      showToast(err.message, { error: true })
    }
  }

  const duplicateSlide = async (slide) => {
    if (!slide) return
    if (slides.length >= SLIDE_HARD_LIMIT) {
      showToast(`Maximum of ${SLIDE_HARD_LIMIT} slides reached`, { error: true })
      return
    }
    try {
      setSaving(true)
      const titleBase = slide.title || slide.heading || "Slide"
      const headingBase = slide.heading || slide.title || "Slide"
      const payload = {
        imageUrl: slide.imageUrl || "",
        title: `${titleBase} (copy)`.slice(0, 200),
        description: slide.description || "",
        heading: `${headingBase} (copy)`.slice(0, 200),
        subheading: slide.subheading || "",
        ctaText: slide.ctaText || "",
        ctaUrl: slide.ctaUrl || "",
        ctaStyle: slide.ctaStyle || "primary",
        ctaResourceType: slide.ctaResourceType || null,
        ctaResourceId: slide.ctaResourceId || null,
        ctaOpenInNewTab: Boolean(slide.ctaOpenInNewTab),
        cta2Text: slide.cta2Text || "",
        cta2Url: slide.cta2Url || "",
        cta2OpenInNewTab: Boolean(slide.cta2OpenInNewTab),
        textAlign: slide.textAlign || "center",
        contentPosition: slide.contentPosition || null,
        overlayColor: slide.overlayColor || "#000000",
        overlayOpacity: slide.overlayOpacity ?? 0.3,
        textColor: slide.textColor || "#ffffff",
        buttonBg: slide.buttonBg || "#1a2f4a",
        buttonTextColor: slide.buttonTextColor || "#ffffff",
        imageAlt: slide.imageAlt || "",
        shopifyFileId: slide.shopifyFileId || null,
        variantId: slide.variantId || null,
        availableForSale: slide.availableForSale !== false,
        mediaType: slide.mediaType === "video" ? "video" : "image",
        videoUrl: slide.videoUrl || "",
        videoProvider: slide.videoProvider || null,
        isVisible: slide.isVisible !== false,
      }
      const response = await fetch(`/api/sliders/${id}/slides`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data.error || "Failed to duplicate slide")
      }
      const saved = await response.json()
      if (saved.warning) showToast(saved.warning)
      setSlider((prev) => ({
        ...prev,
        slides: [...(prev.slides || []), saved],
      }))
      setPanelMode(null)
      setConfirmDeleteId(null)
      showToast("Slide duplicated")
    } catch (err) {
      showToast(err.message, { error: true })
    } finally {
      setSaving(false)
    }
  }

  const reorderSlides = async (orderedIds) => {
    const response = await fetch(`/api/sliders/${id}/slides/reorder`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderedIds }),
    })
    if (!response.ok) {
      showToast("Failed to reorder slides", { error: true })
      return
    }
    const updated = await response.json()
    setSlider((prev) => ({ ...prev, slides: updated }))
  }

  useEffect(() => {
    reorderSlidesRef.current = reorderSlides
  })

  const clearDragState = () => {
    dragIdRef.current = null
    liveOrderRef.current = null
    floatStyleRef.current = null
    setDraggingId(null)
    setLiveOrder(null)
    setFloatStyle(null)
  }

  const findReorderTarget = (clientY, order, activeId) => {
    const others = order.filter((slideId) => slideId !== activeId)
    let targetIndex = others.length
    for (let i = 0; i < others.length; i++) {
      const el = cardRefs.current[others[i]]
      if (!el) continue
      const rect = el.getBoundingClientRect()
      if (clientY < rect.top + rect.height / 2) {
        targetIndex = i
        break
      }
    }
    const next = [...others]
    next.splice(targetIndex, 0, activeId)
    return next
  }

  const onSlidePointerMove = useCallback((e) => {
    const activeId = dragIdRef.current
    const style = floatStyleRef.current
    if (!activeId || !style) return

    const nextFloat = {
      ...style,
      left: e.clientX - style.offsetX,
      top: e.clientY - style.offsetY,
    }
    floatStyleRef.current = nextFloat
    setFloatStyle(nextFloat)

    const order = liveOrderRef.current
    if (!order?.length) return
    const next = findReorderTarget(e.clientY, order, activeId)
    if (next.every((slideId, index) => slideId === order[index])) return
    liveOrderRef.current = next
    setLiveOrder(next)
  }, [])

  const onSlidePointerUp = useCallback(async () => {
    window.removeEventListener("pointermove", onSlidePointerMove)
    window.removeEventListener("pointerup", onSlidePointerUp)
    window.removeEventListener("pointercancel", onSlidePointerUp)
    document.body.style.userSelect = ""
    document.body.style.cursor = ""

    const next = liveOrderRef.current
    const previous = slidesRef.current.map((slide) => slide.id)
    clearDragState()

    if (!next?.length) return
    if (next.every((slideId, index) => slideId === previous[index])) return

    setSlider((prev) => ({
      ...prev,
      slides: next
        .map((slideId, index) => {
          const slide = (prev.slides || []).find((item) => item.id === slideId)
          return slide ? { ...slide, position: index } : null
        })
        .filter(Boolean),
    }))

    await reorderSlidesRef.current?.(next)
  }, [onSlidePointerMove])

  const beginSlideDrag = (e, slide) => {
    if (isProductSlider || e.button !== 0) return
    e.preventDefault()
    e.stopPropagation()

    const el = cardRefs.current[slide.id]
    if (!el) return
    const rect = el.getBoundingClientRect()
    const order = slides.map((item) => item.id)
    const nextFloat = {
      left: rect.left,
      top: rect.top,
      width: rect.width,
      height: rect.height,
      offsetX: e.clientX - rect.left,
      offsetY: e.clientY - rect.top,
    }

    dragIdRef.current = slide.id
    liveOrderRef.current = order
    floatStyleRef.current = nextFloat
    setDraggingId(slide.id)
    setLiveOrder(order)
    setFloatStyle(nextFloat)
    document.body.style.userSelect = "none"
    document.body.style.cursor = "grabbing"

    window.addEventListener("pointermove", onSlidePointerMove)
    window.addEventListener("pointerup", onSlidePointerUp)
    window.addEventListener("pointercancel", onSlidePointerUp)
  }

  useEffect(
    () => () => {
      window.removeEventListener("pointermove", onSlidePointerMove)
      window.removeEventListener("pointerup", onSlidePointerUp)
      window.removeEventListener("pointercancel", onSlidePointerUp)
      document.body.style.userSelect = ""
      document.body.style.cursor = ""
    },
    [onSlidePointerMove, onSlidePointerUp],
  )

  const copyId = async () => {
    try {
      await navigator.clipboard.writeText(String(slider.id))
      setCopied(true)
      showToast("Slider ID copied")
      setTimeout(() => setCopied(false), 2000)
    } catch {
      showToast("Could not copy. Select the ID manually.", { error: true })
    }
  }

  const markEmbedded = async () => {
    await fetch("/api/onboarding", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ embeddedTheme: true }),
    })
    showToast("Marked theme embed as done")
  }

  if (loading) {
    return (
      <div className="se-loading">
        <Spinner size="large" />
      </div>
    )
  }

  if (error || !slider) {
    return (
      <Page title="Slider" backAction={{ content: "Sliders", onAction: () => navigate("/") }}>
        <Banner status="critical" title="Unable to open slider" action={{ content: "Back", onAction: () => navigate("/") }}>
          <p>{error || "Not found"}</p>
        </Banner>
      </Page>
    )
  }

  const tabs = [
    { id: "slides", content: `Slides (${slides.length})` },
    { id: "style", content: "Style & behavior" },
    { id: "publish", content: "Publish" },
    { id: "metrics", content: "Metrics" },
  ]

  return (
    <Page
      fullWidth
      title={slider.name}
      subtitle={`${typeInfo.label} · ${status === "draft" ? "Draft" : "Published"}`}
      backAction={{ content: "Sliders", onAction: () => navigate("/") }}
      primaryAction={{ content: "Save settings", onAction: persistSettings, disabled: saving }}
    >
      <div className="se-page">
      <Stack vertical spacing="loose">
        {softLimitHit && !hardLimitHit && (
          <Banner status="warning" title="Approaching slide limit">
            <p>
              This slider has {slides.length} slides. For best performance, keep under {SLIDE_SOFT_LIMIT}. Hard limit is{" "}
              {SLIDE_HARD_LIMIT}.
            </p>
          </Banner>
        )}
        {hardLimitHit && (
          <Banner status="critical" title="Slide limit reached">
            <p>Maximum of {SLIDE_HARD_LIMIT} slides. Remove a slide before adding another.</p>
          </Banner>
        )}

        <div className="se-editor-shell">
          <div className="se-editor-top">
            <div className="se-editor-top__meta">
              <TextField
                label="Slider name"
                value={name}
                onChange={setName}
                onBlur={() => saveSliderMeta({ name })}
                autoComplete="off"
              />
              <SeSelect
                label="Status"
                options={[
                  { label: "Published", value: "published" },
                  { label: "Draft", value: "draft" },
                ]}
                value={status}
                onChange={(value) => {
                  setStatus(value)
                  saveSliderMeta({ status: value })
                }}
              />
            </div>
          </div>

          <Tabs
            tabs={tabs}
            selected={selectedTab}
            onSelect={(tabIndex) => {
              setSelectedTab(tabIndex)
              if (tabIndex !== 0) setPanelMode(null)
              if (tabIndex === 3) fetchMetrics()
            }}
          >
            <div style={{ padding: "1rem 1.25rem 1.25rem" }}>
              {selectedTab === 0 && (
                <Stack vertical spacing="loose">
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                    <div>
                      <Text variant="headingSm" as="h3">
                        {isProductSlider ? "Products" : "Slides"}
                      </Text>
                      <Text variant="bodySm" color="subdued">
                        {isProductSlider
                          ? "Managed from Style & behavior — pick products or sync a collection"
                          : "Drag ⋮⋮ the slide lifts and others shift up or down"}
                      </Text>
                    </div>
                    {isProductSlider ? (
                      <Button onClick={() => setSelectedTab(1)}>Manage products</Button>
                    ) : (
                      <Button primary onClick={openAddSlide} disabled={hardLimitHit}>
                        Add slide
                      </Button>
                    )}
                  </div>

                  {isProductSlider && (
                    <Banner status="info" title="Product data comes from Shopify">
                      <p>
                        Title, image, and price are pulled from your catalog. Use Style & behavior to select products or
                        sync a collection, and set an optional section heading like “Featured products”.
                      </p>
                    </Banner>
                  )}

                  {slides.length === 0 && panelMode === null && (
                    <div className="se-empty" style={{ padding: "2rem 1.25rem" }}>
                      <div className="se-empty__icon">+</div>
                      <Text variant="headingSm" as="h3">
                        {isProductSlider ? "No products yet" : "No slides yet"}
                      </Text>
                      <div style={{ margin: "0.5rem 0 1rem" }}>
                        <Text color="subdued">
                          {isProductSlider
                            ? "Open Style & behavior to select products or sync a collection."
                            : "Add a slide with Shopify Files, CTAs, and overlays. Preview updates below."}
                        </Text>
                      </div>
                      {isProductSlider ? (
                        <Button primary onClick={() => setSelectedTab(1)}>
                          Select products
                        </Button>
                      ) : (
                        <Button primary onClick={openAddSlide}>
                          Add your first slide
                        </Button>
                      )}
                    </div>
                  )}

                  {displaySlides.map((slide, index) => {
                    const selected = !isProductSlider && String(panelMode) === String(slide.id)
                    const confirming = confirmDeleteId === slide.id
                    const isDragging = draggingId === slide.id
                    return (
                      <div
                        key={slide.id}
                        ref={(node) => {
                          if (node) cardRefs.current[slide.id] = node
                          else delete cardRefs.current[slide.id]
                        }}
                        style={{
                          border: isDragging
                            ? "2px dashed #c9ccd1"
                            : selected
                              ? "1px solid #d8dce2"
                              : "1px solid #e2e8f0",
                          borderRadius: 14,
                          padding: isDragging ? 0 : 14,
                          background: isDragging ? "#f6f6f7" : "#fff",
                          minHeight: isDragging ? floatStyle?.height || 84 : undefined,
                          boxShadow: "none",
                          transition: "border-color 0.15s ease, background 0.15s ease",
                        }}
                      >
                        <div
                          style={{
                            display: isDragging ? "none" : "flex",
                            gap: 12,
                            alignItems: "center",
                            justifyContent: "space-between",
                            flexWrap: "wrap",
                          }}
                        >
                          <div style={{ display: "flex", gap: 12, alignItems: "center", minWidth: 0 }}>
                            {!isProductSlider && (
                              <div
                                onPointerDown={(e) => beginSlideDrag(e, slide)}
                                style={{
                                  width: 22,
                                  color: "#94a3b8",
                                  fontSize: 16,
                                  lineHeight: 1,
                                  userSelect: "none",
                                  cursor: draggingId ? "grabbing" : "grab",
                                  padding: "6px 2px",
                                  touchAction: "none",
                                }}
                                title="Drag to reorder"
                                aria-label="Drag to reorder"
                              >
                                ⋮⋮
                              </div>
                            )}
                            <div
                              style={{
                                width: isProductSlider ? 64 : 72,
                                height: isProductSlider ? 64 : 54,
                                borderRadius: isProductSlider ? 10 : 10,
                                overflow: "hidden",
                                background: "#f1f5f9",
                                flexShrink: 0,
                                border: "1px solid #e2e8f0",
                              }}
                            >
                              {slide.imageUrl ? (
                                <img
                                  src={slide.imageUrl}
                                  alt={slide.title}
                                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                  draggable={false}
                                />
                              ) : null}
                            </div>
                            <div style={{ minWidth: 0 }}>
                              <Text variant="headingSm" as="h3">
                                {slide.heading || slide.title}
                              </Text>
                              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 4 }}>
                                {isProductSlider ? (
                                  <>
                                    {slide.description ? <Badge>{slide.description}</Badge> : null}
                                    <Text color="subdued">#{index + 1}</Text>
                                  </>
                                ) : (
                                  <>
                                    {slide.mediaType === "video" && <Badge status="info">Video</Badge>}
                                    {slide.ctaText && <Badge>{slide.ctaText}</Badge>}
                                    {slide.cta2Text && <Badge>{slide.cta2Text}</Badge>}
                                    <Text color="subdued">#{index + 1}</Text>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>

                          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                            {!isProductSlider && (
                              <>
                                <Button
                                  size="slim"
                                  onClick={() => {
                                    setConfirmDeleteId(null)
                                    setPanelMode(selected ? null : slide.id)
                                  }}
                                >
                                  {selected ? "Close" : "Edit"}
                                </Button>
                                <Button
                                  size="slim"
                                  onClick={() => duplicateSlide(slide)}
                                  disabled={saving || slides.length >= SLIDE_HARD_LIMIT}
                                >
                                  Duplicate
                                </Button>
                              </>
                            )}
                            <Button
                              size="slim"
                              destructive
                              onClick={() => setConfirmDeleteId(confirming ? null : slide.id)}
                            >
                              Remove
                            </Button>
                          </div>
                        </div>

                        {!isDragging && confirming && (
                          <div className="se-danger-bar">
                            <Text>{isProductSlider ? "Remove this product from the slider?" : "Delete this slide permanently?"}</Text>
                            <div style={{ display: "flex", gap: 8 }}>
                              <Button size="slim" onClick={() => setConfirmDeleteId(null)}>
                                Keep
                              </Button>
                              <Button size="slim" destructive onClick={() => removeSlide(slide.id)}>
                                Confirm
                              </Button>
                            </div>
                          </div>
                        )}

                        {!isDragging && selected && (
                          <SlideEditorPanel
                            key={String(slide.id)}
                            title="Edit slide"
                            initialSlide={slide}
                            brandKit={brandKit}
                            sliderType={sliderType}
                            settings={settings}
                            onCancel={() => setPanelMode(null)}
                            onSave={saveSlide}
                          />
                        )}
                      </div>
                    )
                  })}

                  {typeof document !== "undefined" &&
                    draggingSlide &&
                    floatStyle &&
                    createPortal(
                      <div
                        style={{
                          position: "fixed",
                          left: floatStyle.left,
                          top: floatStyle.top,
                          width: floatStyle.width,
                          zIndex: 10000,
                          pointerEvents: "none",
                          borderRadius: 14,
                          padding: 14,
                          background: "#fff",
                          border: "1px solid #d8dce2",
                          boxShadow: "0 16px 40px rgba(22, 29, 37, 0.18)",
                          transform: "scale(1.02)",
                          cursor: "grabbing",
                        }}
                      >
                        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                          <div
                            style={{
                              width: 22,
                              color: "#5c6ac4",
                              fontSize: 16,
                              lineHeight: 1,
                              userSelect: "none",
                            }}
                          >
                            ⋮⋮
                          </div>
                          <div
                            style={{
                              width: 72,
                              height: 54,
                              borderRadius: 10,
                              overflow: "hidden",
                              background: "#f1f5f9",
                              flexShrink: 0,
                              border: "1px solid #e2e8f0",
                            }}
                          >
                            {draggingSlide.imageUrl ? (
                              <img
                                src={draggingSlide.imageUrl}
                                alt=""
                                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                draggable={false}
                              />
                            ) : null}
                          </div>
                          <div style={{ minWidth: 0 }}>
                            <Text variant="headingSm" as="h3">
                              {draggingSlide.heading || draggingSlide.title}
                            </Text>
                            <Text color="subdued">Drop to reorder</Text>
                          </div>
                        </div>
                      </div>,
                      document.body,
                    )}

                  {!isProductSlider && (
                    <div ref={editorAnchorRef}>
                      {panelMode === "create" && (
                        <SlideEditorPanel
                          key="create"
                          title="Add slide"
                          initialSlide={null}
                          brandKit={brandKit}
                          sliderType={sliderType}
                          settings={settings}
                          onCancel={() => setPanelMode(null)}
                          onSave={saveSlide}
                        />
                      )}
                    </div>
                  )}
                </Stack>
              )}

              {selectedTab === 1 && (
                <Stack vertical>
                  <StyleSettingsForm
                    sliderId={slider.id}
                    sliderType={sliderType}
                    settings={settings}
                    onSettingsChange={setSettings}
                    onHeroAnimationChange={() => {
                      window.setTimeout(() => {
                        scrollPreviewIntoView(previewRef.current)
                      }, 80)
                    }}
                    onCollectionSynced={(data) => {
                      setSlider((prev) => ({
                        ...prev,
                        ...data,
                        slides: data.slides || [],
                      }))
                      setSettings(mergeSliderSettings(data.sliderType || sliderType, data.settings || {}))
                      showToast(`Synced ${data.syncMeta?.productCount ?? 0} products`)
                    }}
                    disabled={saving}
                  />
                  <Button primary onClick={persistSettings} disabled={saving}>
                    Save style settings
                  </Button>
                </Stack>
              )}

              {selectedTab === 2 && (
                <Stack vertical spacing="loose">
                  <Banner status="info" title="Add SlideEase to your theme">
                    <p>
                      1. Copy the Slider ID below.
                      <br />
                      2. Open Online Store → Themes → Customize.
                      <br />
                      3. Add section → Apps → SlideEase Slider.
                      <br />
                      4. Paste the Slider ID and save.
                    </p>
                  </Banner>

                  <div
                    style={{
                      border: "1px solid #170f49",
                      background: "#ffffff",
                      borderRadius: 12,
                      padding: 22,
                      textAlign: "center",
                    }}
                  >
                    <Text variant="bodySm" color="subdued">
                      Slider ID
                    </Text>
                    <div
                      style={{
                        fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
                        fontSize: 30,
                        fontWeight: 700,
                        color: "#170f49",
                        margin: "8px 0 14px",
                        userSelect: "all",
                        letterSpacing: "-0.02em",
                      }}
                    >
                      {slider.id}
                    </div>
                    <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
                      <Button primary onClick={copyId}>
                        {copied ? "Copied" : "Copy Slider ID"}
                      </Button>
                      <Button onClick={markEmbedded}>Mark embed done</Button>
                      <Button onClick={() => navigate("/setupguide")}>Open setup guide</Button>
                    </div>
                  </div>
                </Stack>
              )}

              {selectedTab === 3 && (
                <Stack vertical spacing="loose">
                  <Banner status="info">
                    <p>Metrics come from storefront views and CTA clicks recorded by the CDN script.</p>
                  </Banner>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12 }}>
                    {[
                      { label: "Views", value: metrics?.views ?? "—" },
                      { label: "CTA clicks", value: metrics?.ctaClicks ?? "—" },
                      { label: "CTR %", value: metrics?.ctr ?? "—" },
                    ].map((item) => (
                      <div
                        key={item.label}
                        style={{
                          border: "1px solid #170f49",
                          borderRadius: 12,
                          padding: 16,
                          background: "#ffffff",
                        }}
                      >
                        <Text variant="bodySm" color="subdued">
                          {item.label}
                        </Text>
                        <div style={{ fontSize: 28, fontWeight: 700, marginTop: 4, color: "#0f172a" }}>
                          {item.value}
                        </div>
                      </div>
                    ))}
                  </div>
                  <Button onClick={fetchMetrics}>Refresh metrics</Button>
                </Stack>
              )}
            </div>
          </Tabs>
        </div>

        <div className="se-preview-wrap" ref={previewRef}>
          <div className="se-preview-wrap__head">
            <div>
              <Text variant="headingMd" as="h2">
                Live preview
              </Text>
            </div>
          </div>
          <div style={{ padding: "0.75rem 1.25rem 1.25rem" }}>
            <SliderPreview slides={slides} sliderType={sliderType} settings={settings} />
          </div>
        </div>
      </Stack>
      </div>
    </Page>
  )
}

export default function SliderEditorPage() {
  return (
    <ToastProvider>
      <SliderEditorContent />
    </ToastProvider>
  )
}
