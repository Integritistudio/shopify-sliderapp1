export const SLIDER_TYPES = [
  { value: "fade", label: "Soft Crossfade", description: "Gentle dissolve from one frame to the next" },
  { value: "slide", label: "Clean Sweep", description: "Crisp horizontal slide with smooth easing" },
  { value: "autoplay", label: "Auto Reel", description: "Three-up strip that advances on its own" },
  { value: "center", label: "Peek Carousel", description: "Hero in the middle with soft side peeks" },
  { value: "variable-width", label: "Magazine Strip", description: "Editorial mix of wide and narrow frames" },
  { value: "vertical", label: "Vertical Scroll", description: "Frames move upward like a story feed" },
  { value: "thumbnails", label: "Gallery Thumbs", description: "Main stage with a clickable thumbnail rail" },
  { value: "coverflow", label: "Coverflow", description: "Tilted 3D shelves with depth perspective" },
  { value: "cube", label: "Cube Turn", description: "Faces rotate like a turning cube" },
  { value: "flip", label: "Mirror Flip", description: "Card flips on the Y axis into place" },
  { value: "zoom", label: "Instant Zoom", description: "Punch-in entrance with a soft settle" },
  { value: "ken-burns", label: "Cinema Zoom", description: "Slow living zoom across the image" },
  { value: "parallax", label: "Depth Drift", description: "Background shifts slower than the frame" },
  { value: "cards-stack", label: "Deck Stack", description: "Cards peel forward from a stacked deck" },
  { value: "slide-up", label: "Caption Rise", description: "Text and CTA rise in after the image" },
  { value: "marquee", label: "Infinite Ribbon", description: "Seamless looping ticker of frames" },
  { value: "wipe", label: "Diagonal Wipe", description: "Angled reveal that sweeps across the frame" },
  { value: "blur-reveal", label: "Soft Focus", description: "Blurry frame snaps into crisp focus" },
  { value: "split-panel", label: "Split Reveal", description: "Two halves slide apart to unveil the slide" },
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
  ctaBorderWidth: 1,
  ctaBorderRadius: 50,
  ctaFontSize: 16,
  ctaIcon: "arrow",
  ctaIconColor: "#ffffff",
  pauseOnHover: true,
  showBranding: false,
  overlayEnabled: false,
  overlayColor: "#000000",
  overlayOpacity: 0.35,
  effect: "fade",
  mobile: {
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: true,
    dots: true,
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
  return {
    ...preset,
    ...settings,
    mobile: {
      ...preset.mobile,
      ...(settings.mobile || {}),
    },
  }
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
  textAlign: "center",
  overlayColor: "#000000",
  overlayOpacity: 0.3,
  textColor: "#ffffff",
  buttonBg: "#1a2f4a",
  buttonTextColor: "#ffffff",
  imageAlt: "",
  shopifyFileId: null,
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
  "textAlign",
  "overlayColor",
  "overlayOpacity",
  "textColor",
  "buttonBg",
  "buttonTextColor",
  "imageAlt",
  "shopifyFileId",
  "mediaType",
  "videoUrl",
  "videoProvider",
  "position",
  "isVisible",
  "createdAt",
  "updatedAt",
]
