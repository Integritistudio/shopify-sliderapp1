/**
 * Centralized subscription plan configuration (frontend).
 * Keep in sync with web/utils/plans.js
 */

import { resolveSliderType } from "./sliderConfig"

export const APP_HANDLE = "slideease"
export const SLIDE_ABSOLUTE_CEILING = 50
export const SLIDE_SOFT_LIMIT = 20

export const CURATED_PRESET_ORDER = [
  "hero-fullwidth",
  "hero-boxed",
  "autoplay",
  "center",
  "product-carousel",
  "product-showcase",
  "collection-rail",
  "testimonials",
  "logo-grid",
  "stories",
  "announcement",
  "marquee",
]

export const PLAN_IDS = ["free", "standard", "pro"]

/** Free = homepage only. Standard/Pro = any page. null = unrestricted. */
export const HOMEPAGE_PAGE_TYPES = ["index"]

export const PLANS = {
  free: {
    id: "free",
    name: "Free",
    priceMonthly: 0,
    shopifyHandles: ["free", "free plan", "starter"],
    maxSliders: 2,
    maxSlidesPerSlider: 3,
    allowedPresets: CURATED_PRESET_ORDER.slice(0, 2),
    allowedPageTypes: HOMEPAGE_PAGE_TYPES,
    placementAnyPage: false,
    placementLabel: "Homepage Only",
    placementAllowedSummary: "Homepage",
    placementBlockedSummary: "Product, Collection, Blog, and other pages",
    supportLabel: "Standard",
    templatesLabel: "2 Basic Styles",
  },
  standard: {
    id: "standard",
    name: "Standard",
    priceMonthly: 4.99,
    shopifyHandles: ["standard", "standard plan"],
    maxSliders: 8,
    maxSlidesPerSlider: 10,
    allowedPresets: CURATED_PRESET_ORDER.slice(0, 5),
    allowedPageTypes: null,
    placementAnyPage: true,
    placementLabel: "Any page (Product, Collection, Blog)",
    placementAllowedSummary: "Any page (Product, Collection, Blog, Homepage, and more)",
    placementBlockedSummary: null,
    supportLabel: "Email + chat",
    templatesLabel: "5 Premium Styles",
  },
  pro: {
    id: "pro",
    name: "Pro",
    priceMonthly: 9.99,
    shopifyHandles: ["pro", "pro plan", "premium"],
    maxSliders: null,
    maxSlidesPerSlider: null,
    allowedPresets: null,
    allowedPageTypes: null,
    placementAnyPage: true,
    placementLabel: "Any Page (Product, Collection, Blog)",
    placementAllowedSummary: "Any page (Product, Collection, Blog, Homepage, and more)",
    placementBlockedSummary: null,
    supportLabel: "Priority",
    templatesLabel: "10+ Premium Styles",
  },
}

export function getPlan(planId = "free") {
  return PLANS[planId] || PLANS.free
}

export function getPlanLimits(planId = "free") {
  const plan = getPlan(planId)
  return {
    maxSliders: plan.maxSliders,
    maxSlidesPerSlider: plan.maxSlidesPerSlider,
    allowedPresets: plan.allowedPresets,
    placementAnyPage: plan.placementAnyPage,
    allowedPageTypes: plan.allowedPageTypes,
  }
}

export function normalizePageType(pageType) {
  return String(pageType || "")
    .trim()
    .toLowerCase()
}

/**
 * Whether a plan may render a slider on this Shopify page type.
 */
export function canPlaceOnPageType(planId, pageType, options = {}) {
  const plan = getPlan(planId)
  const type = normalizePageType(pageType)
  const unknown = options.unknown === "deny" ? "deny" : "allow"

  if (plan.placementAnyPage || plan.allowedPageTypes == null) {
    return { allowed: true, reason: null }
  }

  if (!type) {
    return unknown === "deny"
      ? { allowed: false, reason: "HOMEPAGE_ONLY" }
      : { allowed: true, reason: null }
  }

  if (plan.allowedPageTypes.includes(type)) {
    return { allowed: true, reason: null }
  }

  return { allowed: false, reason: "HOMEPAGE_ONLY" }
}

