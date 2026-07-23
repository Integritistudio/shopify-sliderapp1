/**
 * Curated slider presets — no near-duplicates.
 * Old values (multiple-items, lazy, spotlight, carousel-3d) still resolve via settingsFromPreset.
 */
export const SLIDER_TYPES = [
  {
    value: "hero-fullwidth",
    label: "Full Bleed Hero",
    description: "Edge-to-edge cinematic hero for campaign launches",
    color: "highlight",
    group: "Hero",
  },
  {
    value: "hero-boxed",
    label: "Boxed Hero",
    description: "Contained hero frame with soft padding and radius",
    color: "info",
    group: "Hero",
  },
  {
    value: "autoplay",
    label: "Auto Reel",
    description: "Three-up strip that advances on its own",
    color: "highlight",
    group: "Hero",
  },
  {
    value: "center",
    label: "Peek Carousel",
    description: "Hero in the middle with soft side peeks",
    color: "info",
    group: "Hero",
  },
  {
    value: "product-carousel",
    label: "Product Carousel",
    description: "Multi-card product strip synced from a collection",
    color: "success",
    group: "Product",
  },
  {
    value: "product-showcase",
    label: "Product Showcase",
    description: "Large featured product with soft side peeks",
    color: "highlight",
    group: "Product",
  },
  {
    value: "collection-rail",
    label: "Collection Rail",
    description: "Compact product cards from one Shopify collection",
    color: "info",
    group: "Product",
  },
  {
    value: "testimonials",
    label: "Testimonials",
    description: "Quote cards with avatar, author, and soft motion",
    color: "new",
    group: "Utility",
  },
  {
    value: "logo-grid",
    label: "Logo Grid",
    description: "Brand logo strip for partners and press",
    color: "info",
    group: "Utility",
  },
  {
    value: "stories",
    label: "Story Rings",
    description: "Instagram-style story circles with a focus frame",
    color: "attention",
    group: "Utility",
  },
  {
    value: "announcement",
    label: "Announcement Bar",
    description: "Slim rotating bar for promos and shipping notes",
    color: "warning",
    group: "Utility",
  },
  {
    value: "marquee",
    label: "Infinite Ribbon",
    description: "Seamless looping ticker of frames",
    color: "highlight",
    group: "Utility",
  },
]

export const DEFAULT_SLIDER_SETTINGS = {
  autoplay: false,
  autoplaySpeed: 3200,
  arrows: true,
  dots: true,
  infinite: true,
  slidesToShow: 1,
  slidesToScroll: 1,
  transition: "slide",
  speed: 650,
  height: 640,
  objectFit: "cover",
  borderRadius: 0,
  arrowColor: "#ffffff",
  arrowBg: "rgba(0,0,0,0.45)",
  dotColor: "#2c4a6e",
  ctaBackground: "#1a2f4a",
  ctaTextColor: "#ffffff",
  ctaBorderColor: "#ffffff",
  ctaHoverBackground: "#243d5c",
  ctaHoverTextColor: "#ffffff",
  ctaBorderWidth: 1,
  ctaBorderRadius: 50,
  ctaFontSize: 16,
  ctaPadding: 12,
  ctaIcon: "arrow",
  ctaIconColor: "#ffffff",
  ctaIconBg: "rgba(255,255,255,0.12)",
  ctaIconSize: 34,
  cta2Background: "transparent",
  cta2TextColor: "#ffffff",
  cta2BorderColor: "#ffffff",
  cta2HoverBackground: "rgba(255,255,255,0.14)",
  cta2HoverTextColor: "#ffffff",
  cta2Icon: "none",
  cta2IconColor: "#ffffff",
  cta2IconBg: "rgba(255,255,255,0.12)",
  atcBackground: "#ffffff",
  atcTextColor: "#170f49",
  atcBorderColor: "#170f49",
  atcHoverBackground: "#170f49",
  atcHoverTextColor: "#ffffff",
  atcBorderWidth: 1,
  atcBorderRadius: 50,
  atcFontSize: 16,
  atcPadding: 12,
  pauseOnHover: true,
  showBranding: false,
  overlayEnabled: false,
  overlayColor: "#000000",
  overlayOpacity: 0.35,
  effect: "fade",
  heroAnimation: "none",
  collectionId: null,
  collectionHandle: null,
  productLimit: 8,
  showPrice: true,
  showShopNow: true,
  showAddToCart: true,
  showSoldOut: true,
  addToCartText: "Add to cart",
  soldOutText: "Sold out",
  sectionHeading: "",
  sectionHeadingFontSize: 28,
  sectionHeadingGap: 16,
  productTitleFontSize: 16,
  productPriceFontSize: 14,
  productContentGap: 8,
  paginationGap: 16,
  // Hero copy + chrome (ignored by product/utility presets)
  headingFontSize: 42,
  subheadingFontSize: 12,
  descriptionFontSize: 16,
  headingColor: "#ffffff",
  subheadingColor: "#ffffff",
  descriptionColor: "#ffffff",
  copyGap: 10,
  paginationOffset: 16,
  dotsPosition: "center",
  contentPosition: "bottom-center",
  progressBar: false,
  progressBarColor: "#ffffff",
  mobile: {
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: true,
    dots: true,
    headingFontSize: 28,
    subheadingFontSize: 11,
    descriptionFontSize: 14,
    ctaFontSize: 14,
  },
}

