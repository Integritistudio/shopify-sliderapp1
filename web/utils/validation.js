const ALLOWED_PROTOCOLS = ["http:", "https:"]

export function isValidHttpUrl(value, { allowEmpty = false } = {}) {
  if (!value || !String(value).trim()) {
    return allowEmpty
  }

  try {
    const url = new URL(String(value).trim())
    return ALLOWED_PROTOCOLS.includes(url.protocol)
  } catch {
    return false
  }
}

export function sanitizePlainText(value, maxLength = 500) {
  if (value == null) return ""
  return String(value).trim().slice(0, maxLength)
}

export function normalizeShopDomain(shop) {
  if (!shop) return null
  return String(shop)
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/\/$/, "")
}

export function pickSlidePayload(body = {}) {
  return {
    imageUrl: body.imageUrl,
    title: body.title,
    description: body.description,
    heading: body.heading,
    subheading: body.subheading,
    ctaText: body.ctaText,
    ctaUrl: body.ctaUrl,
    ctaStyle: body.ctaStyle,
    ctaResourceType: body.ctaResourceType,
    ctaResourceId: body.ctaResourceId,
    ctaOpenInNewTab: body.ctaOpenInNewTab,
    textAlign: body.textAlign,
    overlayColor: body.overlayColor,
    overlayOpacity: body.overlayOpacity,
    textColor: body.textColor,
    buttonBg: body.buttonBg,
    buttonTextColor: body.buttonTextColor,
    imageAlt: body.imageAlt,
    shopifyFileId: body.shopifyFileId,
    mediaType: body.mediaType,
    videoUrl: body.videoUrl,
    videoProvider: body.videoProvider,
    position: body.position,
    isVisible: body.isVisible,
  }
}

export function validateSlideInput(payload, { partial = false } = {}) {
  const errors = []
  const mediaType = payload.mediaType || "image"

  if (!partial || payload.imageUrl !== undefined || payload.videoUrl !== undefined) {
    if (mediaType === "video") {
      if (!payload.videoUrl && !payload.imageUrl) {
        errors.push("videoUrl or poster imageUrl is required for video slides")
      }
    } else if (!payload.imageUrl || !String(payload.imageUrl).trim()) {
      errors.push("imageUrl is required")
    } else if (!isValidHttpUrl(payload.imageUrl) && !String(payload.imageUrl).startsWith("/")) {
      errors.push("imageUrl must be a valid http(s) URL")
    }
  }

  if (!partial || payload.title !== undefined) {
    if (!payload.title || !String(payload.title).trim()) {
      errors.push("title is required")
    }
  }

  if (payload.ctaUrl !== undefined && payload.ctaUrl !== null && String(payload.ctaUrl).trim()) {
    if (!isValidHttpUrl(payload.ctaUrl) && !String(payload.ctaUrl).startsWith("/")) {
      errors.push("ctaUrl must be a valid http(s) URL or relative path")
    }
  }

  if (payload.videoUrl && String(payload.videoUrl).trim()) {
    const value = String(payload.videoUrl).trim()
    const isEmbed =
      /youtube\.com|youtu\.be|vimeo\.com/i.test(value) ||
      isValidHttpUrl(value) ||
      value.startsWith("/")
    if (!isEmbed) {
      errors.push("videoUrl must be a valid URL")
    }
  }

  if (payload.overlayOpacity !== undefined && payload.overlayOpacity !== null) {
    const opacity = Number(payload.overlayOpacity)
    if (Number.isNaN(opacity) || opacity < 0 || opacity > 1) {
      errors.push("overlayOpacity must be between 0 and 1")
    }
  }

  return errors
}
