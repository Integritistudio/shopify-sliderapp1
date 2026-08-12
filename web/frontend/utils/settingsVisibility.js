/**
 * Per-slider-type admin settings visibility.
 * Source of truth: keys that affect storefront rendering (slider-cdn.js)
 * plus admin-only product sync fields. Hidden fields keep their stored values.
 */
import { HERO_SLIDER_TYPES, PRODUCT_SLIDER_TYPES, resolveSliderType } from "./sliderConfig"

/** @typedef {typeof CAPABILITY_DEFAULTS} SettingsCapabilities */

const CAPABILITY_DEFAULTS = {
  autoplay: false,
  arrows: false,
  dots: false,
  infinite: false,
  autoplaySpeed: false,
  arrowColor: false,
  dotColor: false,
  height: false,
  borderRadius: false,
  width: false,
  objectFit: false,
  slidesToShow: false,
  logoSize: false,
  heroAnimation: false,
  heroText: false,
  heroPaginationChrome: false,
  productSource: false,
  collectionSource: false,
  productTypography: false,
  shopNowButton: false,
  atcButton: false,
  ctaPrimary: false,
  ctaIcons: false,
  ctaSecondary: false,
  ctaSizing: false,
  ctaBackgroundOnly: false,
  mobileSlides: false,
  mobileHeroText: false,
  mobileCtaFont: false,
  slideCtaFields: false,
}

function caps(overrides) {
  return { ...CAPABILITY_DEFAULTS, ...overrides }
}

/** Hero presets — full chrome + dual CTAs */
const HERO_CAPABILITIES = caps({
  autoplay: true,
  arrows: true,
  dots: true,
  infinite: true,
  autoplaySpeed: true,
  arrowColor: true,
  dotColor: true,
  height: true,
  borderRadius: true,
  objectFit: true,
  slidesToShow: true,
  heroAnimation: true,
  heroText: true,
  heroPaginationChrome: true,
  ctaPrimary: true,
  ctaIcons: true,
  ctaSecondary: true,
  ctaSizing: true,
  mobileSlides: true,
  mobileHeroText: true,
  mobileCtaFont: true,
  slideCtaFields: true,
})

/** Product strip — sync + typography + shop/ATC; layout height/radius/fit unused on CDN */
const PRODUCT_CAPABILITIES = caps({
  autoplay: true,
  arrows: true,
  dots: true,
  infinite: true,
  autoplaySpeed: true,
  arrowColor: true,
  dotColor: true,
  slidesToShow: true,
  productSource: true,
  productTypography: true,
  shopNowButton: true,
  atcButton: true,
  ctaSizing: true,
  mobileSlides: true,
  mobileCtaFont: true,
  slideCtaFields: true,
})

/** Premium coverflow — product data + its own nav/chrome (not Slick arrows/dots) */
const PREMIUM_COVERFLOW_CAPABILITIES = caps({
  autoplay: true,
  autoplaySpeed: true,
  infinite: true,
  productSource: true,
  shopNowButton: true,
  atcButton: true,
  slideCtaFields: true,
})

/** Collection carousel — multi-collection sync + own 3D chrome (separate from product 3D) */
const COLLECTION_CAROUSEL_CAPABILITIES = caps({
  autoplay: true,
  autoplaySpeed: true,
  arrows: true,
  dots: true,
  infinite: true,
  collectionSource: true,
  slideCtaFields: true,
})

/** Legacy / motion effects — same editable surface as heroes */
const LEGACY_CAPABILITIES = HERO_CAPABILITIES

const TYPE_CAPABILITIES = {
  "hero-fullwidth": HERO_CAPABILITIES,
  "hero-boxed": HERO_CAPABILITIES,
  autoplay: HERO_CAPABILITIES,
  center: HERO_CAPABILITIES,

  "product-carousel": PRODUCT_CAPABILITIES,
  "product-showcase": PRODUCT_CAPABILITIES,
  "collection-rail": PRODUCT_CAPABILITIES,
  "premium-coverflow": PREMIUM_COVERFLOW_CAPABILITIES,
  "premium-circular": PREMIUM_COVERFLOW_CAPABILITIES,
  "collection-carousel": COLLECTION_CAROUSEL_CAPABILITIES,

  testimonials: caps({
    autoplay: true,
    arrows: true,
    dots: true,
    infinite: true,
    autoplaySpeed: true,
    arrowColor: true,
    dotColor: true,
    height: true,
    borderRadius: true,
    width: true,
    slidesToShow: true,
    mobileSlides: true,
  }),

  "logo-grid": caps({
    height: true,
    slidesToShow: true,
    mobileSlides: true,
    logoSize: true,
  }),

  stories: caps({
    autoplay: true,
    arrows: true,
    infinite: true,
    autoplaySpeed: true,
    arrowColor: true,
    height: true,
    borderRadius: true,
    objectFit: true,
  }),

  announcement: caps({
    autoplay: true,
    arrows: true,
    infinite: true,
    autoplaySpeed: true,
    arrowColor: true,
    height: true,
    ctaBackgroundOnly: true,
    slideCtaFields: true,
  }),

  marquee: caps({
    infinite: true,
    height: true,
    borderRadius: true,
    objectFit: true,
    slidesToShow: true,
    heroText: true,
    ctaPrimary: true,
    ctaIcons: true,
    ctaSecondary: true,
    ctaSizing: true,
    mobileSlides: true,
    mobileHeroText: true,
    mobileCtaFont: true,
    slideCtaFields: true,
  }),
}

/**
 * @param {string} [sliderType]
 * @returns {SettingsCapabilities}
 */
export function getSettingsCapabilities(sliderType = "fade") {
  const type = resolveSliderType(sliderType)

  if (TYPE_CAPABILITIES[type]) {
    return TYPE_CAPABILITIES[type]
  }

  if (HERO_SLIDER_TYPES.includes(type)) {
    return HERO_CAPABILITIES
  }

  if (PRODUCT_SLIDER_TYPES.includes(type)) {
    return PRODUCT_CAPABILITIES
  }

  // Legacy effects (coverflow, fade, cube, …) keep a full hero-like editor
  return LEGACY_CAPABILITIES
}

/**
 * @param {string} sliderType
 * @param {keyof SettingsCapabilities} capability
 * @returns {boolean}
 */
export function canShow(sliderType, capability) {
  return Boolean(getSettingsCapabilities(sliderType)[capability])
}
