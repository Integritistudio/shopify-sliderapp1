"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
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
  Select,
} from "@shopify/polaris"
import { ToastProvider, useToast } from "../../contexts/toast-context"
import SliderPreview from "../../components/slider-preview"
import StyleSettingsForm from "../../components/style-settings-form"
import SlideEditorPanel from "../../components/slide-editor-panel"
import { getSliderTypeInfo, mergeSliderSettings } from "../../utils/sliderConfig"
import { SLIDE_HARD_LIMIT, SLIDE_SOFT_LIMIT } from "../../utils/limits"

function SliderEditorContent() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { showToast } = useToast()
  const editorAnchorRef = useRef(null)
  const dragIdRef = useRef(null)

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
  const [dragOverId, setDragOverId] = useState(null)

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

  const editingSlide = useMemo(() => {
    if (panelMode === "create" || !panelMode) return null
    return slides.find((slide) => String(slide.id) === String(panelMode)) || null
  }, [panelMode, slides])

  const typeInfo = getSliderTypeInfo(sliderType)
  const softLimitHit = slides.length >= SLIDE_SOFT_LIMIT
  const hardLimitHit = slides.length >= SLIDE_HARD_LIMIT

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
      showToast("Slider settings saved")
    } catch (err) {
      showToast(err.message, { error: true })
    } finally {
      setSaving(false)
    }
  }

  const handleTypeChange = async (type) => {
    const nextSettings = mergeSliderSettings(type, settings)
    setSliderType(type)
    setSettings(nextSettings)
    await saveSliderMeta({ sliderType: type, settings: nextSettings })
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

  const moveSlide = async (slideId, direction) => {
    const ordered = slides.map((s) => s.id)
    const index = ordered.indexOf(slideId)
    const target = index + direction
    if (index < 0 || target < 0 || target >= ordered.length) return
    const next = [...ordered]
    ;[next[index], next[target]] = [next[target], next[index]]
    await reorderSlides(next)
  }

  const onDragStart = (slideId) => {
    dragIdRef.current = slideId
  }

  const onDrop = async (targetId) => {
    const sourceId = dragIdRef.current
    dragIdRef.current = null
    setDragOverId(null)
    if (!sourceId || sourceId === targetId) return
    const ordered = slides.map((s) => s.id)
    const from = ordered.indexOf(sourceId)
    const to = ordered.indexOf(targetId)
    if (from < 0 || to < 0) return
    const next = [...ordered]
    next.splice(from, 1)
    next.splice(to, 0, sourceId)
    await reorderSlides(next)
  }

  const toggleVisibility = async (slide) => {
    try {
      const response = await fetch(`/api/sliders/${id}/slides/${slide.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isVisible: !slide.isVisible }),
      })
      if (!response.ok) throw new Error("Failed to update visibility")
      const saved = await response.json()
      setSlider((prev) => ({
        ...prev,
        slides: (prev.slides || []).map((item) => (item.id === saved.id ? saved : item)),
      }))
    } catch (err) {
      showToast(err.message, { error: true })
    }
  }

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
      <Page title="Loading slider">
        <div style={{ textAlign: "center", padding: "4rem" }}>
          <Spinner size="large" />
        </div>
      </Page>
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
      title={slider.name}
      subtitle={`${typeInfo.label} · ${status === "draft" ? "Draft" : "Published"}`}
      backAction={{ content: "Sliders", onAction: () => navigate("/") }}
      primaryAction={{ content: "Save settings", onAction: persistSettings, loading: saving }}
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
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "minmax(0, 2fr) minmax(140px, 1fr)",
                gap: "1rem",
                marginBottom: "0.35rem",
              }}
            >
              <TextField
                label="Slider name"
                value={name}
                onChange={setName}
                onBlur={() => saveSliderMeta({ name })}
                autoComplete="off"
              />
              <Select
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
                        Slides
                      </Text>
                      <Text variant="bodySm" color="subdued">
                        Drag cards to reorder
                      </Text>
                    </div>
                    <Button primary onClick={openAddSlide} disabled={hardLimitHit}>
                      Add slide
                    </Button>
                  </div>

                  {slides.length === 0 && panelMode === null && (
                    <div className="se-empty" style={{ padding: "2rem 1.25rem" }}>
                      <div className="se-empty__icon">+</div>
                      <Text variant="headingSm" as="h3">
                        No slides yet
                      </Text>
                      <div style={{ margin: "0.5rem 0 1rem" }}>
                        <Text color="subdued">
                          Add a slide with Shopify Files, CTAs, and overlays. Preview updates below.
                        </Text>
                      </div>
                      <Button primary onClick={openAddSlide}>
                        Add your first slide
                      </Button>
                    </div>
                  )}

                  {slides.map((slide, index) => {
                    const selected = String(panelMode) === String(slide.id)
                    const confirming = confirmDeleteId === slide.id
                    return (
                      <div
                        key={slide.id}
                        draggable
                        onDragStart={() => onDragStart(slide.id)}
                        onDragOver={(e) => {
                          e.preventDefault()
                          setDragOverId(slide.id)
                        }}
                        onDragLeave={() => setDragOverId((prev) => (prev === slide.id ? null : prev))}
                        onDrop={() => onDrop(slide.id)}
        style={{
                          border:
                            dragOverId === slide.id
                              ? "2px dashed #2c4a6e"
                              : selected
                                ? "2px solid #2c4a6e"
                                : "1px solid #e2e8f0",
                          borderRadius: 14,
                          padding: 14,
                          background: selected ? "#f3f6fa" : "#fff",
                          cursor: "grab",
                          boxShadow: selected ? "0 8px 20px rgba(26,47,74,0.1)" : "none",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            gap: 12,
                            alignItems: "center",
                            justifyContent: "space-between",
                            flexWrap: "wrap",
                          }}
                        >
                          <div style={{ display: "flex", gap: 12, alignItems: "center", minWidth: 0 }}>
                            <div
                              style={{
                                width: 18,
                                color: "#94a3b8",
                                fontSize: 16,
                                lineHeight: 1,
                                userSelect: "none",
                              }}
                              title="Drag to reorder"
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
                              {slide.imageUrl ? (
                                <img
                                  src={slide.imageUrl}
                                  alt={slide.title}
                                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                />
                              ) : null}
                            </div>
                            <div style={{ minWidth: 0 }}>
                              <Text variant="headingSm" as="h3">
                                {slide.heading || slide.title}
                              </Text>
                              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 4 }}>
                                <Badge status={slide.isVisible === false ? "warning" : "success"}>
                                  {slide.isVisible === false ? "Hidden" : "Visible"}
                                </Badge>
                                {slide.mediaType === "video" && <Badge status="info">Video</Badge>}
                                {slide.ctaText && <Badge>{slide.ctaText}</Badge>}
                                <Text color="subdued">#{index + 1}</Text>
                              </div>
                            </div>
                          </div>

                          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                            <Button size="slim" onClick={() => moveSlide(slide.id, -1)} disabled={index === 0}>
                              Up
                            </Button>
                            <Button
                              size="slim"
                              onClick={() => moveSlide(slide.id, 1)}
                              disabled={index === slides.length - 1}
                            >
                              Down
                            </Button>
                            <Button size="slim" onClick={() => toggleVisibility(slide)}>
                              {slide.isVisible === false ? "Show" : "Hide"}
                            </Button>
                            <Button
                              size="slim"
                              primary={selected}
                              onClick={() => {
                                setConfirmDeleteId(null)
                                setPanelMode(selected ? null : slide.id)
                              }}
                            >
                              {selected ? "Close" : "Edit"}
                            </Button>
                            <Button
                              size="slim"
                              destructive
                              onClick={() => setConfirmDeleteId(confirming ? null : slide.id)}
                            >
                              Delete
                            </Button>
                          </div>
                        </div>

                        {confirming && (
                          <div className="se-danger-bar">
                            <Text>Delete this slide permanently?</Text>
                            <div style={{ display: "flex", gap: 8 }}>
                              <Button size="slim" onClick={() => setConfirmDeleteId(null)}>
                                Keep
                              </Button>
                              <Button size="slim" destructive onClick={() => removeSlide(slide.id)}>
                                Confirm delete
                              </Button>
                            </div>
                          </div>
                        )}

                        {selected && (
                          <SlideEditorPanel
                            key={String(slide.id)}
                            title="Edit slide"
                            initialSlide={slide}
                            brandKit={brandKit}
                            onCancel={() => setPanelMode(null)}
                            onSave={saveSlide}
                          />
                        )}
                      </div>
                    )
                  })}

                  <div ref={editorAnchorRef}>
                    {panelMode === "create" && (
                      <SlideEditorPanel
                        key="create"
                        title="Add slide"
                        initialSlide={null}
                        brandKit={brandKit}
                        onCancel={() => setPanelMode(null)}
                        onSave={saveSlide}
                      />
                    )}
                  </div>
                </Stack>
              )}

              {selectedTab === 1 && (
                <Stack vertical>
                  <StyleSettingsForm
                    sliderType={sliderType}
                    settings={settings}
                    onTypeChange={handleTypeChange}
                    onSettingsChange={setSettings}
                    disabled={saving}
                  />
                  <Button primary onClick={persistSettings} loading={saving}>
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
                      border: "1px solid #c5d0de",
                      background: "linear-gradient(180deg, #f3f6fa 0%, #ffffff 100%)",
                      borderRadius: 16,
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
                        color: "#1a2f4a",
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
                          border: "1px solid #e2e8f0",
                          borderRadius: 14,
                          padding: 16,
                          background: "linear-gradient(180deg, #f3f6fa 0%, #ffffff 100%)",
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

        <div className="se-preview-wrap">
          <div className="se-preview-wrap__head">
            <div>
              <Text variant="headingMd" as="h2">
                Live preview
              </Text>
              <Text color="subdued">{typeInfo.description}</Text>
            </div>
            <Badge status={typeInfo.color}>{typeInfo.label}</Badge>
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
