"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { Text, Button, Badge } from "@shopify/polaris"
import {
  getSampleSlidesForType,
  getSliderTypeInfo,
  mergeSliderSettings,
  resolveSliderType,
  resolveContentPlacement,
  contentPlacementStyle,
  HERO_SLIDER_TYPES,
} from "../utils/sliderConfig"
import { safeUrl } from "../utils/escapeHtml"

function isHeroEffect(effect) {
  return (
    HERO_SLIDER_TYPES.includes(resolveSliderType(effect)) ||
    ["hero-video", "slide", "thumbnails"].includes(resolveSliderType(effect))
  )
}

function heroPx(size, compact, factor = 0.55) {
  const n = Number(size)
  if (!Number.isFinite(n)) return compact ? 14 : 16
  return compact ? Math.max(10, Math.round(n * factor)) : n
}

function resolveFontSize(settings, key, desktopDefault, compact, factor = 0.55) {
  const desktop = Number(settings[key] ?? desktopDefault)
  if (!compact) return desktop
  const mobileVal = settings.mobile?.[key]
  if (mobileVal != null && mobileVal !== "") {
    const n = Number(mobileVal)
    if (Number.isFinite(n)) return n
  }
  return heroPx(desktop, true, factor)
}

function CtaButtons({ slide, settings, compact = false, variant = "primary" }) {
  const padY = compact
    ? Math.max(4, Math.round((settings.ctaPadding ?? 12) * 0.55))
    : settings.ctaPadding ?? 12
  const padX = compact
    ? Math.max(8, Math.round((settings.ctaPadding ?? 12) * 0.95))
    : Math.round((settings.ctaPadding ?? 12) * 1.75)
  const fontSizePx = resolveFontSize(settings, "ctaFontSize", 16, compact, 0.88)
  const fontSize = `${fontSizePx}px`
  const radius = settings.ctaBorderRadius ?? 50
  const borderWidth = settings.ctaBorderWidth ?? 1
  const iconSize = compact
    ? Math.round((settings.ctaIconSize ?? 34) * 0.65)
    : settings.ctaIconSize ?? 34
  const isLight = variant === "light"

  const baseStyle = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: compact ? 5 : 8,
    padding: `${padY}px ${padX}px`,
    borderRadius: radius,
    fontWeight: 700,
    fontSize,
    lineHeight: 1,
    boxSizing: "border-box",
    minHeight: iconSize + padY * 2,
  }

  const primaryStyle = {
    ...baseStyle,
    border: `${borderWidth}px solid ${settings.ctaBorderColor || (isLight ? "transparent" : "#ffffff")}`,
    background: settings.ctaBackground || slide.buttonBg || (isLight ? "#ffffff" : "#1a2f4a"),
    color: settings.ctaTextColor || slide.buttonTextColor || (isLight ? "#170f49" : "#ffffff"),
  }

  const secondaryStyle = {
    ...baseStyle,
    border: `${borderWidth}px solid ${settings.cta2BorderColor || settings.ctaBorderColor || (isLight ? "#170f49" : "#ffffff")}`,
    background: settings.cta2Background ?? "transparent",
    color: settings.cta2TextColor || settings.ctaTextColor || (isLight ? "#170f49" : "#ffffff"),
  }

  const renderIcon = (icon, color, bg) => {
    if (!icon || icon === "none") return null
    return (
      <svg
        viewBox="0 0 20 20"
        aria-hidden="true"
        style={{
          width: iconSize,
          height: iconSize,
          padding: Math.round(iconSize * 0.235),
          borderRadius: "50%",
          boxSizing: "border-box",
          color: color || "#ffffff",
          background: bg || "rgba(255,255,255,0.12)",
          flexShrink: 0,
        }}
      >
        <path
          d={icon === "chevron" ? "M7 4l6 6-6 6" : "M4 10h11m-4-4 4 4-4 4"}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    )
  }

  if (!slide.ctaText && !slide.cta2Text) return null

  return (
    <div style={{ display: "inline-flex", flexWrap: "wrap", alignItems: "center", gap: compact ? 6 : 10 }}>
      {slide.ctaText ? (
        <span style={primaryStyle}>
          {slide.ctaText}
          {renderIcon(settings.ctaIcon || "arrow", settings.ctaIconColor, settings.ctaIconBg)}
        </span>
      ) : null}
      {slide.cta2Text ? (
        <span style={secondaryStyle}>
          {slide.cta2Text}
          {renderIcon(settings.cta2Icon || "none", settings.cta2IconColor, settings.cta2IconBg)}
        </span>
      ) : null}
    </div>
  )
}

function SlideFrame({ slide, settings, compact, heightOverride, style = {}, mediaClassName = "", contentClassName = "" }) {
  const imageUrl = safeUrl(slide.imageUrl)
  const videoUrl = safeUrl(slide.videoUrl)
  const heading = slide.heading || slide.title || ""
  const subheading = slide.subheading || ""
  const description = slide.description || ""
  const alt = slide.imageAlt || heading || "Slide image"
  const overlayOpacity = Number(slide.overlayOpacity ?? settings.overlayOpacity ?? 0.35)
  const overlayColor = slide.overlayColor || settings.overlayColor || "#000000"
  const heroLayout = isHeroEffect(settings.effect)
  const placement = heroLayout
    ? contentPlacementStyle(resolveContentPlacement(slide, settings))
    : {
        justifyContent: "center",
        alignItems: slide.textAlign === "left" ? "flex-start" : slide.textAlign === "right" ? "flex-end" : "center",
        textAlign: slide.textAlign || "center",
      }
  const align = placement.textAlign
  const height =
    heightOverride ??
    (compact ? Math.min(Number(settings.height) || 640, 260) : Math.min(Number(settings.height) || 640, 520))
  const radius = Number(settings.borderRadius ?? 0)
  const copyGap = Number(settings.copyGap ?? 10)
  const headingColor = settings.headingColor || slide.textColor || "#ffffff"
  const subColor = settings.subheadingColor || slide.textColor || "#ffffff"
  const descColor = settings.descriptionColor || slide.textColor || "#ffffff"

  return (
    <div
      className="se-frame"
      style={{
        position: "relative",
        width: "100%",
        height,
        borderRadius: radius,
        overflow: "hidden",
        background: imageUrl || videoUrl ? "#111" : "linear-gradient(135deg, #1a2f4a 0%, #121826 70%)",
        boxShadow: "0 10px 28px rgba(18, 24, 38, 0.14)",
        ...style,
      }}
    >
      {slide.mediaType === "video" && videoUrl && !/youtube|vimeo/i.test(videoUrl) ? (
        <video
          className={mediaClassName}
          src={videoUrl}
          poster={imageUrl || undefined}
          muted
          playsInline
          style={{ width: "100%", height: "100%", objectFit: settings.objectFit || "cover" }}
        />
      ) : imageUrl ? (
        <img
          className={mediaClassName}
          src={imageUrl}
          alt={alt}
          style={{ width: "100%", height: "100%", objectFit: settings.objectFit || "cover", display: "block" }}
        />
      ) : null}

      <div style={{ position: "absolute", inset: 0, background: overlayColor, opacity: overlayOpacity, pointerEvents: "none" }} />

      <div
        className={contentClassName}
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          justifyContent: heroLayout ? placement.justifyContent : "center",
          alignItems: placement.alignItems,
          textAlign: align,
          padding: compact ? "0.9rem" : "1.4rem",
          color: slide.textColor || "#ffffff",
          zIndex: 1,
          gap: heroLayout ? copyGap : undefined,
        }}
      >
        {subheading ? (
          <p
            style={{
              margin: heroLayout ? 0 : "0 0 0.35rem",
              fontSize: heroLayout
                ? `${resolveFontSize(settings, "subheadingFontSize", 12, compact, 0.9)}px`
                : compact
                  ? "0.7rem"
                  : "0.8rem",
              fontWeight: 700,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              opacity: 0.95,
              color: heroLayout ? subColor : undefined,
            }}
          >
            {subheading}
          </p>
        ) : null}
        {heading ? (
          <h3
            style={{
              margin: heroLayout ? 0 : "0 0 0.4rem",
              fontSize: heroLayout
                ? `${resolveFontSize(settings, "headingFontSize", 42, compact, 0.5)}px`
                : compact
                  ? "1.4rem"
                  : "2.35rem",
              fontWeight: 700,
              letterSpacing: "-0.02em",
              color: heroLayout ? headingColor : undefined,
            }}
          >
            {heading}
          </h3>
        ) : null}
        {description ? (
          <p
            style={{
              margin: heroLayout ? 0 : "0 0 0.8rem",
              maxWidth: "28rem",
              lineHeight: 1.4,
              fontSize: heroLayout
                ? `${resolveFontSize(settings, "descriptionFontSize", 16, compact, 0.85)}px`
                : compact
                  ? "0.92rem"
                  : "1.15rem",
              opacity: 0.9,
              display: "-webkit-box",
              WebkitLineClamp: compact ? 2 : 4,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              color: heroLayout ? descColor : undefined,
            }}
          >
            {description}
          </p>
        ) : null}
        {slide.ctaText || slide.cta2Text ? <CtaButtons slide={slide} settings={settings} compact={compact} /> : null}
      </div>
    </div>
  )
}

function HeroFrame({ slide, settings, compact, heightOverride, boxed = false, video = false }) {
  const imageUrl = safeUrl(slide.imageUrl)
  const videoUrl = safeUrl(slide.videoUrl)
  const heading = slide.heading || slide.title || ""
  const subheading = slide.subheading || ""
  const description = slide.description || ""
  const placement = contentPlacementStyle(resolveContentPlacement(slide, settings))
  const align = placement.textAlign
  const height =
    heightOverride ??
    (compact ? Math.min(Number(settings.height) || 640, 260) : Math.min(Number(settings.height) || 640, 560))
  const radius = boxed ? Number(settings.borderRadius ?? 20) : 0
  const copyGap = Number(settings.copyGap ?? 10)
  const paginationOffset = Number(settings.paginationOffset ?? 16)
  const headingColor = settings.headingColor || slide.textColor || "#ffffff"
  const subColor = settings.subheadingColor || slide.textColor || "#ffffff"
  const descColor = settings.descriptionColor || slide.textColor || "#ffffff"
  const headingSize = resolveFontSize(settings, "headingFontSize", 42, compact, 0.48)
  const subSize = resolveFontSize(settings, "subheadingFontSize", 12, compact, 0.85)
  const descSize = resolveFontSize(settings, "descriptionFontSize", 16, compact, 0.85)
  const bottomPad = compact ? Math.max(28, 20 + paginationOffset) : Math.max(44, 28 + paginationOffset)

  const media = (
    <div
      style={{
        position: "relative",
        width: "100%",
        height,
        borderRadius: radius,
        overflow: "hidden",
        background: "#0b0d12",
      }}
    >
      {video && slide.mediaType === "video" && videoUrl && !/youtube|vimeo/i.test(videoUrl) ? (
        <video
          src={videoUrl}
          poster={imageUrl || undefined}
          muted
          playsInline
          autoPlay
          loop
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
        />
      ) : imageUrl ? (
        <img
          src={imageUrl}
          alt={slide.imageAlt || heading || "Hero"}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block",
            transform: "scale(1.04)",
          }}
        />
      ) : (
        <div style={{ width: "100%", height: "100%", background: "linear-gradient(135deg,#1a2f4a,#0b0d12)" }} />
      )}

      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(90deg, rgba(11,13,18,0.72) 0%, rgba(11,13,18,0.35) 48%, rgba(11,13,18,0.18) 100%), linear-gradient(180deg, rgba(11,13,18,0.15) 0%, rgba(11,13,18,0.55) 100%)",
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          justifyContent: placement.justifyContent,
          alignItems: placement.alignItems,
          textAlign: align,
          padding: compact
            ? `1.25rem 1rem ${bottomPad}px`
            : `2.5rem clamp(1.25rem, 4vw, 3.5rem) ${bottomPad}px`,
          color: "#fff",
          zIndex: 1,
        }}
      >
        <div
          className={settings.heroAnimation === "slide-up" ? "se-rise-content" : undefined}
          style={{ maxWidth: compact ? "100%" : "34rem", display: "flex", flexDirection: "column", gap: copyGap, alignItems: placement.alignItems }}
        >
          {subheading ? (
            <div
              style={{
                display: "inline-flex",
                padding: "0.28rem 0.7rem",
                borderRadius: 999,
                border: "1px solid rgba(255,255,255,0.35)",
                background: "rgba(255,255,255,0.08)",
                fontSize: subSize,
                fontWeight: 650,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: subColor,
              }}
            >
              {subheading}
            </div>
          ) : null}
          {heading ? (
            <h3
              style={{
                margin: 0,
                fontSize: headingSize,
                lineHeight: 1.05,
                fontWeight: 700,
                letterSpacing: "-0.03em",
                color: headingColor,
              }}
            >
              {heading}
            </h3>
          ) : null}
          {description ? (
            <p
              style={{
                margin: 0,
                fontSize: descSize,
                lineHeight: 1.45,
                opacity: 0.9,
                maxWidth: "28rem",
                color: descColor,
              }}
            >
              {description}
            </p>
          ) : null}
          {slide.ctaText || slide.cta2Text ? <CtaButtons slide={slide} settings={settings} compact={compact} variant="light" /> : null}
        </div>
      </div>
    </div>
  )

  if (!boxed) return media
  return (
    <div style={{ maxWidth: 1080, margin: "0 auto", padding: compact ? 0 : "0.35rem 0.75rem" }}>
      <div
        style={{
          padding: compact ? 0 : 10,
          borderRadius: radius + 6,
          background: "#fff",
          border: "1px solid #e7e7e7",
          boxShadow: "0 18px 48px rgba(23,15,73,0.08)",
        }}
      >
        {media}
      </div>
    </div>
  )
}