export const PRODUCT_SLIDER_TYPES = ["product-carousel", "product-showcase", "collection-rail"]
export const HERO_SLIDER_TYPES = ["hero-fullwidth", "hero-boxed", "autoplay", "center"]
export const UTILITY_SLIDER_TYPES = ["testimonials", "logo-grid", "stories", "announcement", "marquee"]
export const SLIDER_TYPE_GROUPS = ["Hero", "Product", "Utility"]

/** Entrance / layout animations available on Hero presets only */
export const HERO_ANIMATION_OPTIONS = [
  { value: "none", label: "Default" },
  { value: "slide", label: "Clean Sweep" },
  { value: "slide-up", label: "Caption Rise" },
  { value: "wipe", label: "Diagonal Wipe" },
  { value: "blur-reveal", label: "Soft Focus" },
  { value: "split-panel", label: "Split Reveal" },
  { value: "parallax", label: "Depth Drift" },
]

export const HERO_CONTENT_POSITION_OPTIONS = [
  { value: "middle", label: "Center" },
  { value: "bottom-center", label: "Bottom" },
  { value: "bottom-left", label: "Bottom left" },
  { value: "bottom-right", label: "Bottom right" },
]

const HERO_CONTENT_POSITIONS = HERO_CONTENT_POSITION_OPTIONS.map((option) => option.value)

/** Resolve one placement for heading + subheading + description + CTA together */
export function resolveContentPlacement(slide = {}, settings = {}) {
  if (HERO_CONTENT_POSITIONS.includes(slide.contentPosition)) return slide.contentPosition
  if (HERO_CONTENT_POSITIONS.includes(slide.textAlign)) return slide.textAlign
  if (slide.textAlign === "left") return "bottom-left"
  if (slide.textAlign === "right") return "bottom-right"
  if (HERO_CONTENT_POSITIONS.includes(settings.contentPosition)) return settings.contentPosition
  return "bottom-center"
}

export function contentPlacementStyle(placement = "bottom-center") {
  const p = HERO_CONTENT_POSITIONS.includes(placement) ? placement : "bottom-center"
  return {
    placement: p,
    justifyContent: p === "middle" ? "center" : "flex-end",
    alignItems: p.includes("left") ? "flex-start" : p.includes("right") ? "flex-end" : "center",
    textAlign: p.includes("left") ? "left" : p.includes("right") ? "right" : "center",
  }
}

/** Map legacy / alias types onto the curated catalog */
const TYPE_ALIASES = {
  "multiple-items": "autoplay",
  lazy: "autoplay",
  spotlight: "center",
  "carousel-3d": "center",
}

export function resolveSliderType(sliderType = "fade") {
  return TYPE_ALIASES[sliderType] || sliderType
}

