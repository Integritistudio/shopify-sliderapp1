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
    hoverImageUrl: body.hoverImageUrl,
    compareAtPrice: body.compareAtPrice,
    saleDiscountPercent: body.saleDiscountPercent,
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
    cta2Text: body.cta2Text,
    cta2Url: body.cta2Url,
    cta2OpenInNewTab: body.cta2OpenInNewTab,
    textAlign: body.textAlign,
    overlayColor: body.overlayColor,
    overlayOpacity: body.overlayOpacity,
    textColor: body.textColor,
    buttonBg: body.buttonBg,
    buttonTextColor: body.buttonTextColor,
    imageAlt: body.imageAlt,
    shopifyFileId: body.shopifyFileId,
    variantId: body.variantId,
    availableForSale: body.availableForSale,
    mediaType: body.mediaType,
    videoUrl: body.videoUrl,
    videoProvider: body.videoProvider,
    position: body.position,
    isVisible: body.isVisible,
    rating: body.rating,
    verified: body.verified,
    creatorHandle: body.creatorHandle,
    avatarUrl: body.avatarUrl,
  }
}

export function validateSlideInput(payload, { partial = false, sliderType = null } = {}) {
  const errors = []
  const mediaType = payload.mediaType || "image"
  const isAnnouncement = sliderType === "announcement"
  const allowEmptyImage =
    isAnnouncement || sliderType === "collection-carousel" || sliderType === "testimonials-3d"

  if (!partial || payload.imageUrl !== undefined || payload.videoUrl !== undefined) {
    if (sliderType === "ugc-feed") {
      const hasImage = payload.imageUrl && String(payload.imageUrl).trim()
      const hasVideo = payload.videoUrl && String(payload.videoUrl).trim()
      if (!hasImage && !hasVideo) {
        errors.push("imageUrl or videoUrl is required for UGC feed slides")
      }
      if (hasImage && !isValidHttpUrl(payload.imageUrl) && !String(payload.imageUrl).startsWith("/")) {
        errors.push("imageUrl must be a valid http(s) URL")
      }
      if (hasVideo && !isValidHttpUrl(payload.videoUrl) && !String(payload.videoUrl).startsWith("/")) {
        errors.push("videoUrl must be a valid http(s) URL")
      }
    } else if (allowEmptyImage) {
      // Text-first / initials / sync-driven cards: imageUrl is optional.
      if (payload.imageUrl && String(payload.imageUrl).trim()) {
        if (!isValidHttpUrl(payload.imageUrl) && !String(payload.imageUrl).startsWith("/")) {
          errors.push("imageUrl must be a valid http(s) URL")
        }
      }
    } else if (mediaType === "video") {
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

  if (payload.cta2Url !== undefined && payload.cta2Url !== null && String(payload.cta2Url).trim()) {
    if (!isValidHttpUrl(payload.cta2Url) && !String(payload.cta2Url).startsWith("/")) {
      errors.push("cta2Url must be a valid http(s) URL or relative path")
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

  if (payload.avatarUrl && String(payload.avatarUrl).trim()) {
    if (!isValidHttpUrl(payload.avatarUrl) && !String(payload.avatarUrl).startsWith("/")) {
      errors.push("avatarUrl must be a valid http(s) URL")
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
