const STORAGE_KEY = "slideease-app-appearance"

/** Default SlideEase admin chrome colors (matches slideease.css :root) */
export const APPEARANCE_DEFAULTS = {
  accent: "#ed8104",
  accentHover: "#d47303",
  accentActive: "#c96d00",
  ink: "#170f49",
  muted: "#5f5a72",
  line: "#e7e7e7",
  soft: "#f8f8f8",
  panel: "#ffffff",
  fieldBorder: "#c9ccd1",
  heroFill: "#fffaf3",
  heroBorder: "#f3dfc7",
}

export const APPEARANCE_FIELDS = [
  {
    key: "accent",
    label: "Primary / button",
    help: "Orange Create buttons and primary actions.",
  },
  {
    key: "accentHover",
    label: "Button hover",
    help: "Hover state for primary buttons",
  },
  {
    key: "accentActive",
    label: "Button pressed",
    help: "Active / pressed state for primary buttons",
  },
  {
    key: "ink",
    label: "Text",
    help: "Headings and main text color",
  },
  {
    key: "muted",
    label: "Muted text",
    help: "Secondary labels and helper text",
  },
  {
    key: "line",
    label: "Borders",
    help: "Card edges, panel borders, and dividers",
  },
  {
    key: "fieldBorder",
    label: "Input borders",
    help: "Text fields and form controls",
  },
  {
    key: "soft",
    label: "Soft background",
    help: "Subtle fills behind tools and footers",
  },
  {
    key: "panel",
    label: "Panel background",
    help: "Main card / panel surfaces",
  },
  {
    key: "heroFill",
    label: "Hero fill",
    help: "Inner background of the dashboard hero card",
  },
  {
    key: "heroBorder",
    label: "Hero border",
    help: "Border around the dashboard hero card",
  },
]

function clampByte(n) {
  return Math.max(0, Math.min(255, Math.round(n)))
}

function hexToRgb(hex) {
  const raw = String(hex || "").replace("#", "")
  if (raw.length === 3) {
    const r = parseInt(raw[0] + raw[0], 16)
    const g = parseInt(raw[1] + raw[1], 16)
    const b = parseInt(raw[2] + raw[2], 16)
    return { r, g, b }
  }
  if (raw.length !== 6) return { r: 237, g: 129, b: 4 }
  return {
    r: parseInt(raw.slice(0, 2), 16),
    g: parseInt(raw.slice(2, 4), 16),
    b: parseInt(raw.slice(4, 6), 16),
  }
}

function mixWithWhite(hex, amount = 0.88) {
  const { r, g, b } = hexToRgb(hex)
  const mix = (c) => clampByte(c + (255 - c) * amount)
  return `#${[mix(r), mix(g), mix(b)]
    .map((c) => c.toString(16).padStart(2, "0"))
    .join("")}`
}

export function normalizeHex(value, fallback = "#000000") {
  const color = String(value || "").trim()
  if (/^#[0-9a-f]{6}$/i.test(color)) return color.toLowerCase()
  if (/^#[0-9a-f]{3}$/i.test(color)) {
    return `#${color
      .slice(1)
      .split("")
      .map((part) => part + part)
      .join("")}`.toLowerCase()
  }
  return fallback
}

export function normalizeAppearance(input = {}) {
  const next = { ...APPEARANCE_DEFAULTS }
  for (const key of Object.keys(APPEARANCE_DEFAULTS)) {
    if (input[key] != null) {
      next[key] = normalizeHex(input[key], APPEARANCE_DEFAULTS[key])
    }
  }
  return next
}

/** Push appearance tokens onto :root so slideease.css + Polaris primary pick them up. */
export function applyAppearance(theme) {
  if (typeof document === "undefined") return
  const vars = appearanceToCssVars(theme)
  const root = document.documentElement
  for (const [key, value] of Object.entries(vars)) {
    root.style.setProperty(key, value)
  }
}

/** React style object for wrapping the app (more reliable in Shopify iframe). */
export function appearanceToCssVars(theme) {
  const t = normalizeAppearance(theme)
  const softAccent = mixWithWhite(t.accent, 0.88)
  const washAccent = mixWithWhite(t.accent, 0.94)
  return {
    "--se-accent": t.accent,
    "--se-accent-deep": t.accent,
    "--se-accent-mid": t.accent,
    "--se-button-hover": t.accentHover,
    "--se-accent-active": t.accentActive,
    "--se-accent-soft": softAccent,
    "--se-accent-wash": washAccent,
    "--se-ink": t.ink,
    "--se-muted": t.muted,
    "--se-line": t.line,
    "--se-soft": t.soft,
    "--se-panel": t.panel,
    "--se-field-border": t.fieldBorder,
    "--se-hero-fill": t.heroFill,
    "--se-hero-border": t.heroBorder,
    "--p-color-bg-primary": t.accent,
    "--p-color-border-interactive": t.fieldBorder,
    "--p-color-border-interactive-focus": t.fieldBorder,
    "--p-color-focused": t.fieldBorder,
    "--p-color-text-info": t.ink,
    "--p-color-border-info": t.ink,
    "--p-text": t.ink,
  }
}

export function loadAppearance() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { ...APPEARANCE_DEFAULTS }
    return normalizeAppearance(JSON.parse(raw))
  } catch {
    return { ...APPEARANCE_DEFAULTS }
  }
}

export function saveAppearance(theme) {
  const next = normalizeAppearance(theme)
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  } catch {
    // ignore quota / private mode
  }
  applyAppearance(next)
  return next
}

export function resetAppearance() {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    // ignore
  }
  applyAppearance(APPEARANCE_DEFAULTS)
  return { ...APPEARANCE_DEFAULTS }
}
