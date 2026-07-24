import { useCallback, useEffect, useState } from "react"
import { getPlan, getPlanLimits } from "../utils/plans"

const defaultState = {
  loading: true,
  error: null,
  planId: "free",
  plan: getPlan("free"),
  limits: getPlanLimits("free"),
  usage: { sliderCount: 0 },
  pricingUrl: null,
  subscriptionName: null,
}

/**
 * Fetch and cache the merchant's subscription plan from GET /api/billing/plan.
 */
export function useShopPlan() {
  const [state, setState] = useState(defaultState)

  const refresh = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }))
      const params = new URLSearchParams(window.location.search)
      const planHandle = params.get("plan_handle") || params.get("planHandle")
      const qs = planHandle ? `?plan_handle=${encodeURIComponent(planHandle)}` : ""
      const response = await fetch(`/api/billing/plan${qs}`)
      const data = await response.json().catch(() => ({}))
      if (!response.ok) {
        throw new Error(data.error || "Failed to load plan")
      }
      setState({
        loading: false,
        error: null,
        planId: data.planId || "free",
        plan: getPlan(data.planId || "free"),
        limits: data.limits || getPlanLimits(data.planId || "free"),
        usage: data.usage || { sliderCount: 0 },
        pricingUrl: data.pricingUrl || null,
        subscriptionName: data.subscriptionName || null,
      })
    } catch (error) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: error.message,
        planId: "free",
        plan: getPlan("free"),
        limits: getPlanLimits("free"),
      }))
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  return { ...state, refresh }
}

export function openManagedPricing(pricingUrl) {
  if (!pricingUrl) return
  // Break out of the embedded iframe to Shopify admin plan selection
  if (window.top && window.top !== window.self) {
    window.top.location.href = pricingUrl
  } else {
    window.location.href = pricingUrl
  }
}
