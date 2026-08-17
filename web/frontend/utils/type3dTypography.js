export const TYPE3D_FONT_SOURCE_OPTIONS = [
  { value: "theme", label: "Inherit from theme" },
  { value: "slider", label: "Slider default" },
  { value: "custom", label: "Add your own font" },
]

export const TYPE3D_SLIDER_FONTS = {
  "premium-coverflow": {
    display: '"Cormorant Garamond", "Times New Roman", serif',
    body: '"Manrope", "Helvetica Neue", sans-serif',
  },
  "premium-circular": {
    display: '"Libre Baskerville", "Times New Roman", serif',
    body: '"Outfit", "Helvetica Neue", sans-serif',
  },
  "premium-stacked": {
    display: '"Fraunces", "Times New Roman", serif',
    body: '"Sora", "Helvetica Neue", sans-serif',
  },
  "collection-carousel": {
    display: '"Cormorant Garamond", "Times New Roman", serif',
    body: '"Manrope", "Helvetica Neue", sans-serif',
  },
  "testimonials-3d": {
    display: '"Source Serif 4", "Times New Roman", serif',
    body: '"Plus Jakarta Sans", "Helvetica Neue", sans-serif',
  },
  "ugc-feed": {
    display: '"Syne", "Helvetica Neue", sans-serif',
    body: '"Plus Jakarta Sans", "Helvetica Neue", sans-serif',
  },
  "logo-3d": {
    display: '"Instrument Sans", "Helvetica Neue", sans-serif',
    body: '"Instrument Sans", "Helvetica Neue", sans-serif',
  },
}

const SYSTEM_FONT = /^(arial|helvetica|helvetica neue|times|times new roman|georgia|verdana|system-ui|ui-sans-serif|inherit|serif|sans-serif|monospace|cursive|fantasy)$/i