export function placementGuidance(planId) {
  const plan = getPlan(planId)
  if (plan.placementAnyPage) {
    return {
      title: `${plan.name}: place on any page`,
      body: `Your ${plan.name} plan can show sliders on Product, Collection, Blog, Homepage, and any other page.`,
      tone: "success",
    }
  }
  return {
    title: `${plan.name}: homepage only`,
    body: `Your Free plan can show sliders on the Homepage only. They will not appear on Product, Collection, Blog, or other pages. Upgrade to Standard or Pro for any-page placement.`,
    tone: "warning",
  }
}

export function isPresetAllowed(planId, sliderType) {
  const plan = getPlan(planId)
  if (plan.allowedPresets == null) return true
  const resolved = resolveSliderType(sliderType)
  return plan.allowedPresets.includes(resolved)
}

export function requiredPlanForPreset(sliderType) {
  const resolved = resolveSliderType(sliderType)
  for (const id of PLAN_IDS) {
    if (isPresetAllowed(id, resolved)) return id
  }
  return "pro"
}

export function canCreateSlider({ planId, currentCount, sliderType }) {
  const plan = getPlan(planId)
  if (!isPresetAllowed(planId, sliderType)) {
    return {
      ok: false,
      code: "PLAN_PRESET_LOCKED",
      message: `${getPlan(requiredPlanForPreset(sliderType)).name} plan is required for this preset.`,
      requiredPlan: requiredPlanForPreset(sliderType),
    }
  }
  if (plan.maxSliders != null && currentCount >= plan.maxSliders) {
    return {
      ok: false,
      code: "PLAN_SLIDER_LIMIT",
      message: `Your ${plan.name} plan allows up to ${plan.maxSliders} sliders. Upgrade to create more.`,
      requiredPlan: planId === "free" ? "standard" : "pro",
    }
  }
  return { ok: true }
}

export function canAddSlide({ planId, currentSlideCount }) {
  const plan = getPlan(planId)
  const planMax = plan.maxSlidesPerSlider
  const effectiveMax =
    planMax == null ? SLIDE_ABSOLUTE_CEILING : Math.min(planMax, SLIDE_ABSOLUTE_CEILING)

  if (currentSlideCount >= effectiveMax) {
    const isPlanCap = planMax != null && currentSlideCount >= planMax
    return {
      ok: false,
      code: isPlanCap ? "PLAN_SLIDE_LIMIT" : "SLIDE_HARD_LIMIT",
      message: isPlanCap
        ? `Your ${plan.name} plan allows up to ${planMax} slides per slider. Upgrade to add more.`
        : `This slider already has ${SLIDE_ABSOLUTE_CEILING} slides (maximum). Remove a slide before adding another.`,
      requiredPlan: isPlanCap ? (planId === "free" ? "standard" : "pro") : null,
      limit: effectiveMax,
    }
  }
  return { ok: true, limit: effectiveMax }
}

export function effectiveMaxSlides(planId) {
  const plan = getPlan(planId)
  if (plan.maxSlidesPerSlider == null) return SLIDE_ABSOLUTE_CEILING
  return Math.min(plan.maxSlidesPerSlider, SLIDE_ABSOLUTE_CEILING)
}

export function buildManagedPricingUrl(shopDomain) {
  const shop = String(shopDomain || "").trim().toLowerCase()
  const storeHandle = shop.replace(/\.myshopify\.com$/i, "").replace(/^https?:\/\//, "")
  if (!storeHandle) return null
  return `https://admin.shopify.com/store/${storeHandle}/charges/${APP_HANDLE}/pricing_plans`
}

export function planRank(planId) {
  return PLAN_IDS.indexOf(PLAN_IDS.includes(planId) ? planId : "free")
}

export function isPlanAtLeast(planId, minimumPlanId) {
  return planRank(planId) >= planRank(minimumPlanId)
}

export function formatPlanPrice(plan) {
  if (!plan || !plan.priceMonthly) return "Free"
  return `$${Number(plan.priceMonthly).toFixed(2)}/mo`
}

export function formatLimit(value, unlimitedLabel = "Unlimited") {
  return value == null ? unlimitedLabel : String(value)
}
