/**
 * Modular sales-badge helpers for product/collection sliders.
 * Isolated from ATC, hover-image, and price-display flows.
 */

export const SALES_BADGE_MODE = {
  OFF: "off",
  AUTOMATIC: "automatic",
}

export const DEFAULT_SALES_BADGE_MODE = SALES_BADGE_MODE.AUTOMATIC

export const SALES_BADGE_FORMAT = {
  PERCENT_OFF: "percent-off",
  PERCENT: "percent",
  SAVE_PERCENT: "save-percent",
  CUSTOM: "custom",
}

export const SALES_BADGE_FORMAT_OPTIONS = [
  { value: SALES_BADGE_FORMAT.PERCENT_OFF, label: "20% OFF" },
  { value: SALES_BADGE_FORMAT.PERCENT, label: "20%" },
  { value: SALES_BADGE_FORMAT.SAVE_PERCENT, label: "Save 20%" },
  { value: SALES_BADGE_FORMAT.CUSTOM, label: "Custom text" },
]

export const DEFAULT_SALES_BADGE_SETTINGS = {
  salesBadgeMode: DEFAULT_SALES_BADGE_MODE,
  salesBadgePadding: 8,
  salesBadgeFormat: SALES_BADGE_FORMAT.PERCENT_OFF,
  salesBadgeText: "OFF",
  salesBadgeBackground: "#170f49",
}

/**
 * @param {number|string|null|undefined} price
 * @param {number|string|null|undefined} compareAtPrice
 * @returns {number|null} Whole-number discount percent, or null when not on sale
 */
export function calculateSaleDiscountPercent(price, compareAtPrice) {
  const priceAmount = Number(price)
  const compareAmount = Number(compareAtPrice)
  if (
    !Number.isFinite(priceAmount) ||
    !Number.isFinite(compareAmount) ||
    compareAmount <= 0 ||
    compareAmount <= priceAmount
  ) {
    return null
  }
  const discountPercentage = Math.round(((compareAmount - priceAmount) / compareAmount) * 100)
  return discountPercentage > 0 ? discountPercentage : null
}

/**
 * Storefront Ajax `/products/{handle}.js` variant prices are in cents.
 */
export function calculateSaleDiscountPercentFromCents(priceCents, compareAtCents) {
  return calculateSaleDiscountPercent(
    Number(priceCents) / 100,
    Number(compareAtCents) / 100,
  )
}

export function normalizeSalesBadgeMode(mode) {
  const value = String(mode || "").trim().toLowerCase()
  if (value === SALES_BADGE_MODE.OFF) return SALES_BADGE_MODE.OFF
  if (value === SALES_BADGE_MODE.AUTOMATIC) return SALES_BADGE_MODE.AUTOMATIC
  return DEFAULT_SALES_BADGE_MODE
}

export function normalizeSalesBadgeFormat(format) {
  const value = String(format || "").trim().toLowerCase()
  if (Object.values(SALES_BADGE_FORMAT).includes(value)) return value
  return SALES_BADGE_FORMAT.PERCENT_OFF
}

/**
 * Build badge label from discount % + format/text settings.
 * - percent-off: "20% OFF" (text replaces the OFF word)
 * - percent: "20%"
 * - save-percent: "Save 20%"
 * - custom: salesBadgeText with {percent} replaced
 */
export function formatSaleBadgeLabel(discountPercent, options = {}) {
  const percent = Number(discountPercent)
  if (!Number.isFinite(percent) || percent <= 0) return ""
  const n = Math.round(percent)
  const format = normalizeSalesBadgeFormat(options.format || options.salesBadgeFormat)
  const rawText = options.text ?? options.salesBadgeText
  const text = String(rawText == null ? "OFF" : rawText).trim()

  switch (format) {
    case SALES_BADGE_FORMAT.PERCENT:
      return `${n}%`
    case SALES_BADGE_FORMAT.SAVE_PERCENT:
      return `Save ${n}%`
    case SALES_BADGE_FORMAT.CUSTOM: {
      const template = text || "{percent}% OFF"
      return template.replace(/\{percent\}/gi, String(n))
    }
    case SALES_BADGE_FORMAT.PERCENT_OFF:
    default:
      return `${n}% ${text || "OFF"}`
  }
}

export function isAutomaticSalesBadge(mode) {
  return normalizeSalesBadgeMode(mode) === SALES_BADGE_MODE.AUTOMATIC
}

export function shouldRenderSalesBadge(mode, discountPercent) {
  if (!isAutomaticSalesBadge(mode)) return false
  const percent = Number(discountPercent)
  return Number.isFinite(percent) && percent > 0
}
