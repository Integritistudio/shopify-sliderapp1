/**
 * Plan enforcement helpers for API routes.
 */
import { Slider, Slide } from "../models/index.js"
import { resolveShopPlan } from "./resolveShopPlan.js"
import {
  canCreateSlider,
  canAddSlide,
  effectiveMaxSlides,
  buildManagedPricingUrl,
  getPlan,
  isPresetAllowed,
  requiredPlanForPreset,
} from "./plans.js"

function deny(res, result, shop) {
  const pricingUrl = buildManagedPricingUrl(shop)
  return res.status(403).json({
    error: result.message,
    code: result.code,
    requiredPlan: result.requiredPlan || null,
    pricingUrl,
    limit: result.limit,
  })
}

export async function assertCanCreateSlider(req, res, { sliderType, initialSlideCount = 0 }) {
  const session = res.locals.shopify?.session
  const shop = req.shop
  const { planId } = await resolveShopPlan(session)

  const currentCount = await Slider.count({ where: { shop } })
  const createCheck = canCreateSlider({ planId, currentCount, sliderType })
  if (!createCheck.ok) {
    deny(res, createCheck, shop)
    return { planId, denied: true }
  }

  const max = effectiveMaxSlides(planId)
  if (initialSlideCount > max) {
    deny(
      res,
      {
        ok: false,
        code: "PLAN_SLIDE_LIMIT",
        message: `Your ${getPlan(planId).name} plan allows up to ${max} slides per slider.`,
        requiredPlan: planId === "free" ? "standard" : "pro",
        limit: max,
      },
      shop,
    )
    return { planId, denied: true }
  }

  return { planId, denied: false }
}

export async function assertCanAddSlide(req, res, sliderId) {
  const session = res.locals.shopify?.session
  const shop = req.shop
  const { planId } = await resolveShopPlan(session)

  const slideCount = await Slide.count({
    where: { SliderId: Number.parseInt(sliderId, 10) },
  })
  const check = canAddSlide({ planId, currentSlideCount: slideCount })
  if (!check.ok) {
    deny(res, check, shop)
    return { planId, denied: true, slideCount }
  }
  return { planId, denied: false, slideCount }
}

export async function assertCanChangeSliderType(req, res, { nextType, currentType }) {
  if (nextType === undefined || nextType === currentType) {
    return { denied: false }
  }
  const session = res.locals.shopify?.session
  const shop = req.shop
  const { planId } = await resolveShopPlan(session)

  if (!isPresetAllowed(planId, nextType)) {
    const required = requiredPlanForPreset(nextType)
    deny(
      res,
      {
        ok: false,
        code: "PLAN_PRESET_LOCKED",
        message: `${getPlan(required).name} plan is required for this preset.`,
        requiredPlan: required,
      },
      shop,
    )
    return { planId, denied: true }
  }
  return { planId, denied: false }
}

export async function getPlanMaxSlidesForShop(session) {
  const { planId } = await resolveShopPlan(session)
  return { planId, maxSlides: effectiveMaxSlides(planId) }
}