function ProductCard({ slide, settings, compact = false, featured = false, reserveTitleSpace = true }) {
  const imageUrl = safeUrl(slide.imageUrl)
  const hoverImageUrl = safeUrl(slide.hoverImageUrl)
  const title = slide.heading || slide.title || "Product"
  const price = slide.description || ""
  const salesBadgeMode = String(settings.salesBadgeMode || "automatic").toLowerCase()
  const saleDiscountPercent = Number(slide.saleDiscountPercent)
  const salesBadgeFormat = String(settings.salesBadgeFormat || "percent-off").toLowerCase()
  const salesBadgeText =
    settings.salesBadgeText == null
      ? salesBadgeFormat === "custom"
        ? "{percent}% OFF"
        : "OFF"
      : String(settings.salesBadgeText)
  const salesBadgePadding = Math.min(Math.max(Number(settings.salesBadgePadding ?? 8), 0), 24)
  const salesBadgeBackground = settings.salesBadgeBackground || "#170f49"
  const quickAddBackground = settings.quickAddBackground || "#170f49"
  const quickAddText = String(settings.quickAddText || "").trim()
  const quickAddIconUrl = safeUrl(settings.quickAddIconUrl)
  const quickAddTextSize = Math.min(Math.max(Number(settings.quickAddTextSize ?? 11), 8), 24)
  const formatSaleBadge = (percent) => {
    const n = Math.round(Number(percent))
    if (!Number.isFinite(n) || n <= 0) return ""
    switch (salesBadgeFormat) {
      case "percent":
        return `${n}%`
      case "save-percent":
        return `Save ${n}%`
      case "custom":
        return (salesBadgeText.trim() || "{percent}% OFF").replace(/\{percent\}/gi, String(n))
      case "percent-off":
      default:
        return `${n}% ${salesBadgeText.trim() || "OFF"}`
    }
  }
  const saleBadgeLabel =
    salesBadgeMode !== "off" && Number.isFinite(saleDiscountPercent) && saleDiscountPercent > 0
      ? formatSaleBadge(saleDiscountPercent)
      : ""
  const titleSize = compact
    ? Math.max(12, Math.round((settings.productTitleFontSize ?? 16) * 0.85))
    : settings.productTitleFontSize ?? 16
  const priceSize = compact
    ? Math.max(10, Math.round((settings.productPriceFontSize ?? 14) * 0.9))
    : settings.productPriceFontSize ?? 14
  const ctaSize = resolveFontSize(settings, "ctaFontSize", settings.atcFontSize ?? 16, compact, 0.85)
  const pad = settings.ctaPadding ?? settings.atcPadding ?? settings.ctaPaddingY ?? 12
  const contentGap = settings.productContentGap ?? 8
  const showShopNow = settings.showShopNow !== false
  const showAddToCart = settings.showAddToCart !== false
  const showSoldOut = settings.showSoldOut !== false
  const isSoldOut = slide.availableForSale === false
  const sharedRadius = settings.ctaBorderRadius ?? settings.atcBorderRadius ?? 50
  const titleFontSize = featured ? titleSize + 1 : titleSize
  const shopStyle = {
    display: "inline-flex",
    alignSelf: "flex-start",
    padding: `${pad}px ${Math.round(pad * 1.75)}px`,
    borderRadius: sharedRadius,
    border: `${settings.ctaBorderWidth ?? 0}px solid ${settings.ctaBorderColor || "transparent"}`,
    background: settings.ctaBackground || "#170f49",
    color: settings.ctaTextColor || "#fff",
    fontSize: ctaSize,
    fontWeight: 650,
    lineHeight: 1,
  }
  const atcStyle = {
    display: "inline-flex",
    alignSelf: "flex-start",
    padding: `${pad}px ${Math.round(pad * 1.75)}px`,
    borderRadius: sharedRadius,
    border: `${settings.atcBorderWidth ?? settings.ctaBorderWidth ?? 1}px solid ${
      isSoldOut && showSoldOut ? "#d1d5db" : settings.atcBorderColor || "#170f49"
    }`,
    background: isSoldOut && showSoldOut ? "#f3f4f6" : settings.atcBackground || "#ffffff",
    color: isSoldOut && showSoldOut ? "#6b7280" : settings.atcTextColor || "#170f49",
    fontSize: ctaSize,
    fontWeight: 650,
    lineHeight: 1,
    opacity: isSoldOut && showSoldOut ? 0.85 : 1,
  }
  return (
    <div
      className={`se-preview-product-card${hoverImageUrl ? " se-preview-product-card--has-hover" : ""}`}
      style={{
        background: settings.productCardTransparent ? "transparent" : settings.productCardBackground || "#ffffff",
        border: settings.productCardBorder === false ? "none" : "1px solid #e7e7e7",
        borderRadius: Number(settings.borderRadius ?? 14),
        overflow: "hidden",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        boxShadow: "none",
      }}
    >
      <div style={{ position: "relative", aspectRatio: "1 / 1.05", background: "#f3f4f6", overflow: "hidden" }}>
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={title}
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          />
        ) : null}
        {hoverImageUrl ? (
          <img
            className="se-preview-product-card__hover-img"
            src={hoverImageUrl}
            alt=""
            aria-hidden="true"
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
              opacity: 0,
              pointerEvents: "none",
              transition: "opacity 0.25s ease",
            }}
          />
        ) : null}
        {saleBadgeLabel ? (
          <span
            className="se-preview-product-card__badge"
            aria-hidden="true"
            style={{
              position: "absolute",
              top: 10,
              left: 10,
              zIndex: 2,
              pointerEvents: "none",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              padding: salesBadgePadding,
              borderRadius: 4,
              background: salesBadgeBackground,
              color: "#fff",
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.02em",
              lineHeight: 1.2,
              textTransform: "uppercase",
            }}
          >
            {saleBadgeLabel}
          </span>
        ) : null}
        {!isSoldOut ? (
          <span
            className="se-preview-product-card__quick-add"
            aria-hidden="true"
            style={{
              position: "absolute",
              right: 10,
              bottom: 10,
              zIndex: 3,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              padding: salesBadgePadding,
              borderRadius: 4,
              background: quickAddBackground,
              color: "#fff",
              fontSize: quickAddTextSize,
              fontWeight: 700,
              letterSpacing: "0.02em",
              lineHeight: 1,
              textTransform: "uppercase",
              whiteSpace: "nowrap",
              opacity: 0,
              transform: "translateY(8px)",
              pointerEvents: "none",
              transition: "opacity 0.2s ease, transform 0.2s ease",
            }}
          >
            {quickAddText ? (
              quickAddText
            ) : quickAddIconUrl ? (
              <img
                src={quickAddIconUrl}
                alt=""
                style={{ width: quickAddTextSize, height: quickAddTextSize, objectFit: "contain", display: "block" }}
              />
            ) : (
              <svg
                width={quickAddTextSize}
                height={quickAddTextSize}
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M3 5h2l1.2 9.2a2 2 0 0 0 2 1.8h8.6a2 2 0 0 0 2-1.7L20 8H7"
                  stroke="currentColor"
                  strokeWidth="1.9"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <circle cx="10" cy="20" r="1.4" fill="currentColor" />
                <circle cx="17" cy="20" r="1.4" fill="currentColor" />
              </svg>
            )}
          </span>
        ) : null}
      </div>
      <div
        style={{
          padding: compact ? "0.7rem 0.75rem 0.85rem" : "0.85rem 0.95rem 1rem",
          color: "#170f49",
          display: "flex",
          flexDirection: "column",
          flex: 1,
          gap: contentGap,
        }}
      >
        <div
          style={{
            fontWeight: 650,
            fontSize: titleFontSize,
            lineHeight: 1.3,
            ...(reserveTitleSpace ? { minHeight: `calc(${titleFontSize}px * 1.3 * 2)` } : null),
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {title}
        </div>
        {settings.showPrice !== false && price ? (
          <div style={{ fontSize: priceSize, color: "#5f5a72", fontWeight: 600 }}>{price}</div>
        ) : null}
        {(showAddToCart || showShopNow) && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
            {showAddToCart && !(isSoldOut && !showSoldOut) ? (
              <span style={atcStyle}>
                {isSoldOut && showSoldOut
                  ? settings.soldOutText || "Sold out"
                  : settings.addToCartText || "Add to cart"}
              </span>
            ) : null}
            {showShopNow ? <span style={shopStyle}>{slide.ctaText || "Shop now"}</span> : null}
          </div>
        )}
        <div style={{ flex: 1, minHeight: 0 }} aria-hidden="true" />
      </div>
    </div>
  )
}

function SectionHeading({ text, compact, fontSize, gap }) {
  if (!text) return null
  const size = fontSize ?? 28
  const bottomGap = gap ?? 16
  return (
    <div style={{ marginBottom: compact ? Math.max(8, Math.round(bottomGap * 0.65)) : bottomGap, textAlign: "center" }}>
      <h3
        style={{
          margin: 0,
          color: "#170f49",
          fontSize: compact ? Math.max(16, Math.round(size * 0.75)) : size,
          fontWeight: 700,
          letterSpacing: "-0.02em",
        }}
      >
        {text}
      </h3>
    </div>
  )
}

