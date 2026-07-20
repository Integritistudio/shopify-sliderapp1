export function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
}

export function escapeAttr(value) {
  return escapeHtml(value).replace(/`/g, "&#96;")
}

export function safeUrl(value) {
  if (!value) return ""
  const trimmed = String(value).trim()
  if (trimmed.startsWith("/")) return trimmed
  try {
    const url = new URL(trimmed)
    if (url.protocol === "http:" || url.protocol === "https:") {
      return url.toString()
    }
  } catch {
    return ""
  }
  return ""
}