export function settingsFromPreset(sliderType = "fade") {
  const type = resolveSliderType(sliderType)
  const base = { ...DEFAULT_SLIDER_SETTINGS, mobile: { ...DEFAULT_SLIDER_SETTINGS.mobile } }

  switch (type) {
    case "hero-fullwidth":
      return {
        ...base,
        effect: "hero-fullwidth",
        transition: "fade",
        height: 720,
        borderRadius: 0,
        slidesToShow: 1,
        autoplay: true,
        autoplaySpeed: 4500,
        speed: 800,
        overlayOpacity: 0.42,
      }
    case "hero-boxed":
      return {
        ...base,
        effect: "hero-boxed",
        transition: "fade",
        height: 560,
        borderRadius: 20,
        slidesToShow: 1,
        autoplay: true,
        autoplaySpeed: 4200,
        speed: 750,
        overlayOpacity: 0.38,
      }
    case "hero-video":
      return {
        ...base,
        effect: "hero-video",
        transition: "fade",
        height: 680,
        borderRadius: 0,
        slidesToShow: 1,
        arrows: true,
        dots: true,
        autoplay: false,
        speed: 700,
        overlayOpacity: 0.45,
      }
    case "product-carousel":
      return {
        ...base,
        effect: "product-carousel",
        transition: "slide",
        height: 420,
        borderRadius: 14,
        slidesToShow: 4,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 3200,
        speed: 600,
        productLimit: 8,
        showPrice: true,
        sectionHeading: "Featured products",
        mobile: { slidesToShow: 1, slidesToScroll: 1, arrows: true, dots: true },
      }
    case "product-showcase":
      return {
        ...base,
        effect: "product-showcase",
        transition: "center",
        height: 480,
        borderRadius: 16,
        slidesToShow: 3,
        infinite: true,
        speed: 700,
        productLimit: 8,
        showPrice: true,
        sectionHeading: "Featured products",
        mobile: { slidesToShow: 1, slidesToScroll: 1, arrows: true, dots: true },
      }
    case "collection-rail":
      return {
        ...base,
        effect: "collection-rail",
        transition: "slide",
        height: 360,
        borderRadius: 12,
        slidesToShow: 5,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 2800,
        speed: 550,
        productLimit: 10,
        showPrice: true,
        sectionHeading: "Shop the collection",
        mobile: { slidesToShow: 1, slidesToScroll: 1, arrows: true, dots: false },
      }
    case "testimonials":
      return {
        ...base,
        effect: "testimonials",
        transition: "slide",
        height: 280,
        borderRadius: 16,
        width: 1100,
        slidesToShow: 3,
        slidesToScroll: 3,
        autoplay: true,
        autoplaySpeed: 5000,
        speed: 700,
        arrows: true,
        dots: true,
        arrowBg: "#ffffff",
        arrowColor: "#170f49",
        mobile: { slidesToShow: 1, slidesToScroll: 1, arrows: true, dots: true },
      }
    case "logo-grid":
      return {
        ...base,
        effect: "logo-grid",
        transition: "slide",
        height: 140,
        borderRadius: 0,
        slidesToShow: 5,
        autoplay: true,
        autoplaySpeed: 0,
        speed: 9000,
        arrows: false,
        dots: false,
        infinite: true,
        mobile: { slidesToShow: 3, slidesToScroll: 1, arrows: false, dots: false },
      }
    case "stories":
      return {
        ...base,
        effect: "stories",
        transition: "fade",
        height: 520,
        borderRadius: 18,
        slidesToShow: 1,
        autoplay: false,
        speed: 650,
        arrows: true,
        dots: false,
      }
    case "announcement":
      return {
        ...base,
        effect: "announcement",
        transition: "fade",
        height: 48,
        borderRadius: 0,
        slidesToShow: 1,
        autoplay: true,
        autoplaySpeed: 4000,
        speed: 500,
        arrows: false,
        dots: false,
      }
    case "slide":
      return { ...base, transition: "slide", effect: "slide", slidesToShow: 1, speed: 550 }
    case "center":
      return {
        ...base,
        transition: "center",
        effect: "center",
        slidesToShow: 3,
        infinite: true,
        dots: true,
        speed: 700,
      }
    case "fade":
      return { ...base, transition: "fade", effect: "fade", slidesToShow: 1, speed: 750 }
    case "autoplay":
      return {
        ...base,
        autoplay: true,
        autoplaySpeed: 2800,
        slidesToShow: 3,
        effect: "autoplay",
        pauseOnHover: true,
        speed: 600,
      }
    case "variable-width":
      return { ...base, variableWidth: true, slidesToShow: 1, effect: "variable-width", speed: 600 }
    case "vertical":
      return { ...base, transition: "vertical", vertical: true, effect: "vertical", slidesToShow: 1, speed: 700 }
    case "thumbnails":
      return { ...base, transition: "fade", thumbnails: true, effect: "thumbnails", slidesToShow: 1, speed: 650 }
    case "coverflow":
      return { ...base, transition: "center", effect: "coverflow", slidesToShow: 3, speed: 750, infinite: true }
    case "cube":
      return { ...base, transition: "fade", effect: "cube", slidesToShow: 1, speed: 850 }
    case "flip":
      return { ...base, transition: "fade", effect: "flip", slidesToShow: 1, speed: 800 }
    case "zoom":
      return { ...base, transition: "fade", effect: "zoom", slidesToShow: 1, speed: 700 }
    case "ken-burns":
      return {
        ...base,
        transition: "fade",
        effect: "ken-burns",
        slidesToShow: 1,
        autoplay: true,
        autoplaySpeed: 4800,
        speed: 950,
      }
    case "parallax":
      return { ...base, transition: "slide", effect: "parallax", slidesToShow: 1, speed: 850 }
    case "cards-stack":
      return { ...base, transition: "fade", effect: "cards-stack", slidesToShow: 1, speed: 750 }
    case "slide-up":
      return { ...base, transition: "fade", effect: "slide-up", slidesToShow: 1, speed: 750 }
    case "marquee":
      return {
        ...base,
        autoplay: true,
        autoplaySpeed: 0,
        effect: "marquee",
        slidesToShow: 3,
        arrows: false,
        dots: false,
        infinite: true,
        speed: 10000,
      }
    case "wipe":
      return { ...base, transition: "fade", effect: "wipe", slidesToShow: 1, speed: 800 }
    case "blur-reveal":
      return { ...base, transition: "fade", effect: "blur-reveal", slidesToShow: 1, speed: 850 }
    case "split-panel":
      return { ...base, transition: "fade", effect: "split-panel", slidesToShow: 1, speed: 900 }
    default:
      return { ...base, effect: type }
  }
}