/** Collection carousel preview — separate from Premium product 3D engines */
function CollectionCarouselPreview({ slides, index, settings, compact, onPrev, onNext, onGoTo }) {
  const ink = "#141210"
  const showNav = settings.arrows !== false && slides.length > 1
  const showDots = settings.dots !== false && slides.length > 1
  const showCount = settings.showItemCount !== false
  const overlay = Number(settings.c3Overlay ?? 0.55)
  const radius = Number(settings.borderRadius ?? 4)
  const sectionBgTransparent = settings.sectionBackgroundTransparent === true
  const sectionBgCustom = String(settings.sectionBackground || "").trim()
  const sectionBg = sectionBgTransparent
    ? "transparent"
    : sectionBgCustom ||
      "radial-gradient(85% 60% at 50% 0%, rgba(255,255,255,0.55) 0%, transparent 58%), linear-gradient(168deg, #ece8e2 0%, #d8d2c8 100%)"

  const sideCount = compact ? 1 : Math.max(1, Math.floor(((Number(settings.visibleSlides) || 5) - 1) / 2))
  // Match storefront CSS: --c3-slide-width: min(38vw, 360px)
  const cardWidth = compact ? 240 : 340
  const spacingX = compact ? 168 : 250

  const wrapIndex = (i) => {
    const len = slides.length
    if (!len) return 0
    return ((i % len) + len) % len
  }

  const offsetFor = (slideIndex, activeIndex) => {
    const len = slides.length
    if (settings.infinite === false) return slideIndex - activeIndex
    let offset = slideIndex - activeIndex
    const half = Math.floor(len / 2)
    if (offset > half) offset -= len
    if (offset < -half) offset += len
    return offset
  }

  const formatCount = (raw) => {
    const n = Number(raw)
    if (!Number.isFinite(n) || n < 0) return ""
    return `${Math.round(n)} ${Math.round(n) === 1 ? "item" : "items"}`
  }

  const hasHeader = Boolean(
    String(settings.sectionSubheading || "").trim() ||
      String(settings.sectionHeading || "").trim() ||
      String(settings.sectionDescription || "").trim(),
  )

  return (
    <div
      style={{
        position: "relative",
        overflow: "hidden",
        borderRadius: 12,
        background: sectionBg,
        color: ink,
        padding: compact ? "1.5rem 0.5rem 1.75rem" : "2.5rem 0.5rem 2.75rem",
        fontFamily: '"Manrope", "Helvetica Neue", sans-serif',
      }}
    >
      {hasHeader ? (
        <header style={{ textAlign: "center", marginBottom: compact ? 16 : 28, paddingInline: 12 }}>
          {settings.sectionSubheading ? (
            <div
              style={{
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: "0.24em",
                textTransform: "uppercase",
                color: "#8a6a3d",
                marginBottom: 8,
              }}
            >
              {settings.sectionSubheading}
            </div>
          ) : null}
          {settings.sectionHeading ? (
            <h2
              style={{
                margin: 0,
                fontFamily: '"Cormorant Garamond", "Times New Roman", serif',
                fontSize: compact ? 28 : 40,
                fontWeight: 500,
                lineHeight: 1.05,
                letterSpacing: "-0.02em",
              }}
            >
              {settings.sectionHeading}
            </h2>
          ) : null}
          {settings.sectionDescription ? (
            <p
              style={{
                margin: "10px auto 0",
                maxWidth: 420,
                fontSize: compact ? 13 : 15,
                lineHeight: 1.55,
                color: "#6a645c",
              }}
            >
              {settings.sectionDescription}
            </p>
          ) : null}
        </header>
      ) : null}

      <div
        style={{
          position: "relative",
          height: cardWidth * 1.4 + (compact ? 36 : 64),
          perspective: Number(settings.c3Perspective) || 1400,
        }}
      >
        {slides.map((slide, i) => {
          const offset = offsetFor(i, index)
          const abs = Math.abs(offset)
          if (abs > sideCount) return null
          const dir = offset === 0 ? 0 : offset > 0 ? 1 : -1
          const x = offset * spacingX * 0.72
          const z = abs === 0 ? 48 : -90 - abs * 40
          const rotateY = -dir * Math.min(abs, 1) * 34 - dir * Math.max(abs - 1, 0) * 12
          const scale = abs === 0 ? 1 : Math.max(0.72, 0.9 - abs * 0.08)
          const title = slide.heading || slide.title || "Collection"
          const description = String(slide.description || "").trim()
          const imageUrl = String(slide.imageUrl || "").trim()
          const countLabel = showCount ? formatCount(slide.subheading) : ""
          const ctaText = slide.ctaText || settings.exploreCtaText || "Explore Collection"
          return (
            <div
              key={slide.id || i}
              onClick={() => abs > 0 && onGoTo(wrapIndex(i))}
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                width: cardWidth,
                transform: `translate(-50%, -50%) translate3d(${x}px, 0, ${z}px) rotateY(${rotateY}deg) scale(${scale})`,
                transformOrigin: "center center",
                transition: "transform 450ms cubic-bezier(0.22, 1, 0.36, 1), opacity 450ms ease",
                opacity: abs > sideCount ? 0 : 1 - abs * 0.08,
                zIndex: 20 - abs,
                cursor: abs === 0 ? "default" : "pointer",
                filter: abs === 0 ? "none" : "brightness(0.78) saturate(0.88)",
              }}
            >
              <div
                style={{
                  position: "relative",
                  aspectRatio: "3 / 4",
                  borderRadius: radius,
                  overflow: "hidden",
                  background: "#2a2622",
                  color: "#fff",
                  boxShadow:
                    abs === 0
                      ? "0 8px 20px rgba(20,18,16,0.12), 0 28px 56px rgba(20,18,16,0.22)"
                      : "0 14px 32px rgba(20,18,16,0.14)",
                }}
              >
                {imageUrl ? (
                  <img
                    src={safeUrl(imageUrl)}
                    alt={title}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      transform: abs === 0 ? "scale(1)" : "scale(1.06)",
                      display: "block",
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: "100%",
                      height: "100%",
                      background: "linear-gradient(160deg, #3a342e 0%, #1e1b18 100%)",
                    }}
                  />
                )}
                <div
                  aria-hidden="true"
                  style={{
                    position: "absolute",
                    inset: 0,
                    background: `linear-gradient(180deg, rgba(20,18,16,${overlay * 0.15}) 0%, rgba(20,18,16,${overlay * 0.35}) 45%, rgba(20,18,16,${overlay * 1.05}) 100%)`,
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    left: 0,
                    right: 0,
                    bottom: 0,
                    padding: compact ? "0.85rem 0.8rem 1rem" : "1.1rem 1rem 1.15rem",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-start",
                    gap: 4,
                  }}
                >
                  {countLabel ? (
                    <div
                      style={{
                        fontSize: 10,
                        fontWeight: 600,
                        letterSpacing: "0.18em",
                        textTransform: "uppercase",
                        color: "rgba(255,255,255,0.7)",
                      }}
                    >
                      {countLabel}
                    </div>
                  ) : null}
                  <div
                    style={{
                      fontFamily: '"Cormorant Garamond", "Times New Roman", serif',
                      fontSize: compact ? 18 : 24,
                      fontWeight: 500,
                      lineHeight: 1.15,
                    }}
                  >
                    {title}
                  </div>
                  {abs === 0 && description ? (
                    <div style={{ fontSize: 12, lineHeight: 1.45, color: "rgba(255,255,255,0.78)", maxWidth: "28ch" }}>
                      {description}
                    </div>
                  ) : null}
                  {abs === 0 && settings.showShopNow !== false ? (
                    <span
                      style={{
                        marginTop: 8,
                        display: "inline-flex",
                        alignItems: "center",
                        minHeight: 32,
                        padding: "6px 12px",
                        fontSize: 11,
                        fontWeight: 700,
                        letterSpacing: "0.14em",
                        textTransform: "uppercase",
                        color: ink,
                        background: "#fff",
                        border: "1px solid #fff",
                      }}
                    >
                      {ctaText}
                    </span>
                  ) : null}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {(showNav || showDots) && (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 18, marginTop: 8 }}>
          {showNav ? (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 11 }}>
              <button
                type="button"
                onClick={onPrev}
                aria-label="Previous collection"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 44,
                  height: 44,
                  padding: 0,
                  borderRadius: "50%",
                  border: "1px solid rgba(20,18,16,0.08)",
                  background: "rgba(255,255,255,0.55)",
                  backdropFilter: "blur(8px)",
                  WebkitBackdropFilter: "blur(8px)",
                  cursor: "pointer",
                  color: ink,
                }}
              >
                <svg width="15" height="15" viewBox="0 0 16 16" aria-hidden="true" focusable="false">
                  <path
                    d="M10.2 2.2 4.4 8l5.8 5.8"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
              <button
                type="button"
                onClick={onNext}
                aria-label="Next collection"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 44,
                  height: 44,
                  padding: 0,
                  borderRadius: "50%",
                  border: "1px solid rgba(20,18,16,0.08)",
                  background: "rgba(255,255,255,0.55)",
                  backdropFilter: "blur(8px)",
                  WebkitBackdropFilter: "blur(8px)",
                  cursor: "pointer",
                  color: ink,
                }}
              >
                <svg width="15" height="15" viewBox="0 0 16 16" aria-hidden="true" focusable="false">
                  <path
                    d="M5.8 2.2 11.6 8l-5.8 5.8"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
          ) : null}
          {showDots ? (
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "center" }}>
              {slides.map((slide, i) => (
                <button
                  key={slide.id || i}
                  type="button"
                  aria-label={`Go to collection ${i + 1}`}
                  onClick={() => onGoTo(i)}
                  style={{
                    width: i === index ? 20 : 6.5,
                    height: 6.5,
                    borderRadius: 999,
                    border: 0,
                    padding: 0,
                    cursor: "pointer",
                    background: i === index ? ink : "rgba(20,18,16,0.2)",
                    transition: "width 200ms ease, background 200ms ease",
                  }}
                />
              ))}
            </div>
          ) : null}
        </div>
      )}
    </div>
  )
}

