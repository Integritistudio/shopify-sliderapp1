"use client"

import { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Text, ProgressBar } from "@shopify/polaris"
import { IconCheck } from "./icons"

export default function OnboardingChecklist({ sliders = [] }) {
  const navigate = useNavigate()
  const [row, setRow] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchOnboarding = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/onboarding")
      if (!response.ok) throw new Error("Failed")
      const data = await response.json()
      setRow(data)
    } catch {
      setRow(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOnboarding()
  }, [sliders.length])

  const steps = useMemo(() => {
    const first = sliders[0]
    return [
      {
        key: "createdSlider",
        label: "Create a slider",
        done: Boolean(row?.createdSlider || sliders.length > 0),
        action: () => navigate("/"),
      },
      {
        key: "addedSlide",
        label: "Add at least one slide",
        done: Boolean(row?.addedSlide || sliders.some((s) => (s.slides?.length || 0) > 0)),
        action: () => (first ? navigate(`/sliders/${first.id}`) : navigate("/")),
      },
      {
        key: "publishedSlider",
        label: "Publish a slider",
        done: Boolean(row?.publishedSlider || sliders.some((s) => s.status === "published")),
        action: () => (first ? navigate(`/sliders/${first.id}`) : navigate("/")),
      },
      {
        key: "embeddedTheme",
        label: "Embed in your theme",
        done: Boolean(row?.embeddedTheme),
        action: () => navigate(first ? `/sliders/${first.id}` : "/setupguide"),
      },
    ]
  }, [row, sliders, navigate])

  const doneCount = steps.filter((s) => s.done).length
  const complete = doneCount === steps.length

  if (loading || !row || row.dismissed || complete) return null

  const dismiss = async () => {
    await fetch("/api/onboarding", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dismissed: true }),
    })
    setRow((prev) => ({ ...prev, dismissed: true }))
  }

  const markEmbedded = async () => {
    const response = await fetch("/api/onboarding", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ embeddedTheme: true }),
    })
    if (response.ok) {
      const data = await response.json()
      setRow(data)
    }
  }

  return (
    <div className="se-onboard">
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <div>
          <Text variant="headingMd" as="h2">
            Get started
          </Text>
          <Text color="subdued">
            {doneCount} of {steps.length} steps complete
          </Text>
        </div>
        <button type="button" className="se-btn se-btn--ghost se-btn--sm" onClick={dismiss}>
          Dismiss
        </button>
      </div>
      <div style={{ marginTop: 10 }}>
        <ProgressBar progress={(doneCount / steps.length) * 100} size="small" />
      </div>
      <div className="se-onboard__steps">
        {steps.map((step) => (
          <div key={step.key} className={`se-onboard__step${step.done ? " is-done" : ""}`}>
            <div style={{ display: "flex", alignItems: "center", minWidth: 0 }}>
              <span className={`se-check${step.done ? " is-done" : ""}`}>
                {step.done ? <IconCheck size={11} /> : null}
              </span>
              <Text>{step.label}</Text>
            </div>
            {!step.done && (
              <button
                type="button"
                className="se-btn se-btn--secondary se-btn--sm"
                onClick={step.key === "embeddedTheme" ? markEmbedded : step.action}
              >
                {step.key === "embeddedTheme" ? "Mark done" : "Go"}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