export function mergeSliderSettings(sliderType, settings = {}) {
  const preset = settingsFromPreset(sliderType)
  const merged = {
    ...preset,
    ...settings,
    mobile: {
      ...DEFAULT_SLIDER_SETTINGS.mobile,
      ...preset.mobile,
      ...(settings?.mobile || {}),
    },
  }
  // Keep product button sizing equal (Shop now + Add to cart)
  const sharedPad = Number(merged.ctaPadding ?? merged.atcPadding ?? 12)
  const sharedFont = Number(merged.ctaFontSize ?? merged.atcFontSize ?? 16)
  const sharedRadius = Number(merged.ctaBorderRadius ?? merged.atcBorderRadius ?? 50)
  merged.ctaPadding = sharedPad
  merged.atcPadding = sharedPad
  merged.ctaFontSize = sharedFont
  merged.atcFontSize = sharedFont
  merged.ctaBorderRadius = sharedRadius
  merged.atcBorderRadius = sharedRadius

  // Layout-style hero animations
  if (merged.heroAnimation === "thumbnails") {
    merged.thumbnails = true
  } else if (merged.heroAnimation && merged.heroAnimation !== "none") {
    merged.thumbnails = false
  }

  return merged
}

export function getSliderTypeInfo(type) {
  const resolved = resolveSliderType(type)
  return (
    SLIDER_TYPES.find((item) => item.value === resolved) || {
      value: type,
      label: type || "Unknown",
      color: "critical",
      description: "",
      group: "Other",
    }
  )
}