/** Standalone Premium coverflow / circular preview — does NOT reuse ProductCard / NavArrows / Slick dots */
function PremiumCoverflowPreview({
  slides,
  index,
  settings,
  compact,
  onPrev,
  onNext,
  onGoTo,
  variant = "coverflow",
}) {
  const circular = variant === "circular"
  // Mirrors the palette/typography each engine ships in its own stylesheet
  const ink = circular ? "#121417" : "#1a1816"
  const inkRgb = circular ? "31,41,51" : "26,24,22"
  const surface = circular ? "#f4f5f7" : "#f7f5f1"
  const surfaceAlt = circular ? "#e6e9ee" : "#e4e0d9"
  const inkSoft = circular ? "#98a4b0" : "#9a948c"
  const metal = circular ? "#9a8660" : "#8a6a3d"
  const displayFont = circular
    ? '"Libre Baskerville", Georgia, "Times New Roman", serif'
    : '"Cormorant Garamond", Georgia, "Times New Roman", serif'
  const bodyFont = circular
    ? 'Outfit, "Helvetica Neue", Arial, sans-serif'
    : 'Manrope, "Helvetica Neue", sans-serif'
  const stageRef = useRef(null)
  const [stageWidth, setStageWidth] = useState(compact ? 280 : 980)
  const showPrice = settings.showPrice !== false
  const showShopNow = settings.showShopNow !== false
  const showAddToCart = settings.showAddToCart !== false
  const shopLabel = "View product"
  const ctaBg = settings.ctaBackground || ink
  const ctaColor = settings.ctaTextColor || surface
  const ctaBorder = settings.ctaBorderColor || ctaBg
  const atcBg = settings.atcBackground || ctaBg
  const atcColor = settings.atcTextColor || ctaColor
  const atcBorder = settings.atcBorderColor || atcBg
  const btnRadius = Math.min(Math.max(Number(settings.ctaBorderRadius ?? 1), 0), 50)
  const sectionBgTransparent = settings.sectionBackgroundTransparent === true
  const sectionBgCustom = String(settings.sectionBackground || "").trim()
  const defaultSectionBg = circular
    ? "radial-gradient(90% 70% at 50% 18%, rgba(255,255,255,0.65) 0%, transparent 58%), linear-gradient(168deg, #e8e9eb 0%, #d5d7db 100%)"
    : "radial-gradient(120% 80% at 50% 0%, rgba(255,255,255,0.55) 0%, transparent 55%), linear-gradient(165deg, #ece8e2 0%, #d9d4cc 100%)"
  const sectionBackground = sectionBgTransparent
    ? "transparent"
    : sectionBgCustom
      ? sectionBgCustom
      : defaultSectionBg
  const len = slides.length
  const sideCount = compact ? 1 : circular ? 3 : 2
  const visibleOffsets = []
  for (let o = -sideCount; o <= sideCount; o += 1) visibleOffsets.push(o)

  useEffect(() => {
    const el = stageRef.current
    if (!el || typeof ResizeObserver === "undefined") return undefined
    const update = () => setStageWidth(Math.max(el.clientWidth || 0, compact ? 240 : 640))
    update()
    const observer = new ResizeObserver(update)
    observer.observe(el)
    return () => observer.disconnect()
  }, [compact])

  // Match storefront CSS: coverflow --cf-slide-width min(42vw, 340) / mobile min(72vw, 280)
  // circular --pcc-card-width min(38vw, 300) / mobile min(68vw, 260)
  const slideWidth = circular
    ? compact
      ? Math.min(Math.round(stageWidth * 0.68), 260)
      : Math.min(Math.round(stageWidth * 0.38), 300)
    : compact
      ? Math.min(Math.round(stageWidth * 0.72), 280)
      : Math.min(Math.round(stageWidth * 0.42), 340)
  // Circular geometry mirrors premium-circular.js DEFAULTS + its <=749px breakpoint caps
  const spacing = circular
    ? compact
      ? 132
      : 210
    : compact
      ? Math.min(Math.round(slideWidth * (280 / 340)), 210)
      : Math.round(slideWidth * (280 / 340))
  const depth = circular ? (compact ? 230 : 420) : compact ? 140 : 180
  const rotation = circular ? (compact ? 16 : 22) : compact ? 42 : 48
  const arcCurvature = compact ? 14 : 18
  const sideScale = circular ? (compact ? 0.9 : 0.88) : compact ? 0.82 : 0.78
  const scaleStep = circular ? 0.06 : 0.1
  const stagePadY = compact ? 36 : Math.round(Math.min(72, Math.max(40, slideWidth * 0.16)))
  const stageHeight = Math.round(slideWidth * (circular ? 1.6 : 1.55) + stagePadY * 2)

  const slideAt = (offset) => {
    if (!len) return null
    return slides[((index + offset) % len + len) % len]
  }

  const transformFor = (offset) => {
    const abs = Math.abs(offset)
    const dir = offset === 0 ? 0 : offset > 0 ? 1 : -1
    if (circular) {
      // Mirror premium-circular.js _transformForOffset
      const angleDeg = offset * arcCurvature
      const angleRad = (angleDeg * Math.PI) / 180
      const arcX = Math.sin(angleRad) * depth
      const arcZ = (Math.cos(angleRad) - 1) * depth
      const blend = 0.55
      const x = offset * spacing * (1 - blend) + arcX * blend
      let rotateY =
        -dir * Math.min(abs * rotation, rotation + Math.max(0, abs - 1) * (rotation * 0.35))
      rotateY = rotateY * 0.55 + -angleDeg * 0.45
      const scale =
        abs < 1
          ? 1 - (1 - sideScale) * abs
          : Math.max(sideScale - scaleStep * (abs - 1), 0.62)
      return {
        transform: `translate(-50%, -50%) translateX(${x}px) translateZ(${arcZ}px) rotateY(${rotateY}deg) scale(${scale})`,
        opacity: abs > sideCount ? 0 : 1,
        zIndex: 20 - abs,
        filter: abs === 0 ? "none" : "saturate(0.9) brightness(0.98)",
      }
    }
    // Mirror premium-coverflow.js _transformForOffset
    const rot =
      -dir * rotation * Math.min(abs, 1) - dir * rotation * 0.35 * Math.max(abs - 1, 0)
    let scale = Math.max(sideScale - scaleStep * Math.max(abs - 1, 0), 0.55)
    if (abs < 1) scale = 1 - (1 - sideScale) * abs
    return {
      transform: `translate(-50%, -50%) translateX(${offset * spacing}px) translateZ(${-depth * abs}px) rotateY(${rot}deg) scale(${scale})`,
      opacity: abs > sideCount ? 0 : 1,
      zIndex: 20 - abs,
      filter: abs === 0 ? "none" : "saturate(0.88) brightness(0.97)",
    }
  }

  const formatBadge = (slide) => {
    const mode = String(settings.salesBadgeMode || "automatic")
    if (mode === "off") return ""
    const n = Number(slide.saleDiscountPercent)
    if (!Number.isFinite(n) || n <= 0) return ""
    const text = String(settings.salesBadgeText || "OFF").trim() || "OFF"
    const format = String(settings.salesBadgeFormat || "percent-off")
    if (format === "percent") return `${Math.round(n)}%`
    if (format === "save-percent") return `Save ${Math.round(n)}%`
    if (format === "custom") {
      return (text || "{percent}% OFF").replace(/\{percent\}/gi, String(Math.round(n)))
    }
    return `${Math.round(n)}% ${text}`
  }

  return (
    <div
      style={{
        position: "relative",
        overflow: "hidden",
        borderRadius: 4,
        background: sectionBackground,
        padding: compact ? "28px 0 24px" : "48px 0 40px",
        color: ink,
        fontFamily: bodyFont,
      }}
    >
      <div
        ref={stageRef}
        style={{
          position: "relative",
          width: "100%",
          height: stageHeight,
          perspective: circular ? (compact ? 900 : 1400) : compact ? 1000 : 1200,
          perspectiveOrigin: "50% 45%",
          overflow: "visible",
        }}
      >
        <div
          style={{
            position: "relative",
            width: "100%",
            height: "100%",
            transformStyle: "preserve-3d",
          }}
        >
          {visibleOffsets.map((offset) => {
            const slide = slideAt(offset)
            if (!slide) return null
            const active = offset === 0
            const title = slide.heading || slide.title || "Product"
            const imageUrl = safeUrl(slide.imageUrl)
            const hoverImageUrl = safeUrl(slide.hoverImageUrl)
            const compareAt = String(slide.compareAtPrice || "").trim()
            const price = String(slide.description || "").trim()
            const badge = formatBadge(slide)
            const tf = transformFor(offset)
            const canQuickAdd = slide.availableForSale !== false && Boolean(slide.variantId || slide.ctaUrl || slide.subheading)
            return (
              <div
                key={`${slide.id}-off-${offset}`}
                role={active ? undefined : "button"}
                tabIndex={active ? -1 : 0}
                onClick={() => {
                  if (!active) onGoTo?.((((index + offset) % len) + len) % len)
                }}
                onKeyDown={(e) => {
                  if (!active && (e.key === "Enter" || e.key === " ")) {
                    e.preventDefault()
                    onGoTo?.((((index + offset) % len) + len) % len)
                  }
                }}
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  width: slideWidth,
                  margin: 0,
                  transformStyle: "preserve-3d",
                  transition: circular
                    ? "transform 650ms cubic-bezier(0.22, 1, 0.36, 1), opacity 650ms ease, filter 650ms ease"
                    : "transform 620ms cubic-bezier(0.22, 1, 0.36, 1), opacity 620ms ease, filter 620ms ease",
                  cursor: active ? "default" : "pointer",
                  ...tf,
                }}
              >
                <article
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    width: "100%",
                    background: circular ? "#ffffff" : surface,
                    border: `1px solid rgba(${inkRgb},0.09)`,
                    borderRadius: circular ? 4 : 2,
                    overflow: "hidden",
                    boxShadow: active
                      ? `0 ${circular ? 30 : 28}px ${circular ? 60 : 56}px rgba(${inkRgb}, 0.22)`
                      : `0 ${circular ? 16 : 18}px ${circular ? 38 : 40}px rgba(${inkRgb}, 0.14)`,
                  }}
                >
                  <div
                    className={hoverImageUrl ? "se-preview-pcf-media has-hover" : "se-preview-pcf-media"}
                    style={{ position: "relative", aspectRatio: "4 / 5", background: surfaceAlt, overflow: "hidden" }}
                  >
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={title}
                        style={{
                          display: "block",
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          transform: active ? "scale(1)" : "scale(1.01)",
                        }}
                      />
                    ) : null}
                    {hoverImageUrl ? (
                      <img
                        className="se-preview-pcf-hover-img"
                        src={hoverImageUrl}
                        alt=""
                        aria-hidden="true"
                        style={{
                          position: "absolute",
                          inset: 0,
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          opacity: 0,
                          pointerEvents: "none",
                          transition: "opacity 0.25s ease",
                        }}
                      />
                    ) : null}
                    {badge ? (
                      <span
                        style={{
                          position: "absolute",
                          top: 10,
                          left: 10,
                          zIndex: 2,
                          padding: "4px 7px",
                          fontSize: 9,
                          fontWeight: 700,
                          letterSpacing: "0.14em",
                          textTransform: "uppercase",
                          color: surface,
                          background: badge.toLowerCase().includes("sale") || badge.includes("%") ? metal : ink,
                          borderRadius: 1,
                        }}
                      >
                        {badge}
                      </span>
                    ) : null}
                    {canQuickAdd && active ? (
                      <span
                        className="se-preview-pcf-quick-add"
                        aria-hidden="true"
                        style={{
                          position: "absolute",
                          right: 10,
                          bottom: 10,
                          zIndex: 3,
                          padding: 6,
                          borderRadius: 4,
                          background: settings.quickAddBackground || "#170f49",
                          color: "#fff",
                          fontSize: 10,
                          fontWeight: 700,
                          opacity: 0,
                          transition: "opacity 0.18s ease",
                        }}
                      >
                        {String(settings.quickAddText || "").trim() || "＋"}
                      </span>
                    ) : null}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      textAlign: "center",
                      gap: 9,
                      padding: compact ? "14px 14px 16px" : "18px 18px 20px",
                      opacity: active ? 1 : 0.72,
                    }}
                  >
                    <h4
                      style={{
                        margin: 0,
                        fontFamily: displayFont,
                        fontSize: compact ? 18 : circular ? 20 : 22,
                        fontWeight: circular ? 400 : 500,
                        lineHeight: 1.25,
                        letterSpacing: "0.01em",
                        color: ink,
                      }}
                    >
                      {title}
                    </h4>
                    {showPrice && price ? (
                      <p
                        style={{
                          margin: 0,
                          display: "flex",
                          alignItems: "baseline",
                          justifyContent: "center",
                          gap: 8,
                          fontSize: compact ? 12 : 13,
                          fontWeight: 600,
                          letterSpacing: "0.04em",
                          color: ink,
                        }}
                      >
                        <span>{price}</span>
                        {compareAt ? (
                          <span style={{ fontWeight: 500, color: inkSoft, textDecoration: "line-through" }}>
                            {compareAt}
                          </span>
                        ) : null}
                      </p>
                    ) : null}
                    {showAddToCart || showShopNow ? (
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "row",
                          flexWrap: "wrap",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 7,
                          width: "100%",
                          marginTop: 4,
                        }}
                      >
                        {showAddToCart ? (
                          <span
                            style={{
                              display: "inline-flex",
                              flex: "0 0 auto",
                              alignItems: "center",
                              justifyContent: "center",
                              minHeight: compact ? 36 : 40,
                              padding: compact ? "8px 14px" : "10px 20px",
                              fontSize: compact ? 10 : 11,
                              fontWeight: 700,
                              letterSpacing: "0.16em",
                              textTransform: "uppercase",
                              color: atcColor,
                              background: atcBg,
                              border: `1px solid ${atcBorder}`,
                              borderRadius: btnRadius,
                              whiteSpace: "nowrap",
                            }}
                          >
                            {settings.addToCartText || "Add to cart"}
                          </span>
                        ) : null}
                        {showShopNow ? (
                          <span
                            style={{
                              display: "inline-flex",
                              flex: "0 0 auto",
                              alignItems: "center",
                              justifyContent: "center",
                              minHeight: compact ? 36 : 40,
                              padding: compact ? "8px 14px" : "10px 20px",
                              fontSize: compact ? 10 : 11,
                              fontWeight: 700,
                              letterSpacing: "0.16em",
                              textTransform: "uppercase",
                              color: ctaColor,
                              background: ctaBg,
                              border: `1px solid ${ctaBorder}`,
                              borderRadius: btnRadius,
                              whiteSpace: "nowrap",
                            }}
                          >
                            {slide.ctaText || shopLabel}
                          </span>
                        ) : null}
                      </div>
                    ) : null}
                  </div>
                </article>
              </div>
            )
          })}
        </div>
      </div>

      {len > 1 ? (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: compact ? 12 : 16,
            marginTop: compact ? 8 : 12,
          }}
        >
          <div style={{ display: "flex", gap: 10 }}>
            <button
              type="button"
              aria-label="Previous product"
              onClick={onPrev}
              style={{
                width: 40,
                height: 40,
                borderRadius: "50%",
                border: `1px solid rgba(${inkRgb},0.09)`,
                background: circular ? "rgba(255,255,255,0.72)" : "rgba(247,245,241,0.72)",
                color: ink,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true">
                <path
                  d="M10.2 2.2 4.4 8l5.8 5.8"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <button
              type="button"
              aria-label="Next product"
              onClick={onNext}
              style={{
                width: 40,
                height: 40,
                borderRadius: "50%",
                border: `1px solid rgba(${inkRgb},0.09)`,
                background: circular ? "rgba(255,255,255,0.72)" : "rgba(247,245,241,0.72)",
                color: ink,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true">
                <path
                  d="M5.8 2.2 11.6 8l-5.8 5.8"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 6, maxWidth: 280 }}>
            {slides.map((slide, i) => {
              const active = i === index
              return (
                <button
                  key={`${circular ? "pcc" : "pcf"}-dot-${slide.id}-${i}`}
                  type="button"
                  aria-label={`Go to product ${i + 1}`}
                  aria-current={active ? "true" : undefined}
                  onClick={() => onGoTo?.(i)}
                  style={{
                    width: active ? 18 : 7,
                    height: 7,
                    padding: 0,
                    border: 0,
                    borderRadius: 999,
                    background: active ? ink : `rgba(${inkRgb},0.22)`,
                    cursor: "pointer",
                    transition: "width 200ms ease, background-color 200ms ease",
                  }}
                />
              )
            })}
          </div>
        </div>
      ) : null}
    </div>
  )
}

