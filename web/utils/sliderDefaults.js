export const SLIDER_TYPES = [
  { value: "hero-fullwidth", label: "Full Bleed Hero", description: "Edge-to-edge cinematic hero for campaign launches", group: "Hero" },
  { value: "hero-boxed", label: "Boxed Hero", description: "Contained hero frame with soft padding and radius", group: "Hero" },
  { value: "hero-video", label: "Video Hero", description: "Full-bleed video background with overlay copy and CTA", group: "Hero" },
  { value: "slide", label: "Clean Sweep", description: "Crisp horizontal slide with smooth easing", group: "Hero" },
  { value: "autoplay", label: "Auto Reel", description: "Three-up strip that advances on its own", group: "Hero" },
  { value: "center", label: "Peek Carousel", description: "Hero in the middle with soft side peeks", group: "Hero" },
  { value: "thumbnails", label: "Gallery Thumbs", description: "Main stage with a clickable thumbnail rail", group: "Hero" },
  { value: "product-carousel", label: "Product Carousel", description: "Multi-card product strip synced from a collection", group: "Product" },
  { value: "product-showcase", label: "Product Showcase", description: "Large featured product with soft side peeks", group: "Product" },
  { value: "collection-rail", label: "Collection Rail", description: "Compact product cards from one Shopify collection", group: "Product" },
  { value: "testimonials", label: "Testimonials", description: "Quote cards with avatar, author, and soft motion", group: "Utility" },
  { value: "logo-grid", label: "Logo Grid", description: "Brand logo strip for partners and press", group: "Utility" },
  { value: "stories", label: "Story Rings", description: "Instagram-style story circles with a focus frame", group: "Utility" },
  { value: "announcement", label: "Announcement Bar", description: "Slim rotating bar for promos and shipping notes", group: "Utility" },
  { value: "marquee", label: "Infinite Ribbon", description: "Seamless looping ticker of frames", group: "Utility" },
  { value: "coverflow", label: "Coverflow", description: "Tilted 3D shelves with depth perspective", group: "Motion" },
  { value: "cube", label: "Cube Turn", description: "Faces rotate like a turning cube", group: "Motion" },
  { value: "flip", label: "Mirror Flip", description: "Card flips on the Y axis into place", group: "Motion" },
  { value: "zoom", label: "Instant Zoom", description: "Punch-in entrance with a soft settle", group: "Motion" },
  { value: "ken-burns", label: "Cinema Zoom", description: "Slow living zoom across the image", group: "Motion" },
  { value: "parallax", label: "Depth Drift", description: "Background shifts slower than the frame", group: "Motion" },
  { value: "cards-stack", label: "Deck Stack", description: "Cards peel forward from a stacked deck", group: "Motion" },
]

export const PRODUCT_SLIDER_TYPES = ["product-carousel", "product-showcase", "collection-rail"]

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
      return { ...base, transition: "center", effect: "center", slidesToShow: 3, infinite: true, dots: true, speed: 700 }
    case "fade":
      return { ...base, transition: "fade", effect: "fade", slidesToShow: 1, speed: 750 }
    case "autoplay":
      return { ...base, autoplay: true, autoplaySpeed: 2800, slidesToShow: 3, effect: "autoplay", pauseOnHover: true, speed: 600 }
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
      return { ...base, transition: "fade", effect: "ken-burns", slidesToShow: 1, autoplay: true, autoplaySpeed: 4800, speed: 950 }
    case "parallax":
      return { ...base, transition: "slide", effect: "parallax", slidesToShow: 1, speed: 850 }
    case "cards-stack":
      return { ...base, transition: "fade", effect: "cards-stack", slidesToShow: 1, speed: 750 }
    case "slide-up":
      return { ...base, transition: "fade", effect: "slide-up", slidesToShow: 1, speed: 750 }
    case "marquee":
      return { ...base, autoplay: true, autoplaySpeed: 0, effect: "marquee", slidesToShow: 3, arrows: false, dots: false, infinite: true, speed: 10000 }
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
      ...(settings.mobile || {}),
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
  return merged
}

export const SLIDE_SOFT_LIMIT = 20
export const SLIDE_HARD_LIMIT = 50

export const DEFAULT_SLIDE_FIELDS = {
  imageUrl: "",
  title: "",
  description: "",
  heading: "",
  subheading: "",
  ctaText: "",
  ctaUrl: "",
  ctaStyle: "primary",
  ctaResourceType: null,
  ctaResourceId: null,
  ctaOpenInNewTab: false,
  cta2Text: "",
  cta2Url: "",
  cta2OpenInNewTab: false,
  textAlign: "center",
  overlayColor: "#000000",
  overlayOpacity: 0.3,
  textColor: "#ffffff",
  buttonBg: "#1a2f4a",
  buttonTextColor: "#ffffff",
  imageAlt: "",
  shopifyFileId: null,
  variantId: null,
  availableForSale: true,
  mediaType: "image",
  videoUrl: "",
  videoProvider: null,
  position: 0,
  isVisible: true,
}

export const SLIDE_ATTRIBUTES = [
  "id",
  "imageUrl",
  "title",
  "description",
  "heading",
  "subheading",
  "ctaText",
  "ctaUrl",
  "ctaStyle",
  "ctaResourceType",
  "ctaResourceId",
  "ctaOpenInNewTab",
  "cta2Text",
  "cta2Url",
  "cta2OpenInNewTab",
  "textAlign",
  "overlayColor",
  "overlayOpacity",
  "textColor",
  "buttonBg",
  "buttonTextColor",
  "imageAlt",
  "shopifyFileId",
  "variantId",
  "availableForSale",
  "mediaType",
  "videoUrl",
  "videoProvider",
  "position",
  "isVisible",
  "createdAt",
  "updatedAt",
]