export function buildSlickConfig(settings, { thumbnailSelector } = {}) {
  const merged = mergeSliderSettings(settings?.effect || settings?.transition || "fade", settings)
  const prefersReducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches

  const effect = resolveSliderType(merged.effect || merged.transition || "fade")

  const config = {
    arrows: false,
    dots: Boolean(merged.dots),
    infinite: Boolean(merged.infinite),
    speed: prefersReducedMotion ? 0 : Number(merged.speed) || 650,
    slidesToShow: Number(merged.slidesToShow) || 1,
    slidesToScroll: Number(merged.slidesToScroll) || 1,
    autoplay: prefersReducedMotion ? false : Boolean(merged.autoplay),
    autoplaySpeed: Number(merged.autoplaySpeed) || 3200,
    pauseOnHover: merged.pauseOnHover !== false,
    pauseOnFocus: true,
    accessibility: true,
    adaptiveHeight: false,
    cssEase: "cubic-bezier(0.22, 1, 0.36, 1)",
    responsive: [
      {
        breakpoint: 768,
        settings: {
          slidesToShow: Number(merged.mobile?.slidesToShow) || 1,
          slidesToScroll: Number(merged.mobile?.slidesToScroll) || 1,
          dots: merged.mobile?.dots !== false && merged.dots !== false,
          centerMode: false,
          vertical: false,
        },
      },
    ],
  }

  if (merged.lazyLoad) config.lazyLoad = "ondemand"
  if (merged.variableWidth) config.variableWidth = true
  if (merged.vertical || effect === "vertical") config.vertical = true

  if (
    [
      "fade",
      "thumbnails",
      "cube",
      "flip",
      "zoom",
      "ken-burns",
      "cards-stack",
      "slide-up",
      "wipe",
      "blur-reveal",
      "split-panel",
      "hero-fullwidth",
      "hero-boxed",
      "hero-video",
      "stories",
      "announcement",
    ].includes(effect)
  ) {
    config.fade = true
    config.slidesToShow = 1
    config.slidesToScroll = 1
  }

  if (effect === "testimonials") {
    const show = Math.min(Math.max(Number(merged.slidesToShow) || 3, 1), 3)
    config.fade = false
    config.slidesToShow = show
    config.slidesToScroll = show
  }

  if (["center", "coverflow", "product-showcase"].includes(effect) || merged.transition === "center") {
    config.centerMode = true
    config.centerPadding = effect === "coverflow" ? "10%" : effect === "product-showcase" ? "12%" : "14%"
    config.slidesToShow = Math.max(Number(merged.slidesToShow) || 3, 1)
  }

  if (["product-carousel", "collection-rail"].includes(effect)) {
    config.slidesToShow = Math.max(Number(merged.slidesToShow) || (effect === "collection-rail" ? 5 : 4), 1)
    config.slidesToScroll = 1
  }

  if (effect === "marquee" || effect === "logo-grid") {
    config.autoplay = !prefersReducedMotion
    config.autoplaySpeed = 0
    config.cssEase = "linear"
    config.speed = Number(merged.speed) || 9000
    config.arrows = false
    config.dots = false
    config.waitForAnimate = false
  }

  if (merged.thumbnails && thumbnailSelector) {
    config.asNavFor = thumbnailSelector
  }

  return config
}

export const SAMPLE_SLIDES = [
  {
    id: "sample-1",
    imageUrl: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1400&q=80",
    title: "Summer Collection",
    heading: "Summer Collection",
    subheading: "Fresh styles for the season",
    description: "Discover new arrivals designed for everyday comfort.",
    ctaText: "Shop now",
    ctaUrl: "#",
    textAlign: "center",
    textColor: "#ffffff",
    buttonBg: "#1a2f4a",
    buttonTextColor: "#ffffff",
    overlayColor: "#0f172a",
    overlayOpacity: 0.4,
    imageAlt: "Sample summer collection",
    isVisible: true,
  },
  {
    id: "sample-2",
    imageUrl: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1400&q=80",
    title: "Featured Products",
    heading: "Featured Products",
    subheading: "Merchant favorites",
    description: "Highlight best sellers with a clear call to action.",
    ctaText: "View products",
    ctaUrl: "#",
    textAlign: "left",
    textColor: "#ffffff",
    buttonBg: "#111111",
    buttonTextColor: "#ffffff",
    overlayColor: "#111111",
    overlayOpacity: 0.45,
    imageAlt: "Sample featured products",
    isVisible: true,
  },
  {
    id: "sample-3",
    imageUrl: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=1400&q=80",
    title: "Limited Offer",
    heading: "Limited Offer",
    subheading: "This week only",
    description: "Promote campaigns with custom colors and overlays.",
    ctaText: "Learn more",
    ctaUrl: "#",
    textAlign: "center",
    textColor: "#ffffff",
    buttonBg: "#9f2d2d",
    buttonTextColor: "#ffffff",
    overlayColor: "#000000",
    overlayOpacity: 0.35,
    imageAlt: "Sample limited offer",
    isVisible: true,
  },
  {
    id: "sample-4",
    imageUrl: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1400&q=80",
    title: "Lookbook",
    heading: "Editorial Edit",
    subheading: "Styled for impact",
    description: "Tell a visual story across multiple frames.",
    ctaText: "Explore",
    ctaUrl: "#",
    textAlign: "center",
    textColor: "#ffffff",
    buttonBg: "#2c4a6e",
    buttonTextColor: "#ffffff",
    overlayColor: "#121826",
    overlayOpacity: 0.38,
    imageAlt: "Sample lookbook",
    isVisible: true,
  },
]