function NavArrows({ onPrev, onNext, settings, show, offset = 10, variant = "default" }) {
  if (!show) return null
  const soft = variant === "soft"
  const btn = {
    position: "absolute",
    zIndex: 6,
    width: 34,
    height: 34,
    borderRadius: "50%",
    border: soft ? "1px solid #e7e7e7" : "none",
    cursor: "pointer",
    background: settings.arrowBg || "rgba(18,24,38,0.55)",
    color: settings.arrowColor || "#fff",
    fontSize: 18,
    top: "50%",
    transform: "translateY(-50%)",
    boxShadow: soft ? "0 8px 20px rgba(23, 15, 73, 0.08)" : undefined,
  }
  return (
    <>
      <button type="button" aria-label="Previous" onClick={onPrev} style={{ ...btn, left: offset }}>
        ‹
      </button>
      <button type="button" aria-label="Next" onClick={onNext} style={{ ...btn, right: offset }}>
        ›
      </button>
    </>
  )
}

function Dots({ slides, index, setIndex, color, gap, position = "center", pageSize = 1 }) {
  const size = Math.max(1, Number(pageSize) || 1)
  const pageCount = Math.ceil(slides.length / size)
  if (pageCount < 2) return null
  const activePage = Math.min(pageCount - 1, Math.floor(index / size))
  const justify = position === "left" ? "flex-start" : position === "right" ? "flex-end" : "center"
  return (
    <div style={{ display: "flex", justifyContent: justify, gap: 7, marginTop: gap ?? 12, padding: "0 10px" }}>
      {Array.from({ length: pageCount }, (_, i) => (
        <button
          key={slides[i * size]?.id || i}
          type="button"
          aria-label={`Go to page ${i + 1}`}
          onClick={() => setIndex(i * size)}
          style={{
            width: i === activePage ? 18 : 8,
            height: 8,
            borderRadius: 999,
            border: "none",
            padding: 0,
            cursor: "pointer",
            background: color || "#2c4a6e",
            opacity: i === activePage ? 1 : 0.35,
            transition: "width 0.2s ease, opacity 0.2s ease",
          }}
        />
      ))}
    </div>
  )
}

function ProgressBar({ active, durationMs, color, resetKey }) {
  if (!active) return null
  return (
    <div style={{ height: 3, width: "100%", background: "rgba(255,255,255,0.22)", overflow: "hidden", marginTop: 8, borderRadius: 999 }}>
      <div
        key={resetKey}
        style={{
          height: "100%",
          width: "100%",
          background: color || "#ffffff",
          transformOrigin: "left center",
          animation: `seProgressBar ${Math.max(800, Number(durationMs) || 3200)}ms linear forwards`,
        }}
      />
    </div>
  )
}

function PhoneChrome({ children }) {
  return (
    <div
      style={{
        maxWidth: 320,
        margin: "0 auto",
        width: "100%",
        padding: 12,
        borderRadius: 36,
        background: "linear-gradient(160deg, #1f2937 0%, #111827 55%, #0b1220 100%)",
        boxShadow: "0 25px 50px rgba(15,23,42,0.28)",
      }}
    >
      <div style={{ position: "relative", borderRadius: 28, overflow: "hidden", background: "#000", border: "2px solid #374151" }}>
        <div
          style={{
            position: "absolute",
            top: 8,
            left: "50%",
            transform: "translateX(-50%)",
            width: 96,
            height: 22,
            borderRadius: 999,
            background: "#0b1220",
            zIndex: 3,
          }}
        />
        <div style={{ paddingTop: 28, paddingBottom: 12, paddingLeft: 8, paddingRight: 8, background: "#fff" }}>{children}</div>
        <div style={{ width: 108, height: 4, borderRadius: 999, background: "#4b5563", margin: "0 auto 10px" }} />
      </div>
    </div>
  )
}

const LAPTOP_SCREEN_WIDTH = 1440

function LaptopChrome({ children }) {
  const shellRef = useRef(null)
  const screenRef = useRef(null)
  const [scale, setScale] = useState(1)
  const [screenHeight, setScreenHeight] = useState(320)

  useEffect(() => {
    const shell = shellRef.current
    const screen = screenRef.current
    if (!shell || typeof ResizeObserver === "undefined") return undefined

    const update = () => {
      const available = Math.max(shell.clientWidth - 20, 160)
      setScale(Math.min(1, available / LAPTOP_SCREEN_WIDTH))
      if (screenRef.current) {
        setScreenHeight(Math.max(screenRef.current.offsetHeight || 0, 240))
      }
    }

    update()
    const observer = new ResizeObserver(update)
    observer.observe(shell)
    if (screen) observer.observe(screen)
    return () => observer.disconnect()
  }, [children])

  return (
    <div
      ref={shellRef}
      style={{
        width: "100%",
        margin: "0 auto",
        padding: "4px 2px 8px",
        filter: "drop-shadow(0 24px 40px rgba(15,23,42,0.2))",
      }}
    >
      <div
        style={{
          width: LAPTOP_SCREEN_WIDTH * scale + 20,
          margin: "0 auto",
          borderRadius: "12px 12px 6px 6px",
          background: "linear-gradient(160deg, #1f2937 0%, #111827 55%, #0b1220 100%)",
          padding: "9px 10px 7px",
          border: "1px solid #374151",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            marginBottom: 7,
            height: 10,
          }}
        >
          <span
            style={{
              width: 64,
              height: 5,
              borderRadius: 999,
              background: "#0b1220",
              border: "1px solid #374151",
            }}
          />
        </div>
        <div
          style={{
            width: LAPTOP_SCREEN_WIDTH * scale,
            height: screenHeight * scale,
            borderRadius: 5,
            overflow: "hidden",
            background: "#fff",
            border: "1px solid #1f2937",
            position: "relative",
          }}
        >
          <div
            ref={screenRef}
            style={{
              width: LAPTOP_SCREEN_WIDTH,
              transform: `scale(${scale})`,
              transformOrigin: "top left",
              padding: 24,
              background: "#fff",
              boxSizing: "border-box",
            }}
          >
            {children}
          </div>
        </div>
      </div>
      <div
        style={{
          margin: "0 auto",
          width: LAPTOP_SCREEN_WIDTH * scale + 20,
          height: 12,
          borderRadius: "0 0 8px 8px",
          background: "linear-gradient(180deg, #374151 0%, #1f2937 40%, #111827 100%)",
          border: "1px solid #4b5563",
          borderTop: "none",
          position: "relative",
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06)",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 3,
            left: "50%",
            transform: "translateX(-50%)",
            width: 56,
            height: 4,
            borderRadius: 2,
            background: "#0b1220",
            border: "1px solid #4b5563",
          }}
        />
      </div>
      <div
        style={{
          margin: "0 auto",
          width: Math.max(120, (LAPTOP_SCREEN_WIDTH * scale + 20) * 0.62),
          height: 7,
          borderRadius: "0 0 14px 14px",
          background: "linear-gradient(180deg, #1f2937 0%, #0b1220 100%)",
        }}
      />
    </div>
  )
}

const EFFECT_STYLES = `
@keyframes seFadeIn { from { opacity: 0; filter: brightness(0.9); } to { opacity: 1; filter: brightness(1); } }
@keyframes seSweepIn { from { opacity: 0.35; transform: translateX(28px); } to { opacity: 1; transform: translateX(0); } }
@keyframes seZoomIn { from { opacity: 0.15; transform: scale(1.18); } to { opacity: 1; transform: scale(1); } }
@keyframes seFlipIn { from { opacity: 0; transform: perspective(900px) rotateY(92deg) scale(0.94); } to { opacity: 1; transform: perspective(900px) rotateY(0) scale(1); } }
@keyframes seCubeIn { from { opacity: 0.2; transform: perspective(1000px) rotateX(78deg) translateY(36px); } to { opacity: 1; transform: perspective(1000px) rotateX(0) translateY(0); } }
@keyframes seRise { from { opacity: 0; transform: translateY(36px); } to { opacity: 1; transform: translateY(0); } }
@keyframes seKenBurns { 0% { transform: scale(1) translate(0,0); } 100% { transform: scale(1.16) translate(-1.5%, -1%); } }
@keyframes seMarquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
@keyframes seBlurIn { from { opacity: 0.4; filter: blur(14px) saturate(0.7); transform: scale(1.04); } to { opacity: 1; filter: blur(0) saturate(1); transform: scale(1); } }
@keyframes seWipeReveal {
  from { clip-path: polygon(0 0, 0 0, -18% 100%, 0 100%); }
  to { clip-path: polygon(0 0, 118% 0, 100% 100%, 0 100%); }
}
@keyframes seSplitLeft { from { transform: translateX(0); } to { transform: translateX(-102%); } }
@keyframes seSplitRight { from { transform: translateX(0); } to { transform: translateX(102%); } }
@keyframes seParallaxShift { from { transform: scale(1.14) translateX(-4%); } to { transform: scale(1.08) translateX(1%); } }
@keyframes seProgressBar { from { transform: scaleX(0); } to { transform: scaleX(1); } }

.se-fx-fade { animation: seFadeIn 0.7s cubic-bezier(0.22,1,0.36,1); }
.se-fx-slide { animation: seSweepIn 0.6s cubic-bezier(0.22,1,0.36,1); }
.se-fx-zoom { animation: seZoomIn 0.72s cubic-bezier(0.22,1,0.36,1); }
.se-fx-flip { animation: seFlipIn 0.78s cubic-bezier(0.22,1,0.36,1); transform-style: preserve-3d; }
.se-fx-cube { animation: seCubeIn 0.8s cubic-bezier(0.22,1,0.36,1); transform-style: preserve-3d; }
.se-fx-rise .se-rise-content > * { animation: seRise 0.62s cubic-bezier(0.22,1,0.36,1) both; }
.se-fx-rise .se-rise-content > *:nth-child(2) { animation-delay: 0.08s; }
.se-fx-rise .se-rise-content > *:nth-child(3) { animation-delay: 0.14s; }
.se-fx-rise .se-rise-content > *:nth-child(4) { animation-delay: 0.2s; }
.se-fx-ken img { animation: seKenBurns 5s ease-out forwards; transform-origin: center; will-change: transform; }
.se-fx-parallax img { animation: seParallaxShift 0.9s cubic-bezier(0.22,1,0.36,1) forwards; will-change: transform; }
.se-fx-blur { animation: seBlurIn 0.85s cubic-bezier(0.22,1,0.36,1); }
.se-fx-wipe { animation: seWipeReveal 0.85s cubic-bezier(0.65,0,0.35,1); }
.se-coverflow { perspective: 1400px; }
.se-split-shell { position: relative; overflow: hidden; border-radius: inherit; }
.se-split-panel {
  position: absolute; top: 0; bottom: 0; width: 52%; z-index: 4; pointer-events: none;
  background: linear-gradient(135deg, #121826, #2c4a6e);
}
.se-split-panel--left { left: 0; animation: seSplitLeft 0.75s cubic-bezier(0.65,0,0.35,1) forwards; }
.se-split-panel--right { right: 0; animation: seSplitRight 0.75s cubic-bezier(0.65,0,0.35,1) forwards; }
@media (hover: hover) and (pointer: fine) {
  .se-preview-product-card--has-hover:hover .se-preview-product-card__hover-img { opacity: 1 !important; }
  .se-preview-product-card:hover .se-preview-product-card__quick-add {
    opacity: 1 !important;
    transform: translateY(0) !important;
  }
  .se-preview-pcf-media.has-hover:hover .se-preview-pcf-hover-img { opacity: 1 !important; }
  .se-preview-pcf-media:hover .se-preview-pcf-quick-add { opacity: 1 !important; }
}
@media (prefers-reduced-motion: reduce) {
  .se-fx-fade, .se-fx-slide, .se-fx-zoom, .se-fx-flip, .se-fx-cube, .se-fx-rise .se-rise-content > *,
  .se-fx-ken img, .se-fx-parallax img, .se-fx-blur, .se-fx-wipe,
  .se-split-panel--left, .se-split-panel--right { animation: none !important; }
  .se-preview-product-card__hover-img { transition: none !important; }
}
`

