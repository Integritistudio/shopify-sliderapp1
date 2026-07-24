/**
 * Centralized subscription plan configuration (backend).
 * Partner Dashboard plan handles/names should match shopifyHandles (case-insensitive).
 *
 * Free / Standard / Pro limits drive all feature gates — update here, not in route handlers.
 */

import { resolveSliderType } from "./sliderDefaults.js"

/** App handle from shopify.app.toml — used for Managed Pricing URLs */
export const APP_HANDLE = "slideease"

/** Absolute safety ceiling even on Pro (performance) */
export const SLIDE_ABSOLUTE_CEILING = 50

/** Soft performance hint threshold (not a hard plan gate) */
export const SLIDE_SOFT_LIMIT = 20

/**
 * Curated preset order — must match frontend SLIDER_TYPES order.
 * Standard unlocks the first 5; Free unlocks the first 2; Pro unlocks all.
 */
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

/**
 * Shopify `request.page_type` values.
 * Free = homepage only. Standard/Pro = any page (product, collection, blog, …).
 * `null` allowedPageTypes = unrestricted (any page type).
 */
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
    /** Homepage only — blocked on product, collection, blog, and all other templates */
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
    /** Any page — product, collection, blog, homepage, etc. */
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
    /** Any page — same placement freedom as Standard */
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
 * @param {string} planId
 * @param {string} pageType - Shopify request.page_type (e.g. index, product, collection, blog, article)
 * @param {{ unknown?: "allow" | "deny" }} [options] - when pageType is missing
 * @returns {{ allowed: boolean, reason: string | null }}
 */
export function canPlaceOnPageType(planId, pageType, options = {}) {
  const plan = getPlan(planId)
  const type = normalizePageType(pageType)
  const unknown = options.unknown === "deny" ? "deny" : "allow"

  // Standard / Pro — any page (product, collection, blog, homepage, …)
  if (plan.placementAnyPage || plan.allowedPageTypes == null) {
    return { allowed: true, reason: null }
  }

  // Free — homepage only
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

export function normalizeHandle(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
}

/**
 * Map a Shopify subscription name/handle to our plan id.
 * Prefers higher tiers when multiple could match.
 */
export function mapShopifyHandleToPlanId(handleOrName) {
  const normalized = normalizeHandle(handleOrName)
  if (!normalized) return null

  for (const id of ["pro", "standard", "free"]) {
    const plan = PLANS[id]
    if (plan.shopifyHandles.some((h) => normalizeHandle(h) === normalized)) {
      return id
    }
    if (normalized.includes(id)) return id
  }
  return null
}

export function isPresetAllowed(planId, sliderType) {
  const plan = getPlan(planId)
  if (plan.allowedPresets == null) return true
  const resolved = resolveSliderType(sliderType)
  return plan.allowedPresets.includes(resolved)
}

/** Lowest plan that unlocks a preset (for badges). */
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

export function publicPlanPayload(planId) {
  const plan = getPlan(planId)
  return {
    id: plan.id,
    name: plan.name,
    priceMonthly: plan.priceMonthly,
    maxSliders: plan.maxSliders,
    maxSlidesPerSlider: plan.maxSlidesPerSlider,
    allowedPresets: plan.allowedPresets,
    placementAnyPage: plan.placementAnyPage,
    allowedPageTypes: plan.allowedPageTypes,
    placementLabel: plan.placementLabel,
    placementAllowedSummary: plan.placementAllowedSummary,
    placementBlockedSummary: plan.placementBlockedSummary,
    supportLabel: plan.supportLabel,
    templatesLabel: plan.templatesLabel,
  }
}

export function planRank(planId) {
  return PLAN_IDS.indexOf(planId === "free" || PLAN_IDS.includes(planId) ? planId : "free")
}

export function isPlanAtLeast(planId, minimumPlanId) {
  return planRank(planId) >= planRank(minimumPlanId)
}
