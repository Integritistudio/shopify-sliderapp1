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
    value: "hero-video",
    label: "Video Hero",
    description: "Full-bleed video background with overlay copy and CTA",
    color: "attention",
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
    value: "fade",
    label: "Soft Crossfade",
    description: "Gentle dissolve from one frame to the next",
    color: "success",
    group: "Classic",
  },
  {
    value: "slide",
    label: "Clean Sweep",
    description: "Crisp horizontal slide with smooth easing",
    color: "info",
    group: "Classic",
  },
  {
    value: "autoplay",
    label: "Auto Reel",
    description: "Three-up strip that advances on its own",
    color: "highlight",
    group: "Classic",
  },
  {
    value: "center",
    label: "Peek Carousel",
    description: "Hero in the middle with soft side peeks",
    color: "info",
    group: "Classic",
  },
  {
    value: "variable-width",
    label: "Magazine Strip",
    description: "Editorial mix of wide and narrow frames",
    color: "new",
    group: "Layout",
  },
  {
    value: "vertical",
    label: "Vertical Scroll",
    description: "Frames move upward like a story feed",
    color: "info",
    group: "Layout",
  },
  {
    value: "thumbnails",
    label: "Gallery Thumbs",
    description: "Main stage with a clickable thumbnail rail",
    color: "info",
    group: "Layout",
  },
  {
    value: "coverflow",
    label: "Coverflow",
    description: "Tilted 3D shelves with depth perspective",
    color: "highlight",
    group: "Motion",
  },
  {
    value: "cube",
    label: "Cube Turn",
    description: "Faces rotate like a turning cube",
    color: "critical",
    group: "Motion",
  },
  {
    value: "flip",
    label: "Mirror Flip",
    description: "Card flips on the Y axis into place",
    color: "warning",
    group: "Motion",
  },
  {
    value: "zoom",
    label: "Instant Zoom",
    description: "Punch-in entrance with a soft settle",
    color: "success",
    group: "Motion",
  },
  {
    value: "ken-burns",
    label: "Cinema Zoom",
    description: "Slow living zoom across the image",
    color: "highlight",
    group: "Motion",
  },
  {
    value: "parallax",
    label: "Depth Drift",
    description: "Background shifts slower than the frame",
    color: "info",
    group: "Motion",
  },
  {
    value: "cards-stack",
    label: "Deck Stack",
    description: "Cards peel forward from a stacked deck",
    color: "attention",
    group: "Motion",
  },
  {
    value: "slide-up",
    label: "Caption Rise",
    description: "Text and CTA rise in after the image",
    color: "success",
    group: "Motion",
  },
  {
    value: "marquee",
    label: "Infinite Ribbon",
    description: "Seamless looping ticker of frames",
    color: "highlight",
    group: "Motion",
  },
  {
    value: "wipe",
    label: "Diagonal Wipe",
    description: "Angled reveal that sweeps across the frame",
    color: "attention",
    group: "Motion",
  },
  {
    value: "blur-reveal",
    label: "Soft Focus",
    description: "Blurry frame snaps into crisp focus",
    color: "new",
    group: "Motion",
  },
  {
    value: "split-panel",
    label: "Split Reveal",
    description: "Two halves slide apart to unveil the slide",
    color: "success",
    group: "Motion",
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
  atcBackground: "#ffffff",
  atcTextColor: "#170f49",
  atcBorderColor: "#170f49",
  atcHoverBackground: "#170f49",
  atcHoverTextColor: "#ffffff",
  atcBorderWidth: 1,
  atcBorderRadius: 50,
  atcFontSize: 14,
  atcPadding: 10,
  pauseOnHover: true,
  showBranding: false,
  overlayEnabled: false,
  overlayColor: "#000000",
  overlayOpacity: 0.35,
  effect: "fade",
  collectionId: null,
  collectionHandle: null,
  productLimit: 8,
  showPrice: true,
  showShopNow: true,
  showAddToCart: true,
  addToCartText: "Add to cart",
  sectionHeading: "",
  sectionHeadingFontSize: 28,
  sectionHeadingGap: 16,
  productTitleFontSize: 16,
  productPriceFontSize: 14,
  productContentGap: 8,
  paginationGap: 16,
  mobile: {
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: true,
    dots: true,
  },
}

export const PRODUCT_SLIDER_TYPES = ["product-carousel", "product-showcase", "collection-rail"]
export const HERO_SLIDER_TYPES = ["hero-fullwidth", "hero-boxed", "hero-video"]
export const UTILITY_SLIDER_TYPES = ["testimonials", "logo-grid", "stories", "announcement"]
export const SLIDER_TYPE_GROUPS = ["Hero", "Product", "Utility", "Classic", "Layout", "Motion"]

/** Map legacy / alias types onto the curated catalog */
const TYPE_ALIASES = {
  "multiple-items": "autoplay",
  lazy: "autoplay",
  spotlight: "center",
  "carousel-3d": "coverflow",
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
        transition: "fade",
        height: 320,
        borderRadius: 16,
        slidesToShow: 1,
        autoplay: true,
        autoplaySpeed: 5000,
        speed: 700,
        arrows: true,
        dots: true,
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
  return {
    ...preset,
    ...settings,
    mobile: {
      ...preset.mobile,
      ...(settings?.mobile || {}),
    },
  }
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
          dots: merged.mobile?.dots !== false,
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
      "testimonials",
      "stories",
      "announcement",
    ].includes(effect)
  ) {
    config.fade = true
    config.slidesToShow = 1
    config.slidesToScroll = 1
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

