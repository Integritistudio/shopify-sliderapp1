/**
 * Quick-add badge helpers for product/collection sliders.
 * Isolated from sales-badge and body ATC button flows.
 */

export const DEFAULT_QUICK_ADD_SETTINGS = {
  quickAddIconUrl: "",
  quickAddBackground: "#170f49",
  quickAddText: "",
  quickAddTextSize: 11,
}

export function normalizeQuickAddTextSize(value) {
  const size = Number(value)
  if (!Number.isFinite(size)) return DEFAULT_QUICK_ADD_SETTINGS.quickAddTextSize
  return Math.min(Math.max(Math.round(size), 8), 24)
}

/** When text is set, show text; otherwise show icon (custom URL or default cart). */
export function shouldShowQuickAddText(text) {
  return Boolean(String(text || "").trim())
}
