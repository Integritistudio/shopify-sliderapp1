"use client"

import { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Page, Stack, Text, Spinner, TextField, Banner } from "@shopify/polaris"
import { ToastProvider, useToast } from "../contexts/toast-context"
import CreateSliderPanel from "../components/create-slider-panel"
import OnboardingChecklist from "../components/onboarding-checklist"
import { getSliderTypeInfo } from "../utils/sliderConfig"
import {
  IconPlus,
  IconEdit,
  IconCopy,
  IconTrash,
  IconClose,
  IconPalette,
  IconBook,
  IconLayers,
} from "../components/icons"

function SlidersIndexContent() {
  const { showToast } = useToast()
  const navigate = useNavigate()
  const [sliders, setSliders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [query, setQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [showCreate, setShowCreate] = useState(false)
  const [deleteTargetId, setDeleteTargetId] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [duplicatingId, setDuplicatingId] = useState(null)
  const [metricsSummary, setMetricsSummary] = useState(null)

  const fetchSliders = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch("/api/sliders")
      if (!response.ok) throw new Error("Failed to fetch sliders")
      const data = await response.json()
      setSliders(Array.isArray(data) ? data : [])
      fetch("/api/metrics/summary")
        .then((r) => (r.ok ? r.json() : null))
        .then((m) => m && setMetricsSummary(m))
        .catch(() => {})
    } catch (err) {
      setError(err.message)
      showToast(err.message, { error: true })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSliders()
  }, [])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return sliders.filter((slider) => {
      if (statusFilter === "published" && slider.status !== "published") return false
      if (statusFilter === "draft" && slider.status !== "draft") return false
      if (!q) return true
      return (
        slider.name?.toLowerCase().includes(q) ||
        String(slider.id).includes(q) ||
        slider.sliderType?.toLowerCase().includes(q)
      )
    })
  }, [sliders, query, statusFilter])

  const totalSlides = useMemo(
    () => sliders.reduce((sum, s) => sum + (s.slides?.length || 0), 0),
    [sliders],
  )

  const createSlider = async (name, sliderType) => {
    const response = await fetch("/api/sliders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        sliderType,
        status: "draft",
      }),
    })
    if (!response.ok) {
      const data = await response.json().catch(() => ({}))
      throw new Error(data.error || "Failed to create slider")
    }
    const slider = await response.json()
    showToast(`Slider "${slider.name}" created`)
    setShowCreate(false)
    navigate(`/sliders/${slider.id}`)
  }

  const duplicateSlider = async (slider) => {
    try {
      setDuplicatingId(slider.id)
      const response = await fetch(`/api/sliders/${slider.id}/duplicate`, { method: "POST" })
      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data.error || "Failed to duplicate slider")
      }
      const copy = await response.json()
      setSliders((prev) => [copy, ...prev])
      showToast(`Duplicated as "${copy.name}"`)
      navigate(`/sliders/${copy.id}`)
    } catch (err) {
      showToast(err.message, { error: true })
    } finally {
      setDuplicatingId(null)
    }
  }

  const confirmDelete = async (slider) => {
    try {
      setDeleting(true)
      const response = await fetch(`/api/sliders/${slider.id}`, { method: "DELETE" })
      if (!response.ok) throw new Error("Failed to delete slider")
      setSliders((prev) => prev.filter((s) => s.id !== slider.id))
      showToast(`Deleted "${slider.name}"`)
      setDeleteTargetId(null)
    } catch (err) {
      showToast(err.message, { error: true })
    } finally {
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <Page title="SlideEase">
        <div style={{ textAlign: "center", padding: "4rem" }}>
          <Spinner size="large" />
        </div>
      </Page>
    )
  }

  return (
      <Page title="SlideEase">
      <div className="se-page">
        <Stack vertical spacing="loose">
          <div className="se-hero">
            <div className="se-hero__eyebrow">
              <IconLayers size={12} />
              SlideEase
            </div>
            <h1 className="se-hero__title">Storefront sliders, refined</h1>
            <p className="se-hero__sub">
              Design, preview, and publish — then embed in your theme with a single ID.
            </p>
            <div className="se-hero__stats">
              <span className="se-stat">
                {sliders.length} slider{sliders.length === 1 ? "" : "s"}
              </span>
              <span className="se-stat">{totalSlides} slides</span>
              {metricsSummary ? (
                <span className="se-stat">
                  {metricsSummary.views} views · {metricsSummary.ctr}% CTR
                </span>
              ) : null}
            </div>
            <div className="se-hero__actions">
              <button
                type="button"
                className="se-btn se-btn--primary"
                onClick={() => setShowCreate((v) => !v)}
              >
                {showCreate ? <IconClose size={15} /> : <IconPlus size={15} />}
                {showCreate ? "Close" : "Create slider"}
              </button>
              <button type="button" className="se-btn se-btn--secondary" onClick={() => navigate("/brand-kit")}>
                <IconPalette size={15} />
                Brand kit
              </button>
              <button type="button" className="se-btn se-btn--ghost" onClick={() => navigate("/setupguide")} style={{ color: "rgba(248,250,252,0.75)" }}>
                <IconBook size={15} />
                Setup
              </button>
            </div>
          </div>

          {error && (
            <Banner status="critical" title="Could not load sliders" action={{ content: "Retry", onAction: fetchSliders }}>
              <p>{error}</p>
            </Banner>
          )}

          <OnboardingChecklist sliders={sliders} />

          {showCreate && (
            <CreateSliderPanel onCancel={() => setShowCreate(false)} onCreateSlider={createSlider} />
          )}

          <div className="se-panel">
            <div className="se-panel__body">
              <div className="se-toolbar">
                <div style={{ minWidth: 220, flex: "1 1 240px", maxWidth: 360 }}>
                  <TextField
                    label="Search sliders"
                    labelHidden
                    value={query}
                    onChange={setQuery}
                    placeholder="Search by name, ID, or type"
                    clearButton
                    onClearButtonClick={() => setQuery("")}
                    autoComplete="off"
                  />
                </div>
                <div className="se-chips">
                  {[
                    { id: "all", label: "All" },
                    { id: "published", label: "Published" },
                    { id: "draft", label: "Draft" },
                  ].map((chip) => (
                    <button
                      key={chip.id}
                      type="button"
                      className={`se-chip${statusFilter === chip.id ? " is-active" : ""}`}
                      onClick={() => setStatusFilter(chip.id)}
                    >
                      {chip.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="se-empty">
              <div className="se-empty__icon">
                <IconLayers size={22} />
              </div>
              <Text variant="headingMd" as="h2">
                {sliders.length ? "No matching sliders" : "Create your first slider"}
              </Text>
              <div style={{ margin: "0.5rem auto 1.15rem", maxWidth: 360 }}>
                <Text color="subdued">
                  {sliders.length
                    ? "Try another search or status filter."
                    : "Add images, CTAs, and style — then embed with one ID."}
                </Text>
              </div>
              <button type="button" className="se-btn se-btn--primary" onClick={() => setShowCreate(true)}>
                <IconPlus size={15} />
                Create slider
              </button>
            </div>
          ) : (
            <Stack vertical spacing="tight">
              {filtered.map((slider) => {
                const typeInfo = getSliderTypeInfo(slider.sliderType)
                const thumb = slider.slides?.find((s) => s.imageUrl)?.imageUrl
                const confirming = deleteTargetId === slider.id
                const isDraft = slider.status === "draft"
                return (
                  <div key={slider.id}>
                    <div className="se-slider-card">
                      <div className="se-thumb">{thumb ? <img src={thumb} alt="" /> : null}</div>
                      <div style={{ minWidth: 0 }}>
                        <h2 className="se-slider-card__title">{slider.name}</h2>
                        <div className="se-meta">
                          <span className="se-pill">ID {slider.id}</span>
                          <span className="se-pill">{typeInfo.label}</span>
                          <span className={`se-pill ${isDraft ? "se-pill--draft" : "se-pill--live"}`}>
                            {isDraft ? "Draft" : "Published"}
                          </span>
                          <span className="se-pill">{slider.slides?.length || 0} slides</span>
                        </div>
                      </div>
                      <div className="se-actions">
                        <button
                          type="button"
                          className="se-btn se-btn--primary se-btn--sm"
                          onClick={() => navigate(`/sliders/${slider.id}`)}
                        >
                          <IconEdit size={14} />
                          Edit
                        </button>
                        <button
                          type="button"
                          className="se-btn se-btn--secondary se-btn--sm"
                          disabled={duplicatingId === slider.id}
                          onClick={() => duplicateSlider(slider)}
                        >
                          {duplicatingId === slider.id ? <span className="se-btn__spin" /> : <IconCopy size={14} />}
                          Duplicate
                        </button>
                        <button
                          type="button"
                          className="se-btn se-btn--danger se-btn--sm"
                          onClick={() => setDeleteTargetId(confirming ? null : slider.id)}
                        >
                          <IconTrash size={14} />
                          Delete
                        </button>
                      </div>
                    </div>
                    {confirming && (
                      <div className="se-danger-bar">
                        <Text>
                          Delete <strong>{slider.name}</strong>? This cannot be undone.
                        </Text>
                        <div style={{ display: "flex", gap: 8 }}>
                          <button type="button" className="se-btn se-btn--secondary se-btn--sm" onClick={() => setDeleteTargetId(null)}>
                            Keep
                          </button>
                          <button
                            type="button"
                            className="se-btn se-btn--danger-solid se-btn--sm"
                            disabled={deleting}
                            onClick={() => confirmDelete(slider)}
                          >
                            {deleting ? <span className="se-btn__spin" /> : <IconTrash size={14} />}
                            Confirm
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </Stack>
          )}
        </Stack>
      </div>
    </Page>
  )
}

export default function SliderPage() {
  return (
    <ToastProvider>
      <SlidersIndexContent />
    </ToastProvider>
  )
}