export function sanitizeFontFamilyName(value) {
  return String(value || "")
    .trim()
    .replace(/^(font-family\s*:\s*)/i, "")
    .split(",")[0]
    .trim()
    .replace(/["';{}<>\\]/g, "")
    .slice(0, 80)
}

export function googleFontHref(name) {
  const safe = sanitizeFontFamilyName(name)
  if (!safe) return ""
  return `https://fonts.googleapis.com/css2?family=${encodeURIComponent(safe).replace(/%20/g, "+")}:wght@400;500;600;700&display=swap`
}

export function loadGoogleFontFamily(name) {
  if (typeof document === "undefined") return
  const safe = sanitizeFontFamilyName(name)
  if (!safe || SYSTEM_FONT.test(safe)) return
  const id = `se-type3d-font-${safe.toLowerCase().replace(/\s+/g, "-")}`
  if (document.getElementById(id)) return
  if (!document.getElementById("se-type3d-font-preconnect-g")) {
    const g = document.createElement("link")
    g.id = "se-type3d-font-preconnect-g"
    g.rel = "preconnect"
    g.href = "https://fonts.googleapis.com"
    document.head.appendChild(g)
    const s = document.createElement("link")
    s.id = "se-type3d-font-preconnect-s"
    s.rel = "preconnect"
    s.href = "https://fonts.gstatic.com"
    s.crossOrigin = "anonymous"
    document.head.appendChild(s)
  }
  const familyParam = encodeURIComponent(safe).replace(/%20/g, "+")
  const link = document.createElement("link")
  link.id = id
  link.rel = "stylesheet"
  link.href = `https://fonts.googleapis.com/css2?family=${familyParam}:wght@400;500;600;700&display=swap`
  link.onerror = () => {
    link.onerror = null
    link.href = `https://fonts.googleapis.com/css2?family=${familyParam}&display=swap`
  }
  document.head.appendChild(link)
}

export function ensureType3dCustomFonts(settings = {}) {
  if (settings.type3dHeadingFontSource === "custom") {
    loadGoogleFontFamily(settings.type3dHeadingFontCustom)
  }
  if (settings.type3dBodyFontSource === "custom") {
    loadGoogleFontFamily(settings.type3dBodyFontCustom)
  }
}

export function resolveHeroFontFamily(source, customName, role) {
  const src = String(source || "slider").toLowerCase()
  if (src === "theme") {
    return role === "heading"
      ? "var(--font-heading-family, inherit)"
      : "var(--font-body-family, inherit)"
  }
  if (src === "custom") {
    const name = sanitizeFontFamilyName(customName)
    if (!name) return ""
    return `'${name}', ${role === "heading" ? "serif" : "sans-serif"}`
  }
  return ""
}

export function ensureHeroCustomFonts(settings = {}) {
  if (settings.heroHeadingFontSource === "custom") {
    loadGoogleFontFamily(settings.heroHeadingFontCustom)
  }
  if (settings.heroSubheadingFontSource === "custom") {
    loadGoogleFontFamily(settings.heroSubheadingFontCustom)
  }
  if (settings.heroDescriptionFontSource === "custom") {
    loadGoogleFontFamily(settings.heroDescriptionFontCustom)
  }
  if (settings.heroCtaFontSource === "custom") {
    loadGoogleFontFamily(settings.heroCtaFontCustom)
  }
}

export function ensureProductCustomFonts(settings = {}) {
  if (settings.productSectionFontSource === "custom") {
    loadGoogleFontFamily(settings.productSectionFontCustom)
  }
  if (settings.productTitleFontSource === "custom") {
    loadGoogleFontFamily(settings.productTitleFontCustom)
  }
  if (settings.productPriceFontSource === "custom") {
    loadGoogleFontFamily(settings.productPriceFontCustom)
  }
  if (settings.productCtaFontSource === "custom") {
    loadGoogleFontFamily(settings.productCtaFontCustom)
  }
}

export function ensureUtilityCustomFonts(settings = {}) {
  if (settings.utilityHeadingFontSource === "custom") {
    loadGoogleFontFamily(settings.utilityHeadingFontCustom)
  }
  if (settings.utilitySubheadingFontSource === "custom") {
    loadGoogleFontFamily(settings.utilitySubheadingFontCustom)
  }
  if (settings.utilityDescriptionFontSource === "custom") {
    loadGoogleFontFamily(settings.utilityDescriptionFontCustom)
  }
  if (settings.utilityCtaFontSource === "custom") {
    loadGoogleFontFamily(settings.utilityCtaFontCustom)
  }
}

/** Per-type text roles for Utility sliders. Logo Grid has no copy. */
export function getUtilityTypographyRoles(sliderType) {
  switch (sliderType) {
    case "testimonials":
      return [
        {
          sourceKey: "utilityHeadingFontSource",
          customKey: "utilityHeadingFontCustom",
          sizeKey: "utilityHeadingFontSize",
          fontRole: "heading",
          label: "Quote font",
          sizeLabel: "Quote size (px)",
          helpText: "Customer quote",
          fallback: 17,
          min: 12,
          max: 32,
        },
        {
          sourceKey: "utilitySubheadingFontSource",
          customKey: "utilitySubheadingFontCustom",
          sizeKey: "utilitySubheadingFontSize",
          fontRole: "heading",
          label: "Name font",
          sizeLabel: "Name size (px)",
          helpText: "Author name",
          fallback: 14,
          min: 10,
          max: 24,
        },
        {
          sourceKey: "utilityDescriptionFontSource",
          customKey: "utilityDescriptionFontCustom",
          sizeKey: "utilityDescriptionFontSize",
          fontRole: "body",
          label: "Role font",
          sizeLabel: "Role size (px)",
          helpText: "Title or company",
          fallback: 13,
          min: 10,
          max: 22,
        },
      ]
    case "announcement":
      return [
        {
          sourceKey: "utilityHeadingFontSource",
          customKey: "utilityHeadingFontCustom",
          sizeKey: "utilityHeadingFontSize",
          fontRole: "heading",
          label: "Message font",
          sizeLabel: "Message size (px)",
          helpText: "Announcement text",
          fallback: 15,
          min: 10,
          max: 28,
        },
        {
          sourceKey: "utilityCtaFontSource",
          customKey: "utilityCtaFontCustom",
          sizeKey: "utilityCtaFontSize",
          fontRole: "body",
          label: "Button font",
          sizeLabel: "Button size (px)",
          helpText: "Promo links on the bar",
          fallback: 12,
          min: 8,
          max: 20,
        },
      ]
    case "stories":
      return [
        {
          sourceKey: "utilityHeadingFontSource",
          customKey: "utilityHeadingFontCustom",
          sizeKey: "utilityHeadingFontSize",
          fontRole: "heading",
          label: "Heading font",
          sizeLabel: "Heading size (px)",
          helpText: "Story frame title (also left column)",
          fallback: 22,
          min: 14,
          max: 48,
        },
        {
          sourceKey: "utilitySubheadingFontSource",
          customKey: "utilitySubheadingFontCustom",
          sizeKey: "utilitySubheadingFontSize",
          fontRole: "body",
          label: "Subheading font",
          sizeLabel: "Subheading size (px)",
          helpText: "Eyebrow on the story frame (also left column)",
          fallback: 11,
          min: 8,
          max: 22,
        },
        {
          sourceKey: "utilityDescriptionFontSource",
          customKey: "utilityDescriptionFontCustom",
          sizeKey: "utilityDescriptionFontSize",
          fontRole: "body",
          label: "Description font",
          sizeLabel: "Description size (px)",
          helpText: "Supporting copy on the story frame (also left column)",
          fallback: 15,
          min: 10,
          max: 28,
        },
        {
          sourceKey: "utilityCtaFontSource",
          customKey: "utilityCtaFontCustom",
          sizeKey: "utilityCtaFontSize",
          fontRole: "body",
          label: "Button font",
          sizeLabel: "Button size (px)",
          helpText: "Button on the story frame (also left column)",
          fallback: 14,
          min: 8,
          max: 22,
        },
      ]
    case "marquee":
      return [
        {
          sourceKey: "utilityHeadingFontSource",
          customKey: "utilityHeadingFontCustom",
          sizeKey: "headingFontSize",
          fontRole: "heading",
          label: "Heading font",
          sizeLabel: "Heading size (px)",
          helpText: "Slide title",
          fallback: 42,
          min: 18,
          max: 96,
        },
        {
          sourceKey: "utilitySubheadingFontSource",
          customKey: "utilitySubheadingFontCustom",
          sizeKey: "subheadingFontSize",
          fontRole: "body",
          label: "Subheading font",
          sizeLabel: "Subheading size (px)",
          helpText: "Eyebrow above the title",
          fallback: 12,
          min: 10,
          max: 28,
        },
        {
          sourceKey: "utilityDescriptionFontSource",
          customKey: "utilityDescriptionFontCustom",
          sizeKey: "descriptionFontSize",
          fontRole: "body",
          label: "Description font",
          sizeLabel: "Description size (px)",
          helpText: "Supporting copy",
          fallback: 16,
          min: 12,
          max: 32,
        },
        {
          sourceKey: "utilityCtaFontSource",
          customKey: "utilityCtaFontCustom",
          sizeKey: "ctaFontSize",
          fontRole: "body",
          label: "Button font",
          sizeLabel: "Button size (px)",
          helpText: "Call-to-action",
          fallback: 16,
          min: 10,
          max: 24,
        },
      ]
    default:
      return []
  }
}

export function resolveType3dFontFamily(source, customName, role, sliderType) {
  const defaults = TYPE3D_SLIDER_FONTS[sliderType] || TYPE3D_SLIDER_FONTS["premium-coverflow"]
  const sliderFont = role === "heading" ? defaults.display : defaults.body
  const src = String(source || "slider").toLowerCase()
  if (src === "theme") {
    return role === "heading"
      ? "var(--font-heading-family, inherit)"
      : "var(--font-body-family, inherit)"
  }
  if (src === "custom") {
    const name = sanitizeFontFamilyName(customName)
    if (!name) return sliderFont
    return `'${name}', ${role === "heading" ? "serif" : "sans-serif"}`
  }
  return sliderFont
}

export function type3dPreviewSize(settings, key, fallback, compact, factor = 0.72) {
  const n = Number(settings?.[key] ?? fallback)
  const size = Number.isFinite(n) ? n : fallback
  if (!compact) return size
  return Math.max(8, Math.round(size * factor))
}

export function type3dSizeFields(sliderType) {
  const section = [
    { key: "type3dSectionHeadingSize", label: "Section heading size (px)", min: 18, max: 80, fallback: 48 },
    { key: "type3dSectionSubheadingSize", label: "Section subheading size (px)", min: 8, max: 28, fallback: 11 },
    { key: "type3dSectionDescriptionSize", label: "Section description size (px)", min: 10, max: 32, fallback: 15 },
  ]
  switch (sliderType) {
    case "premium-stacked":
      return [
        { key: "type3dSlideTitleSize", label: "Product title size (px)", min: 10, max: 48, fallback: 22 },
        { key: "type3dSlideDetailSize", label: "Price size (px)", min: 8, max: 32, fallback: 13 },
      ]
    case "premium-coverflow":
    case "premium-circular":
      return [
        ...section,
        { key: "type3dSlideTitleSize", label: "Product title size (px)", min: 10, max: 48, fallback: 22 },
        { key: "type3dSlideDetailSize", label: "Price size (px)", min: 8, max: 32, fallback: 13 },
      ]
    case "collection-carousel":
      return [
        ...section,
        { key: "type3dSlideTitleSize", label: "Collection title size (px)", min: 10, max: 48, fallback: 28 },
        { key: "type3dSlideDetailSize", label: "Collection description size (px)", min: 8, max: 32, fallback: 13 },
      ]
    case "testimonials-3d":
      return [
        ...section,
        { key: "type3dSlideTitleSize", label: "Quote size (px)", min: 10, max: 48, fallback: 22 },
        { key: "type3dSlideMetaSize", label: "Author name size (px)", min: 8, max: 28, fallback: 14 },
        { key: "type3dSlideDetailSize", label: "Role size (px)", min: 8, max: 32, fallback: 12 },
      ]
    case "ugc-feed":
      return [
        ...section,
        { key: "type3dSlideTitleSize", label: "Title size (px)", min: 10, max: 48, fallback: 15 },
        { key: "type3dSlideDetailSize", label: "Caption size (px)", min: 8, max: 32, fallback: 12 },
        { key: "type3dSlideMetaSize", label: "Creator name size (px)", min: 8, max: 28, fallback: 12 },
      ]
    case "logo-3d":
      return [
        ...section,
        { key: "type3dSlideTitleSize", label: "Brand name size (px)", min: 10, max: 48, fallback: 13 },
        { key: "type3dSlideDetailSize", label: "Brand description size (px)", min: 8, max: 32, fallback: 12 },
      ]
    default:
      return section
  }
}