export default function SliderPreview({
  slides = [],
  sliderType = "fade",
  settings,
  showDeviceToggle = true,
  useSampleWhenEmpty = true,
}) {
  const [device, setDevice] = useState("desktop")
  const [index, setIndex] = useState(0)
  const swipeRef = useRef({ x: 0, active: false })

  const mergedSettings = useMemo(() => mergeSliderSettings(sliderType, settings || {}), [sliderType, settings])
  const typeInfo = getSliderTypeInfo(sliderType)
  const effect = resolveSliderType(mergedSettings.effect || sliderType)
  const isHeroType = HERO_SLIDER_TYPES.includes(resolveSliderType(sliderType))
  const heroAnimation =
    isHeroType && mergedSettings.heroAnimation && mergedSettings.heroAnimation !== "none"
      ? mergedSettings.heroAnimation
      : null
  const motionFx = heroAnimation || effect
  const showGalleryThumbs = heroAnimation === "thumbnails" || effect === "thumbnails"
  const isVideoHero = heroAnimation === "hero-video" || effect === "hero-video"
  const entranceFx =
    heroAnimation && !["thumbnails", "hero-video"].includes(heroAnimation) ? heroAnimation : null

  const fxClassFor = (fx) => {
    switch (fx) {
      case "slide":
        return "se-fx-slide"
      case "zoom":
        return "se-fx-zoom"
      case "flip":
        return "se-fx-flip"
      case "cube":
        return "se-fx-cube"
      case "ken-burns":
        return "se-fx-ken"
      case "slide-up":
        return "se-fx-rise"
      case "parallax":
        return "se-fx-parallax"
      case "blur-reveal":
        return "se-fx-blur"
      case "wipe":
        return "se-fx-wipe"
      case "fade":
      default:
        return "se-fx-fade"
    }
  }

  const visibleSlides = useMemo(() => {
    const filtered = (slides || []).filter((slide) => slide && slide.isVisible !== false)
    if (filtered.length === 0 && useSampleWhenEmpty) return getSampleSlidesForType(sliderType)
    return filtered
  }, [slides, useSampleWhenEmpty, sliderType])

  const isSample =
    (!slides || slides.filter((s) => s?.isVisible !== false).length === 0) && useSampleWhenEmpty

  useEffect(() => {
    setIndex(0)
  }, [visibleSlides.length, sliderType])

  const compact = device === "mobile"
  const testimonialPageSize = compact
    ? Math.max(1, Number(mergedSettings.mobile?.slidesToShow) || 1)
    : Math.min(Math.max(Number(mergedSettings.slidesToShow) || 3, 1), 3)
  const navStep = effect === "testimonials" ? testimonialPageSize : 1

  useEffect(() => {
    if (effect === "marquee" || effect === "logo-grid") return undefined
    if (!mergedSettings.autoplay || visibleSlides.length < 2) return undefined
    const timer = setInterval(() => {
      setIndex((prev) => (prev + navStep) % visibleSlides.length)
    }, Number(mergedSettings.autoplaySpeed) || 3000)
    return () => clearInterval(timer)
  }, [mergedSettings.autoplay, mergedSettings.autoplaySpeed, visibleSlides.length, effect, navStep])

  if (visibleSlides.length === 0) {
    return (
      <div style={{ border: "1px dashed #c9cccf", borderRadius: 12, padding: "2.5rem 1.5rem", textAlign: "center", background: "#fafbfb" }}>
        <Text color="subdued">Add a slide to see the live preview.</Text>
      </div>
    )
  }

  const current = visibleSlides[Math.min(index, visibleSlides.length - 1)]
  const prevSlide = visibleSlides[(index - 1 + visibleSlides.length) % visibleSlides.length]
  const nextSlide = visibleSlides[(index + 1) % visibleSlides.length]
  const goPrev = () => setIndex((prev) => (prev - navStep + visibleSlides.length) % visibleSlides.length)
  const goNext = () => setIndex((prev) => (prev + navStep) % visibleSlides.length)
  const showArrows =
    mergedSettings.arrows !== false &&
    visibleSlides.length > 1 &&
    !["marquee", "logo-grid"].includes(effect)
  const showDots = mergedSettings.dots !== false && !showGalleryThumbs
  const dotsGap = isHeroType ? Number(mergedSettings.paginationOffset ?? 16) : Number(mergedSettings.paginationGap ?? 12)
  const dotsPosition = isHeroType ? mergedSettings.dotsPosition || "center" : "center"
  const showProgressBar = isHeroType && Boolean(mergedSettings.progressBar) && Boolean(mergedSettings.autoplay)
  const dotsPageSize = effect === "testimonials" ? testimonialPageSize : 1

  const renderDots = (gapOverride) => {
    if (!showDots) return null
    if (isHeroType) {
      return (
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 12,
            zIndex: 7,
            pointerEvents: "auto",
          }}
        >
          <Dots
            slides={visibleSlides}
            index={index}
            setIndex={setIndex}
            color={mergedSettings.dotColor || "#ffffff"}
            gap={0}
            position={dotsPosition}
            pageSize={1}
          />
        </div>
      )
    }
    return (
      <Dots
        slides={visibleSlides}
        index={index}
        setIndex={setIndex}
        color={mergedSettings.dotColor}
        gap={gapOverride ?? dotsGap}
        position={dotsPosition}
        pageSize={dotsPageSize}
      />
    )
  }

  const renderProgress = () => (
    <ProgressBar
      active={showProgressBar}
      durationMs={mergedSettings.autoplaySpeed}
      color={mergedSettings.progressBarColor}
      resetKey={`${index}-${mergedSettings.autoplaySpeed}`}
    />
  )

  const onPointerDown = (e) => {
    swipeRef.current = { x: e.clientX, active: true }
  }
  const onPointerUp = (e) => {
    if (!swipeRef.current.active) return
    const dx = e.clientX - swipeRef.current.x
    swipeRef.current.active = false
    if (Math.abs(dx) < 40) return
    if (dx < 0) goNext()
    else goPrev()
  }

  const renderSingleStage = (heightOverride, forceCompact = false, extraStyle = {}) => {
    const frame = (
      <SlideFrame
        slide={current}
        settings={{
          ...mergedSettings,
          borderRadius:
            effect === "hero-fullwidth" || isVideoHero ? 0 : mergedSettings.borderRadius,
        }}
        compact={forceCompact || compact}
        heightOverride={heightOverride}
        style={extraStyle}
        contentClassName={motionFx === "slide-up" ? "se-rise-content" : undefined}
        mediaClassName={
          isVideoHero || motionFx === "ken-burns" || motionFx === "parallax" ? "se-fx-ken" : undefined
        }
      />
    )

    if (motionFx === "split-panel") {
      return (
        <div key={`${current.id}-split`} className="se-split-shell se-fx-fade">
          {frame}
          <div className="se-split-panel se-split-panel--left" />
          <div className="se-split-panel se-split-panel--right" />
        </div>
      )
    }

    const fxKey =
      entranceFx ||
      (effect === "hero-fullwidth" || effect === "hero-boxed" || effect === "hero-video" ? "fade" : effect)

    return (
      <div key={`${current.id}-${fxKey}-${heroAnimation || "layout"}`} className={fxClassFor(fxKey)}>
        {frame}
      </div>
    )
  }

  const renderGalleryThumbs = () => {
    if (!showGalleryThumbs) return null
    return (
      <div style={{ display: "flex", gap: 8, marginTop: 12, justifyContent: "center", flexWrap: "wrap" }}>
        {visibleSlides.map((slide, i) => (
          <button
            key={`thumb-${slide.id}`}
            type="button"
            onClick={() => setIndex(i)}
            style={{
              width: 72,
              height: 52,
              borderRadius: 8,
              overflow: "hidden",
              border: i === index ? "2px solid #ed8104" : "2px solid transparent",
              padding: 0,
              cursor: "pointer",
              opacity: i === index ? 1 : 0.7,
            }}
          >
            <img
              src={safeUrl(slide.imageUrl) || ""}
              alt=""
              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
            />
          </button>
        ))}
      </div>
    )
  }

  const withGalleryThumbs = (node) => {
    if (!showGalleryThumbs || !node) return node
    return (
      <div style={{ position: "relative" }}>
        {node}
        {renderGalleryThumbs()}
      </div>
    )
  }

  const renderPremiumStage = () => {
    if (["hero-fullwidth", "hero-video"].includes(effect)) {
      const h = compact ? Math.min(Number(mergedSettings.height) || 680, 250) : Math.min(Number(mergedSettings.height) || 680, 560)
      const heroFx = entranceFx || "fade"
      return (
        <div style={{ position: "relative" }} onPointerDown={onPointerDown} onPointerUp={onPointerUp}>
          <div
            key={`${current.id}-${effect}-${heroFx}-${isVideoHero ? "video" : "image"}`}
            className={heroAnimation === "split-panel" ? "se-split-shell se-fx-fade" : fxClassFor(heroFx)}
            style={{ position: "relative" }}
          >
            <HeroFrame
              slide={current}
              settings={mergedSettings}
              compact={compact}
              heightOverride={h}
              video={isVideoHero}
            />
            {heroAnimation === "split-panel" ? (
              <>
                <div className="se-split-panel se-split-panel--left" />
                <div className="se-split-panel se-split-panel--right" />
              </>
            ) : null}
          </div>
          <NavArrows onPrev={goPrev} onNext={goNext} settings={mergedSettings} show={showArrows} />
          {renderDots()}
        </div>
      )
    }

    if (isVideoHero && ["hero-boxed", "autoplay", "center"].includes(effect)) {
      const h = compact
        ? Math.min(Number(mergedSettings.height) || 560, 250)
        : Math.min(Number(mergedSettings.height) || 560, effect === "hero-boxed" ? 460 : 560)
      const heroFx = entranceFx || "fade"
      return (
        <div style={{ position: "relative" }} onPointerDown={onPointerDown} onPointerUp={onPointerUp}>
          <div
            key={`${current.id}-video-anim-${heroFx}`}
            className={heroAnimation === "split-panel" ? "se-split-shell se-fx-fade" : fxClassFor(heroFx)}
            style={{ position: "relative" }}
          >
            <HeroFrame
              slide={current}
              settings={mergedSettings}
              compact={compact}
              heightOverride={h}
              video
              boxed={effect === "hero-boxed"}
            />
            {heroAnimation === "split-panel" ? (
              <>
                <div className="se-split-panel se-split-panel--left" />
                <div className="se-split-panel se-split-panel--right" />
              </>
            ) : null}
          </div>
          <NavArrows onPrev={goPrev} onNext={goNext} settings={mergedSettings} show={showArrows} />
          {renderDots()}
        </div>
      )
    }

    if (effect === "hero-boxed") {
      const h = compact ? 220 : Math.min(Number(mergedSettings.height) || 560, 460)
      const heroFx = entranceFx || "fade"
      return (
        <div style={{ position: "relative" }} onPointerDown={onPointerDown} onPointerUp={onPointerUp}>
          <div
            key={`${current.id}-boxed-${heroFx}`}
            className={heroAnimation === "split-panel" ? "se-split-shell se-fx-fade" : fxClassFor(heroFx)}
            style={{ position: "relative" }}
          >
            <HeroFrame slide={current} settings={mergedSettings} compact={compact} heightOverride={h} boxed />
            {heroAnimation === "split-panel" ? (
              <>
                <div className="se-split-panel se-split-panel--left" />
                <div className="se-split-panel se-split-panel--right" />
              </>
            ) : null}
          </div>
          <NavArrows onPrev={goPrev} onNext={goNext} settings={mergedSettings} show={showArrows} />
          {renderDots()}
        </div>
      )
    }

    if (effect === "premium-coverflow" || effect === "premium-circular") {
      return (
        <PremiumCoverflowPreview
          slides={visibleSlides}
          index={index}
          settings={mergedSettings}
          compact={compact}
          onPrev={goPrev}
          onNext={goNext}
          onGoTo={(i) => setIndex(i)}
          variant={effect === "premium-circular" ? "circular" : "coverflow"}
        />
      )
    }

    if (effect === "collection-carousel") {
      return (
        <CollectionCarouselPreview
          slides={visibleSlides}
          index={index}
          settings={mergedSettings}
          compact={compact}
          onPrev={goPrev}
          onNext={goNext}
          onGoTo={(i) => setIndex(i)}
        />
      )
    }

    if (["product-carousel", "collection-rail"].includes(effect)) {
      const desktopCount = effect === "collection-rail" ? 5 : 4
      const mobileCount = Math.max(1, Number(mergedSettings.mobile?.slidesToShow) || 1)
      const count = compact ? mobileCount : Number(mergedSettings.slidesToShow) || desktopCount
      const cards = Array.from({ length: Math.min(count, visibleSlides.length) }, (_, offset) =>
        visibleSlides[(index + offset) % visibleSlides.length],
      )
      return (
        <div style={{ position: "relative" }}>
          <SectionHeading
            text={mergedSettings.sectionHeading}
            compact={compact}
            fontSize={mergedSettings.sectionHeadingFontSize}
            gap={mergedSettings.sectionHeadingGap}
          />
          <div style={{ display: "grid", gridTemplateColumns: `repeat(${cards.length}, minmax(0, 1fr))`, gap: 12, alignItems: "stretch" }}>
            {cards.map((slide, i) => (
              <div key={`${slide.id}-pc-${i}`} style={{ height: "100%", display: "flex" }}>
                <div style={{ width: "100%", display: "flex" }}>
                  <ProductCard
                    slide={slide}
                    settings={mergedSettings}
                    compact={compact || effect === "collection-rail"}
                    reserveTitleSpace={false}
                  />
                </div>
              </div>
            ))}
          </div>
          <NavArrows onPrev={goPrev} onNext={goNext} settings={mergedSettings} show={showArrows} />
          {renderDots(mergedSettings.paginationGap ?? 16)}
        </div>
      )
    }

    if (effect === "product-showcase") {
      const items = [prevSlide, current, nextSlide]
      return (
        <div style={{ position: "relative", padding: "8px 0" }}>
          <SectionHeading
            text={mergedSettings.sectionHeading}
            compact={compact}
            fontSize={mergedSettings.sectionHeadingFontSize}
            gap={mergedSettings.sectionHeadingGap}
          />
          <div style={{ display: "grid", gridTemplateColumns: compact ? "1fr" : "0.85fr 1.2fr 0.85fr", gap: 12, alignItems: "center" }}>
            {(compact ? [current] : items).map((slide, i) => {
              const active = compact || i === 1
              return (
                <div key={`${slide.id}-ps-${i}`} style={{ opacity: active ? 1 : 0.72, transition: "opacity 0.3s ease" }}>
                  <ProductCard
                    slide={slide}
                    settings={mergedSettings}
                    compact={!active || compact}
                    featured={active}
                    reserveTitleSpace={false}
                  />
                </div>
              )
            })}
          </div>
          <NavArrows onPrev={goPrev} onNext={goNext} settings={mergedSettings} show={showArrows} />
          {renderDots(mergedSettings.paginationGap ?? 16)}
        </div>
      )
    }

    if (effect === "testimonials") {
      const count = testimonialPageSize
      const cards = Array.from({ length: Math.min(count, visibleSlides.length) }, (_, offset) =>
        visibleSlides[(index + offset) % visibleSlides.length],
      )
      const sliderWidth = Math.min(Math.max(Number(mergedSettings.width) || 1100, 320), 1600)
      const cardRadius = mergedSettings.borderRadius ?? 16
      const cardHeight = compact
        ? Math.min(Math.max(Number(mergedSettings.height) || 280, 160), 220)
        : Math.min(Math.max(Number(mergedSettings.height) || 280, 160), 520)
      const arrowSettings = {
        ...mergedSettings,
        arrowBg: mergedSettings.arrowBg || "#ffffff",
        arrowColor: mergedSettings.arrowColor || "#170f49",
      }
      return (
        <div
          style={{
            position: "relative",
            maxWidth: compact ? "100%" : sliderWidth,
            width: "100%",
            margin: "0 auto",
            paddingInline: showArrows ? (compact ? 36 : 48) : 0,
            boxSizing: "border-box",
          }}
          onPointerDown={onPointerDown}
          onPointerUp={onPointerUp}
        >
          <div
            key={`t-page-${index}`}
            className="se-fx-fade"
            style={{
              display: "grid",
              gridTemplateColumns: `repeat(${cards.length}, minmax(0, 1fr))`,
              gap: compact ? 12 : 24,
              alignItems: "stretch",
              ...(cards.length === 1 && !compact ? { maxWidth: 420, marginInline: "auto" } : {}),
            }}
          >
            {cards.map((slide, i) => (
              <div
                key={`${slide.id}-t-${i}`}
                style={{
                  border: "1px solid #e8e8ef",
                  borderRadius: cardRadius,
                  background: "#fff",
                  boxShadow: "0 10px 28px rgba(23, 15, 73, 0.055)",
                  padding: compact ? "1.25rem 1.1rem" : "1.5rem 1.35rem",
                  textAlign: "center",
                  color: "#170f49",
                  height: cardHeight,
                  minHeight: cardHeight,
                  maxHeight: cardHeight,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 14,
                  boxSizing: "border-box",
                }}
              >
                <div style={{ fontSize: compact ? 26 : 32, lineHeight: 1, color: "#ed8104", fontWeight: 700, flexShrink: 0 }}>
                  &ldquo;
                </div>
                <p
                  style={{
                    margin: 0,
                    maxWidth: "22rem",
                    width: "100%",
                    fontSize: compact ? "0.92rem" : "1.05rem",
                    lineHeight: 1.55,
                    fontWeight: 500,
                    textAlign: "center",
                  }}
                >
                  {slide.heading || slide.title || "Customer quote"}
                </p>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, marginTop: 4, flexShrink: 0 }}>
                  {safeUrl(slide.imageUrl) ? (
                    <img
                      src={safeUrl(slide.imageUrl)}
                      alt=""
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: "50%",
                        objectFit: "cover",
                        border: "2px solid #f0f0f4",
                        flexShrink: 0,
                      }}
                    />
                  ) : null}
                  <div style={{ textAlign: "left" }}>
                    <div style={{ fontWeight: 650, fontSize: "0.9rem" }}>{slide.subheading || "Customer"}</div>
                    {slide.description ? (
                      <div style={{ fontSize: "0.8rem", color: "#5f5a72", marginTop: 2 }}>{slide.description}</div>
                    ) : null}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <NavArrows
            onPrev={goPrev}
            onNext={goNext}
            settings={arrowSettings}
            show={showArrows}
            offset={4}
            variant="soft"
          />
          {renderDots(mergedSettings.paginationGap ?? 18)}
        </div>
      )
    }

    if (effect === "logo-grid") {
      const loop = [...visibleSlides, ...visibleSlides]
      const logoW = Math.min(Math.max(Number(mergedSettings.logoWidth ?? 140), 40), 280)
      const logoH = Math.min(Math.max(Number(mergedSettings.logoHeight ?? 64), 24), 160)
      const cardW = compact ? Math.round(logoW * 0.78) : logoW
      const cardH = compact ? Math.round(logoH * 0.9) : logoH
      const logoGridFullWidth = mergedSettings.logoGridFullWidth !== false
      const logoGridWidth = Math.min(Math.max(Number(mergedSettings.width) || 1100, 320), 1600)
      const logoGridTransparent = mergedSettings.logoGridTransparent === true
      const logoGridCustomBg = String(mergedSettings.logoGridBackground || "").trim()
      const logoGridBg = logoGridTransparent
        ? "transparent"
        : logoGridCustomBg || "linear-gradient(120deg, #fff8f0 0%, #f7f2ff 48%, #eef8ff 100%)"
      return (
        <div
          style={{
            overflow: "hidden",
            borderRadius: 16,
            border: logoGridTransparent ? "none" : "1px solid #ebe4f5",
            background: logoGridBg,
            padding: compact ? "0.85rem 0" : "1.15rem 0",
            boxShadow: logoGridTransparent ? "none" : "inset 0 1px 0 rgba(255,255,255,0.8)",
            maxWidth: logoGridFullWidth ? "100%" : Math.min(logoGridWidth, 1600),
            width: "100%",
            marginInline: "auto",
            boxSizing: "border-box",
          }}
        >
          <div
            style={{
              display: "flex",
              gap: compact ? 12 : 16,
              width: "max-content",
              animation: "seMarquee 18s linear infinite",
              alignItems: "center",
              paddingInline: 12,
            }}
          >
            {loop.map((slide, i) => {
              const logoSrc = safeUrl(slide.imageUrl)
              return (
                <div
                  key={`${slide.id}-logo-${i}`}
                  style={{
                    width: cardW + 28,
                    height: cardH + 20,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "#ffffff",
                    borderRadius: 14,
                    border: "1px solid rgba(23, 15, 73, 0.07)",
                    boxShadow: "0 6px 18px rgba(23, 15, 73, 0.07)",
                    padding: "10px 14px",
                    flex: "0 0 auto",
                    boxSizing: "border-box",
                  }}
                >
                  {logoSrc ? (
                    <img
                      src={logoSrc}
                      alt=""
                      style={{ maxWidth: cardW, maxHeight: cardH, width: "auto", height: "auto", objectFit: "contain", display: "block" }}
                    />
                  ) : (
                    <div
                      aria-hidden
                      style={{
                        width: Math.round(cardW * 0.7),
                        height: Math.round(cardH * 0.55),
                        borderRadius: 8,
                        background: "linear-gradient(135deg, #ffd6a5, #c4b5fd, #93c5fd)",
                      }}
                    />
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )
    }

    if (effect === "stories") {
      return (
        <div style={{ position: "relative" }}>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", overflowX: "auto", paddingBottom: 12 }}>
            {visibleSlides.map((slide, i) => (
              <button
                key={`story-ring-${slide.id}`}
                type="button"
                onClick={() => setIndex(i)}
                style={{
                  border: "none",
                  background: "transparent",
                  padding: 0,
                  cursor: "pointer",
                  textAlign: "center",
                  width: 72,
                  flex: "0 0 auto",
                }}
              >
                <div
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: "50%",
                    padding: 3,
                    background: i === index ? "linear-gradient(135deg, #ed8104, #170f49)" : "linear-gradient(135deg, #d1d5db, #9ca3af)",
                    margin: "0 auto",
                  }}
                >
                  <div style={{ width: "100%", height: "100%", borderRadius: "50%", overflow: "hidden", border: "2px solid #fff", background: "#f3f4f6" }}>
                    {safeUrl(slide.imageUrl) ? (
                      <img src={safeUrl(slide.imageUrl)} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : null}
                  </div>
                </div>
                <div style={{ marginTop: 6, fontSize: 11, fontWeight: 600, color: "#170f49", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {slide.heading || slide.title || `Story ${i + 1}`}
                </div>
              </button>
            ))}
          </div>
          <div style={{ position: "relative", maxWidth: 360, margin: "0 auto" }}>
            <div style={{ height: 3, background: "#e7e7e7", borderRadius: 999, overflow: "hidden", marginBottom: 10 }}>
              <div style={{ width: `${((index + 1) / visibleSlides.length) * 100}%`, height: "100%", background: "#ed8104", transition: "width 0.3s ease" }} />
            </div>
            <SlideFrame
              slide={current}
              settings={{ ...mergedSettings, borderRadius: 18 }}
              compact
              heightOverride={compact ? 280 : 420}
            />
            <NavArrows onPrev={goPrev} onNext={goNext} settings={mergedSettings} show={showArrows} />
          </div>
        </div>
      )
    }

    if (effect === "announcement") {
      return (
        <div style={{ position: "relative" }}>
          <div
            className="se-fx-fade"
            key={current.id}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 12,
              minHeight: Number(mergedSettings.height) || 48,
              height: Number(mergedSettings.height) || 48,
              padding: showArrows ? "0 2.5rem" : "0 1rem",
              boxSizing: "border-box",
              overflow: "hidden",
              background: mergedSettings.ctaBackground || "#170f49",
              color: current.textColor || mergedSettings.ctaTextColor || "#fff",
              borderRadius: mergedSettings.borderRadius ?? 0,
              textAlign: "center",
              flexWrap: "wrap",
            }}
          >
            <span style={{ fontSize: compact ? "0.82rem" : "0.92rem", fontWeight: 600 }}>
              {current.heading || current.title || "Announcement"}
            </span>
            {current.ctaText || current.cta2Text ? (
              <span style={{ display: "inline-flex", flexWrap: "wrap", gap: 6 }}>
                {current.ctaText ? (
                  <span
                    style={{
                      display: "inline-flex",
                      padding: "0.25rem 0.65rem",
                      borderRadius: 999,
                      border: "1px solid rgba(255,255,255,0.45)",
                      fontSize: "0.75rem",
                      fontWeight: 700,
                    }}
                  >
                    {current.ctaText}
                  </span>
                ) : null}
                {current.cta2Text ? (
                  <span
                    style={{
                      display: "inline-flex",
                      padding: "0.25rem 0.65rem",
                      borderRadius: 999,
                      border: "1px solid rgba(255,255,255,0.45)",
                      fontSize: "0.75rem",
                      fontWeight: 700,
                      background: "transparent",
                    }}
                  >
                    {current.cta2Text}
                  </span>
                ) : null}
              </span>
            ) : null}
          </div>
          <NavArrows
            onPrev={goPrev}
            onNext={goNext}
            settings={{
              ...mergedSettings,
              arrowBg: mergedSettings.arrowBg || "rgba(255,255,255,0.14)",
              arrowColor: mergedSettings.arrowColor || "#ffffff",
            }}
            show={showArrows}
            offset={6}
          />
        </div>
      )
    }

    return null
  }

  const renderStage = () => {
    const premium = renderPremiumStage()
    if (premium) return premium

    if (compact) {
      return (
        <div style={{ position: "relative", touchAction: "pan-y" }} onPointerDown={onPointerDown} onPointerUp={onPointerUp}>
          {renderSingleStage(Math.min(Number(mergedSettings.height) || 640, 240))}
          <NavArrows onPrev={goPrev} onNext={goNext} settings={mergedSettings} show={showArrows} />
          {renderDots()}
        </div>
      )
    }

    if (effect === "marquee") {
      const loop = [...visibleSlides, ...visibleSlides]
      return (
        <div style={{ overflow: "hidden", borderRadius: 14 }}>
          <div
            style={{
              display: "flex",
              gap: 12,
              width: "max-content",
              animation: "seMarquee 18s linear infinite",
            }}
          >
            {loop.map((slide, i) => (
              <div key={`${slide.id}-m-${i}`} style={{ width: 280, flex: "0 0 auto" }}>
                <SlideFrame slide={slide} settings={mergedSettings} compact heightOverride={220} />
              </div>
            ))}
          </div>
        </div>
      )
    }

    if (["coverflow", "center"].includes(effect)) {
      const items = [prevSlide, current, nextSlide]
      return (
        <div className="se-coverflow" style={{ position: "relative", padding: "12px 0" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1.25fr 1fr", gap: 10, alignItems: "center" }}>
            {items.map((slide, i) => {
              const active = i === 1
              const side = i === 0 ? -1 : i === 2 ? 1 : 0
              let transform = "scale(0.88)"
              let opacity = 0.55
              if (active) {
                transform = "scale(1)"
                opacity = 1
              } else if (effect === "coverflow") {
                transform = `scale(0.8) rotateY(${side * 32}deg) translateZ(-48px)`
                opacity = 0.62
              } else {
                transform = "scale(0.9)"
                opacity = 0.48
              }
              return (
                <div
                  key={`${slide.id}-${i}`}
                  className={active && entranceFx ? fxClassFor(entranceFx) : undefined}
                  style={{
                    transform,
                    opacity,
                    transition: "transform 0.6s cubic-bezier(0.22,1,0.36,1), opacity 0.45s ease",
                    zIndex: active ? 2 : 1,
                  }}
                >
                  <SlideFrame slide={slide} settings={mergedSettings} compact={!active} heightOverride={active ? 320 : 240} />
                </div>
              )
            })}
          </div>
          <NavArrows onPrev={goPrev} onNext={goNext} settings={mergedSettings} show={showArrows} />
          {renderDots()}
        </div>
      )
    }

    if (effect === "autoplay") {
      const trio = [0, 1, 2].map((offset) => visibleSlides[(index + offset) % visibleSlides.length])
      return (
        <div style={{ position: "relative" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
            {trio.map((slide, i) => (
              <div key={`${slide.id}-g-${i}`} className={fxClassFor(entranceFx || "slide")}>
                <SlideFrame slide={slide} settings={mergedSettings} compact heightOverride={230} />
              </div>
            ))}
          </div>
          <NavArrows onPrev={goPrev} onNext={goNext} settings={mergedSettings} show={showArrows} />
          {renderDots()}
        </div>
      )
    }

    if (effect === "variable-width") {
      const widths = ["36%", "48%", "28%"]
      const trio = [0, 1, 2].map((offset) => visibleSlides[(index + offset) % visibleSlides.length])
      return (
        <div style={{ position: "relative" }}>
          <div style={{ display: "flex", gap: 12, overflow: "hidden" }}>
            {trio.map((slide, i) => (
              <div key={`${slide.id}-vw-${i}`} style={{ flex: `0 0 ${widths[i]}`, minWidth: 0 }} className="se-fx-slide">
                <SlideFrame slide={slide} settings={mergedSettings} compact heightOverride={240} />
              </div>
            ))}
          </div>
          <NavArrows onPrev={goPrev} onNext={goNext} settings={mergedSettings} show={showArrows} />
        </div>
      )
    }

    if (effect === "vertical") {
      return (
        <div style={{ position: "relative", maxWidth: 520, margin: "0 auto" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div className="se-fx-rise">
              <SlideFrame slide={current} settings={mergedSettings} heightOverride={280} contentClassName="se-rise-content" />
            </div>
            <div style={{ opacity: 0.42 }}>
              <SlideFrame slide={nextSlide} settings={mergedSettings} compact heightOverride={110} />
            </div>
          </div>
          <NavArrows onPrev={goPrev} onNext={goNext} settings={mergedSettings} show={showArrows} />
          {renderDots()}
        </div>
      )
    }

    if (effect === "thumbnails") {
      return (
        <div style={{ position: "relative" }}>
          <div className={fxClassFor(entranceFx || "fade")}>
            <SlideFrame slide={current} settings={mergedSettings} />
          </div>
          <NavArrows onPrev={goPrev} onNext={goNext} settings={mergedSettings} show={showArrows} />
        </div>
      )
    }

    if (effect === "cards-stack") {
      const stack = [0, 1, 2].map((offset) => visibleSlides[(index + offset) % visibleSlides.length])
      return (
        <div style={{ position: "relative", height: 340, maxWidth: 640, margin: "0 auto" }}>
          {stack
            .slice()
            .reverse()
            .map((slide, revI) => {
              const i = stack.length - 1 - revI
              return (
                <div
                  key={`${slide.id}-stack-${i}`}
                  style={{
                    position: "absolute",
                    inset: 0,
                    transform: `translateY(${i * 16}px) scale(${1 - i * 0.055}) rotate(${i * (i % 2 ? -1.4 : 1.4)}deg)`,
                    opacity: 1 - i * 0.2,
                    zIndex: 3 - i,
                    transition: "transform 0.55s cubic-bezier(0.22,1,0.36,1), opacity 0.4s ease",
                  }}
                >
                  <SlideFrame slide={slide} settings={mergedSettings} heightOverride={300} />
                </div>
              )
            })}
          <NavArrows onPrev={goPrev} onNext={goNext} settings={mergedSettings} show={showArrows} />
          <div style={{ position: "absolute", left: 0, right: 0, bottom: -28 }}>
            {renderDots()}
          </div>
        </div>
      )
    }

    return (
      <div style={{ position: "relative" }}>
        {renderSingleStage()}
        <NavArrows onPrev={goPrev} onNext={goNext} settings={mergedSettings} show={showArrows} />
        {renderDots()}
      </div>
    )
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <style>{EFFECT_STYLES}</style>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
        {showDeviceToggle ? (
          <div style={{ display: "flex", gap: 8 }}>
            <Button size="slim" pressed={device === "desktop"} onClick={() => setDevice("desktop")}>
              Desktop
            </Button>
            <Button size="slim" pressed={device === "mobile"} onClick={() => setDevice("mobile")}>
              Mobile
            </Button>
          </div>
        ) : (
          <span />
        )}
        <Badge status={typeInfo.color}>{typeInfo.label}</Badge>
      </div>

      {compact ? (
        <PhoneChrome>
          {withGalleryThumbs(renderStage())}
          {renderProgress()}
        </PhoneChrome>
      ) : (
        <LaptopChrome>
          {withGalleryThumbs(renderStage())}
          {renderProgress()}
        </LaptopChrome>
      )}

      <div style={{ display: "flex", justifyContent: "space-between", gap: 8, flexWrap: "wrap" }}>
        <Text variant="bodySm" color="subdued">
          {isSample
            ? `Sample ${typeInfo.label} preview — add slides to replace this`
            : `Slide ${index + 1} of ${visibleSlides.length}`}
        </Text>
        <Text variant="bodySm" color="subdued">
          {typeInfo.description}
        </Text>
      </div>
    </div>
  )
}