export const SAMPLE_SLIDES_BY_TYPE = {
  "hero-fullwidth": SAMPLE_SLIDES,
  "hero-boxed": SAMPLE_SLIDES,
  "hero-video": [
    {
      ...SAMPLE_SLIDES[0],
      id: "sample-video-1",
      mediaType: "video",
      videoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
      heading: "Move with the season",
      subheading: "Video campaign",
      description: "Full-bleed motion with a clear call to action.",
    },
    { ...SAMPLE_SLIDES[1], id: "sample-video-2", mediaType: "video", videoUrl: "" },
  ],
  "product-carousel": [
    {
      id: "p1",
      imageUrl: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80",
      title: "Chrono Watch",
      heading: "Chrono Watch",
      description: "$189.00",
      ctaText: "Shop now",
      ctaUrl: "#",
      isVisible: true,
    },
    {
      id: "p2",
      imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80",
      title: "Studio Headphones",
      heading: "Studio Headphones",
      description: "$129.00",
      ctaText: "Shop now",
      ctaUrl: "#",
      isVisible: true,
    },
    {
      id: "p3",
      imageUrl: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800&q=80",
      title: "Ace Sunglasses",
      heading: "Ace Sunglasses",
      description: "$79.00",
      ctaText: "Shop now",
      ctaUrl: "#",
      isVisible: true,
    },
    {
      id: "p4",
      imageUrl: "https://images.unsplash.com/photo-1560343090-f0409e92791a?w=800&q=80",
      title: "City Sneaker",
      heading: "City Sneaker",
      description: "$98.00",
      ctaText: "Shop now",
      ctaUrl: "#",
      isVisible: true,
    },
  ],
  "product-showcase": null,
  "collection-rail": null,
  testimonials: [
    {
      id: "t1",
      imageUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80",
      heading: "Absolutely love the quality — shipping was fast and packaging felt premium.",
      subheading: "Maya Chen",
      description: "Verified buyer",
      textAlign: "center",
      textColor: "#170f49",
      isVisible: true,
    },
    {
      id: "t2",
      imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80",
      heading: "Our go-to brand for gifts. Every order gets compliments.",
      subheading: "Jordan Lee",
      description: "Repeat customer",
      textAlign: "center",
      textColor: "#170f49",
      isVisible: true,
    },
    {
      id: "t3",
      imageUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&q=80",
      heading: "Support was wonderful and the product exceeded every expectation.",
      subheading: "Priya Shah",
      description: "New customer",
      textAlign: "center",
      textColor: "#170f49",
      isVisible: true,
    },
  ],
  "logo-grid": [
    {
      id: "l1",
      imageUrl: "https://images.unsplash.com/photo-1611162617474-5b21e919e113?w=400&q=80",
      heading: "Northwind",
      title: "Northwind",
      isVisible: true,
    },
    {
      id: "l2",
      imageUrl: "https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=400&q=80",
      heading: "Harbor",
      title: "Harbor",
      isVisible: true,
    },
    {
      id: "l3",
      imageUrl: "https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=400&q=80",
      heading: "Atlas",
      title: "Atlas",
      isVisible: true,
    },
    {
      id: "l4",
      imageUrl: "https://images.unsplash.com/photo-1611162618071-b39a2ec055fb?w=400&q=80",
      heading: "Summit",
      title: "Summit",
      isVisible: true,
    },
  ],
  stories: [
    {
      id: "s1",
      imageUrl: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=80",
      heading: "New drop",
      title: "New drop",
      isVisible: true,
    },
    {
      id: "s2",
      imageUrl: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=800&q=80",
      heading: "Behind scenes",
      title: "Behind scenes",
      isVisible: true,
    },
    {
      id: "s3",
      imageUrl: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&q=80",
      heading: "Sale",
      title: "Sale",
      isVisible: true,
    },
  ],
  announcement: [
    {
      id: "a1",
      heading: "Free shipping on orders over $75 — this week only",
      ctaText: "Shop",
      ctaUrl: "#",
      textColor: "#ffffff",
      isVisible: true,
    },
    {
      id: "a2",
      heading: "New arrivals just landed — explore the edit",
      ctaText: "Explore",
      ctaUrl: "#",
      textColor: "#ffffff",
      isVisible: true,
    },
  ],
}

SAMPLE_SLIDES_BY_TYPE["product-showcase"] = SAMPLE_SLIDES_BY_TYPE["product-carousel"]
SAMPLE_SLIDES_BY_TYPE["collection-rail"] = SAMPLE_SLIDES_BY_TYPE["product-carousel"]

export function getSampleSlidesForType(sliderType) {
  const resolved = resolveSliderType(sliderType)
  return SAMPLE_SLIDES_BY_TYPE[resolved] || SAMPLE_SLIDES
}

