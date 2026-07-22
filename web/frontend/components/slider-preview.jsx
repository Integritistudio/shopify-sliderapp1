"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { Text, Button, Badge } from "@shopify/polaris"
import {
  getSampleSlidesForType,
  getSliderTypeInfo,
  mergeSliderSettings,
  resolveSliderType,
} from "../utils/sliderConfig"
import { safeUrl } from "../utils/escapeHtml"

function SlideFrame({ slide, settings, compact, heightOverride, style = {}, mediaClassName = "", contentClassName = "" }) {
  const imageUrl = safeUrl(slide.imageUrl)
  const videoUrl = safeUrl(slide.videoUrl)
  const heading = slide.heading || slide.title || ""
  const subheading = slide.subheading || ""
  const description = slide.description || ""
  const alt = slide.imageAlt || heading || "Slide image"
  const overlayOpacity = Number(slide.overlayOpacity ?? settings.overlayOpacity ?? 0.35)
  const overlayColor = slide.overlayColor || settings.overlayColor || "#000000"
  const align = slide.textAlign || "center"
  const height =
    heightOverride ??
    (compact ? Math.min(Number(settings.height) || 640, 260) : Math.min(Number(settings.height) || 640, 520))
  const radius = Number(settings.borderRadius ?? 0)

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
          justifyContent: "center",
          alignItems: align === "left" ? "flex-start" : align === "right" ? "flex-end" : "center",
          textAlign: align,
          padding: compact ? "0.9rem" : "1.4rem",
          color: slide.textColor || "#ffffff",
          zIndex: 1,
        }}
      >
        {subheading ? (
          <p
            style={{
              margin: "0 0 0.35rem",
              fontSize: compact ? "0.7rem" : "0.8rem",
              fontWeight: 700,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              opacity: 0.95,
            }}
          >
            {subheading}
          </p>
        ) : null}
        {heading ? (
          <h3 style={{ margin: "0 0 0.4rem", fontSize: compact ? "1.4rem" : "2.35rem", fontWeight: 700, letterSpacing: "-0.02em" }}>
            {heading}
          </h3>
        ) : null}
        {description ? (
          <p
            style={{
              margin: "0 0 0.8rem",
              maxWidth: "28rem",
              lineHeight: 1.4,
              fontSize: compact ? "0.92rem" : "1.15rem",
              opacity: 0.9,
              display: "-webkit-box",
              WebkitLineClamp: compact ? 2 : 4,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {description}
          </p>
        ) : null}
        {slide.ctaText ? (
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: compact ? 5 : 8,
              padding: compact
                ? `${Math.max(4, Math.round((settings.ctaPadding ?? 12) * 0.55))}px ${Math.max(8, Math.round((settings.ctaPadding ?? 12) * 0.95))}px`
                : `${settings.ctaPadding ?? 12}px ${Math.round((settings.ctaPadding ?? 12) * 1.75)}px`,
              border: `${settings.ctaBorderWidth ?? 1}px solid ${settings.ctaBorderColor || "#ffffff"}`,
              borderRadius: settings.ctaBorderRadius ?? 50,
              background: settings.ctaBackground || slide.buttonBg || "#1a2f4a",
              color: settings.ctaTextColor || slide.buttonTextColor || "#ffffff",
              fontWeight: 700,
              fontSize: compact ? "0.75rem" : `${settings.ctaFontSize ?? 16}px`,
              lineHeight: 1,
              transition: "background 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background =
                settings.ctaHoverBackground || settings.ctaBackground || slide.buttonBg || "#243d5c"
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = settings.ctaBackground || slide.buttonBg || "#1a2f4a"
            }}
          >
            {slide.ctaText}
            {settings.ctaIcon !== "none" ? (
              <svg
                viewBox="0 0 20 20"
                aria-hidden="true"
                style={{
                  width: compact ? Math.round((settings.ctaIconSize ?? 34) * 0.65) : settings.ctaIconSize ?? 34,
                  height: compact ? Math.round((settings.ctaIconSize ?? 34) * 0.65) : settings.ctaIconSize ?? 34,
                  padding: Math.round((compact ? (settings.ctaIconSize ?? 34) * 0.65 : settings.ctaIconSize ?? 34) * 0.235),
                  borderRadius: "50%",
                  boxSizing: "border-box",
                  color: settings.ctaIconColor || "#ffffff",
                  background: settings.ctaIconBg || "rgba(255,255,255,0.12)",
                }}
              >
                <path
                  d={settings.ctaIcon === "chevron" ? "M7 4l6 6-6 6" : "M4 10h11m-4-4 4 4-4 4"}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            ) : null}
          </span>
        ) : null}
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
  const align = slide.textAlign || "left"
  const height =
    heightOverride ??
    (compact ? Math.min(Number(settings.height) || 640, 260) : Math.min(Number(settings.height) || 640, 560))
  const radius = boxed ? Number(settings.borderRadius ?? 20) : 0

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
          justifyContent: "flex-end",
          alignItems: align === "center" ? "center" : align === "right" ? "flex-end" : "flex-start",
          textAlign: align,
          padding: compact ? "1.25rem 1rem 1.35rem" : "2.5rem clamp(1.25rem, 4vw, 3.5rem)",
          color: "#fff",
          zIndex: 1,
        }}
      >
        <div style={{ maxWidth: compact ? "100%" : "34rem" }}>
          {subheading ? (
            <div
              style={{
                display: "inline-flex",
                marginBottom: 10,
                padding: "0.28rem 0.7rem",
                borderRadius: 999,
                border: "1px solid rgba(255,255,255,0.35)",
                background: "rgba(255,255,255,0.08)",
                fontSize: compact ? 10 : 12,
                fontWeight: 650,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
              }}
            >
              {subheading}
            </div>
          ) : null}
          {heading ? (
            <h3
              style={{
                margin: "0 0 0.55rem",
                fontSize: compact ? "1.55rem" : "clamp(2.1rem, 4vw, 3.4rem)",
                lineHeight: 1.05,
                fontWeight: 700,
                letterSpacing: "-0.03em",
              }}
            >
              {heading}
            </h3>
          ) : null}
          {description ? (
            <p
              style={{
                margin: "0 0 1rem",
                fontSize: compact ? "0.88rem" : "1.05rem",
                lineHeight: 1.45,
                opacity: 0.9,
                maxWidth: "28rem",
              }}
            >
              {description}
            </p>
          ) : null}
          {slide.ctaText ? (
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: compact ? "0.55rem 0.9rem" : "0.75rem 1.2rem",
                borderRadius: 999,
                background: "#fff",
                color: "#170f49",
                fontWeight: 700,
                fontSize: compact ? "0.78rem" : "0.92rem",
              }}
            >
              {slide.ctaText}
              <span aria-hidden="true">→</span>
            </span>
          ) : null}
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

function ProductCard({ slide, settings, compact = false, featured = false }) {
  const imageUrl = safeUrl(slide.imageUrl)
  const title = slide.heading || slide.title || "Product"
  const price = slide.description || ""
  const titleSize = compact
    ? Math.max(12, Math.round((settings.productTitleFontSize ?? 16) * 0.85))
    : settings.productTitleFontSize ?? 16
  const priceSize = compact
    ? Math.max(10, Math.round((settings.productPriceFontSize ?? 14) * 0.9))
    : settings.productPriceFontSize ?? 14
  const ctaSize = compact
    ? Math.max(10, Math.round((settings.ctaFontSize ?? 16) * 0.85))
    : settings.ctaFontSize ?? 16
  const pad = settings.ctaPadding ?? settings.ctaPaddingY ?? 12
  const contentGap = settings.productContentGap ?? 8
  const showShopNow = settings.showShopNow !== false
  const showAddToCart = settings.showAddToCart !== false
  const atcPad = settings.atcPadding ?? settings.ctaPadding ?? 10
  const atcSize = compact
    ? Math.max(10, Math.round((settings.atcFontSize ?? 14) * 0.85))
    : settings.atcFontSize ?? 14
  const shopStyle = {
    display: "inline-flex",
    alignSelf: "flex-start",
    padding: `${pad}px ${Math.round(pad * 1.75)}px`,
    borderRadius: settings.ctaBorderRadius ?? 50,
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
    padding: `${atcPad}px ${Math.round(atcPad * 1.75)}px`,
    borderRadius: settings.atcBorderRadius ?? 50,
    border: `${settings.atcBorderWidth ?? 1}px solid ${settings.atcBorderColor || "#170f49"}`,
    background: settings.atcBackground || "#ffffff",
    color: settings.atcTextColor || "#170f49",
    fontSize: atcSize,
    fontWeight: 650,
    lineHeight: 1,
  }
  return (
    <div
      className="se-preview-product-card"
      style={{
        background: "#fff",
        border: "1px solid #e7e7e7",
        borderRadius: Number(settings.borderRadius ?? 14),
        overflow: "hidden",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        boxShadow: "none",
      }}
    >
      <div style={{ aspectRatio: "1 / 1.05", background: "#f3f4f6", overflow: "hidden" }}>
        {imageUrl ? (
          <img src={imageUrl} alt={title} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
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
            fontSize: featured ? titleSize + 1 : titleSize,
            lineHeight: 1.3,
            minHeight: `calc(${featured ? titleSize + 1 : titleSize}px * 1.3 * 2)`,
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
            {showAddToCart ? <span style={atcStyle}>{settings.addToCartText || "Add to cart"}</span> : null}
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

function NavArrows({ onPrev, onNext, settings, show }) {
  if (!show) return null
  return (
    <>
      <button
        type="button"
        aria-label="Previous"
        onClick={onPrev}
        style={{
          position: "absolute",
          left: 10,
          top: "50%",
          transform: "translateY(-50%)",
          zIndex: 6,
          width: 34,
          height: 34,
          borderRadius: "50%",
          border: "none",
          cursor: "pointer",
          background: settings.arrowBg || "rgba(18,24,38,0.55)",
          color: settings.arrowColor || "#fff",
          fontSize: 18,
        }}
      >
        ‹
      </button>
      <button
        type="button"
        aria-label="Next"
        onClick={onNext}
        style={{
          position: "absolute",
          right: 10,
          top: "50%",
          transform: "translateY(-50%)",
          zIndex: 6,
          width: 34,
          height: 34,
          borderRadius: "50%",
          border: "none",
          cursor: "pointer",
          background: settings.arrowBg || "rgba(18,24,38,0.55)",
          color: settings.arrowColor || "#fff",
          fontSize: 18,
        }}
      >
        ›
      </button>
    </>
  )
}

function Dots({ slides, index, setIndex, color, gap }) {
  if (slides.length < 2) return null
  return (
    <div style={{ display: "flex", justifyContent: "center", gap: 7, marginTop: gap ?? 12 }}>
      {slides.map((slide, i) => (
        <button
          key={slide.id || i}
          type="button"
          aria-label={`Go to slide ${i + 1}`}
          onClick={() => setIndex(i)}
          style={{
            width: i === index ? 18 : 8,
            height: 8,
            borderRadius: 999,
            border: "none",
            cursor: "pointer",
            background: i === index ? color || "#2c4a6e" : "#d1d5db",
            transition: "width 0.2s ease",
          }}
        />
      ))}
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
@media (prefers-reduced-motion: reduce) {
  .se-fx-fade, .se-fx-slide, .se-fx-zoom, .se-fx-flip, .se-fx-cube, .se-fx-rise .se-rise-content > *,
  .se-fx-ken img, .se-fx-parallax img, .se-fx-blur, .se-fx-wipe,
  .se-split-panel--left, .se-split-panel--right { animation: none !important; }
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

  useEffect(() => {
    if (effect === "marquee" || effect === "logo-grid") return undefined
    if (!mergedSettings.autoplay || visibleSlides.length < 2) return undefined
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % visibleSlides.length)
    }, Number(mergedSettings.autoplaySpeed) || 3000)
    return () => clearInterval(timer)
  }, [mergedSettings.autoplay, mergedSettings.autoplaySpeed, visibleSlides.length, effect])

  if (visibleSlides.length === 0) {
    return (
      <div style={{ border: "1px dashed #c9cccf", borderRadius: 12, padding: "2.5rem 1.5rem", textAlign: "center", background: "#fafbfb" }}>
        <Text color="subdued">Add a slide to see the live preview.</Text>
      </div>
    )
  }

  const compact = device === "mobile"
  const current = visibleSlides[Math.min(index, visibleSlides.length - 1)]
  const prevSlide = visibleSlides[(index - 1 + visibleSlides.length) % visibleSlides.length]
  const nextSlide = visibleSlides[(index + 1) % visibleSlides.length]
  const goPrev = () => setIndex((prev) => (prev - 1 + visibleSlides.length) % visibleSlides.length)
  const goNext = () => setIndex((prev) => (prev + 1) % visibleSlides.length)
  const showArrows =
    mergedSettings.arrows !== false &&
    visibleSlides.length > 1 &&
    !["marquee", "logo-grid", "announcement"].includes(effect)

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
            effect === "hero-fullwidth" || effect === "hero-video" ? 0 : mergedSettings.borderRadius,
        }}
        compact={forceCompact || compact}
        heightOverride={heightOverride}
        style={extraStyle}
        contentClassName={effect === "slide-up" ? "se-rise-content" : undefined}
        mediaClassName={effect === "hero-video" || effect === "ken-burns" ? "se-fx-ken" : undefined}
      />
    )

    if (effect === "split-panel") {
      return (
        <div key={`${current.id}-split`} className="se-split-shell se-fx-fade">
          {frame}
          <div className="se-split-panel se-split-panel--left" />
          <div className="se-split-panel se-split-panel--right" />
        </div>
      )
    }

    return (
      <div key={`${current.id}-${effect}`} className={fxClassFor(effect === "hero-fullwidth" || effect === "hero-boxed" || effect === "hero-video" ? "fade" : effect)}>
        {frame}
      </div>
    )
  }

  const renderPremiumStage = () => {
    if (["hero-fullwidth", "hero-video"].includes(effect)) {
      const h = compact ? Math.min(Number(mergedSettings.height) || 680, 250) : Math.min(Number(mergedSettings.height) || 680, 560)
      return (
        <div style={{ position: "relative" }} onPointerDown={onPointerDown} onPointerUp={onPointerUp}>
          <div key={`${current.id}-${effect}`} className="se-fx-fade">
            <HeroFrame
              slide={current}
              settings={mergedSettings}
              compact={compact}
              heightOverride={h}
              video={effect === "hero-video"}
            />
          </div>
          <NavArrows onPrev={goPrev} onNext={goNext} settings={mergedSettings} show={showArrows} />
          <Dots slides={visibleSlides} index={index} setIndex={setIndex} color={mergedSettings.dotColor} />
        </div>
      )
    }

    if (effect === "hero-boxed") {
      const h = compact ? 220 : Math.min(Number(mergedSettings.height) || 560, 460)
      return (
        <div style={{ position: "relative" }} onPointerDown={onPointerDown} onPointerUp={onPointerUp}>
          <div key={`${current.id}-boxed`} className="se-fx-fade">
            <HeroFrame slide={current} settings={mergedSettings} compact={compact} heightOverride={h} boxed />
          </div>
          <NavArrows onPrev={goPrev} onNext={goNext} settings={mergedSettings} show={showArrows} />
          <Dots slides={visibleSlides} index={index} setIndex={setIndex} color={mergedSettings.dotColor} />
        </div>
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
                  <ProductCard slide={slide} settings={mergedSettings} compact={compact || effect === "collection-rail"} />
                </div>
              </div>
            ))}
          </div>
          <NavArrows onPrev={goPrev} onNext={goNext} settings={mergedSettings} show={showArrows} />
          <Dots
            slides={visibleSlides}
            index={index}
            setIndex={setIndex}
            color={mergedSettings.dotColor}
            gap={mergedSettings.paginationGap ?? 16}
          />
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
                  <ProductCard slide={slide} settings={mergedSettings} compact={!active || compact} featured={active} />
                </div>
              )
            })}
          </div>
          <NavArrows onPrev={goPrev} onNext={goNext} settings={mergedSettings} show={showArrows} />
          <Dots
            slides={visibleSlides}
            index={index}
            setIndex={setIndex}
            color={mergedSettings.dotColor}
            gap={mergedSettings.paginationGap ?? 16}
          />
        </div>
      )
    }

    if (effect === "testimonials") {
      return (
        <div style={{ position: "relative", maxWidth: 720, margin: "0 auto" }} onPointerDown={onPointerDown} onPointerUp={onPointerUp}>
          <div
            className="se-fx-fade"
            style={{
              border: "1px solid #170f49",
              borderRadius: mergedSettings.borderRadius ?? 16,
              background: "#fff",
              padding: compact ? "1.25rem 1.1rem" : "2rem 2.25rem",
              textAlign: "center",
              color: "#170f49",
              minHeight: compact ? 180 : 260,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 12,
            }}
          >
            <div style={{ fontSize: compact ? 28 : 40, lineHeight: 1, color: "#ed8104", fontWeight: 700 }}>&ldquo;</div>
            <p style={{ margin: 0, fontSize: compact ? "1rem" : "1.35rem", lineHeight: 1.45, fontWeight: 550, maxWidth: "36rem" }}>
              {current.heading || current.title || "Customer quote"}
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 8 }}>
              {safeUrl(current.imageUrl) ? (
                <img
                  src={safeUrl(current.imageUrl)}
                  alt=""
                  style={{ width: 44, height: 44, borderRadius: "50%", objectFit: "cover", border: "2px solid #e7e7e7" }}
                />
              ) : null}
              <div style={{ textAlign: "left" }}>
                <div style={{ fontWeight: 700, fontSize: "0.92rem" }}>{current.subheading || "Customer"}</div>
                {current.description ? <div style={{ fontSize: "0.8rem", color: "#5f5a72" }}>{current.description}</div> : null}
              </div>
            </div>
          </div>
          <NavArrows onPrev={goPrev} onNext={goNext} settings={mergedSettings} show={showArrows} />
          <Dots slides={visibleSlides} index={index} setIndex={setIndex} color={mergedSettings.dotColor} />
        </div>
      )
    }

    if (effect === "logo-grid") {
      const loop = [...visibleSlides, ...visibleSlides]
      return (
        <div style={{ overflow: "hidden", borderRadius: 12, border: "1px solid #e7e7e7", background: "#fff", padding: "1rem 0" }}>
          <div style={{ display: "flex", gap: 28, width: "max-content", animation: "seMarquee 16s linear infinite", alignItems: "center" }}>
            {loop.map((slide, i) => (
              <div
                key={`${slide.id}-logo-${i}`}
                style={{
                  width: compact ? 88 : 120,
                  height: compact ? 48 : 64,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  filter: "grayscale(1)",
                  opacity: 0.75,
                }}
              >
                {safeUrl(slide.imageUrl) ? (
                  <img src={safeUrl(slide.imageUrl)} alt={slide.heading || ""} style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} />
                ) : (
                  <span style={{ fontWeight: 700, color: "#170f49" }}>{slide.heading || "Brand"}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )
    }

    if (effect === "stories") {
      return (
        <div style={{ position: "relative" }}>
          <div style={{ display: "flex", gap: 12, justifyContent: compact ? "flex-start" : "center", overflowX: "auto", paddingBottom: 12 }}>
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
        <div
          className="se-fx-fade"
          key={current.id}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 12,
            minHeight: Number(mergedSettings.height) || 48,
            padding: "0.65rem 1rem",
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
          <Dots slides={visibleSlides} index={index} setIndex={setIndex} color={mergedSettings.dotColor} />
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
          <Dots slides={visibleSlides} index={index} setIndex={setIndex} color={mergedSettings.dotColor} />
        </div>
      )
    }

    if (effect === "autoplay") {
      const trio = [0, 1, 2].map((offset) => visibleSlides[(index + offset) % visibleSlides.length])
      return (
        <div style={{ position: "relative" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
            {trio.map((slide, i) => (
              <div key={`${slide.id}-g-${i}`} className="se-fx-slide">
                <SlideFrame slide={slide} settings={mergedSettings} compact heightOverride={230} />
              </div>
            ))}
          </div>
          <NavArrows onPrev={goPrev} onNext={goNext} settings={mergedSettings} show={showArrows} />
          <Dots slides={visibleSlides} index={index} setIndex={setIndex} color={mergedSettings.dotColor} />
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
          <Dots slides={visibleSlides} index={index} setIndex={setIndex} color={mergedSettings.dotColor} />
        </div>
      )
    }

    if (effect === "thumbnails") {
      return (
        <div style={{ position: "relative" }}>
          <div className="se-fx-fade">
            <SlideFrame slide={current} settings={mergedSettings} />
          </div>
          <NavArrows onPrev={goPrev} onNext={goNext} settings={mergedSettings} show={showArrows} />
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
                <img src={safeUrl(slide.imageUrl) || ""} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
              </button>
            ))}
          </div>
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
            <Dots slides={visibleSlides} index={index} setIndex={setIndex} color={mergedSettings.dotColor} />
          </div>
        </div>
      )
    }

    return (
      <div style={{ position: "relative" }}>
        {renderSingleStage()}
        <NavArrows onPrev={goPrev} onNext={goNext} settings={mergedSettings} show={showArrows} />
        <Dots slides={visibleSlides} index={index} setIndex={setIndex} color={mergedSettings.dotColor} />
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
        <PhoneChrome>{renderStage()}</PhoneChrome>
      ) : (
        <div style={{ width: "100%", border: "1px solid #e5e7eb", borderRadius: 16, padding: 16, background: "#fff" }}>
          {renderStage()}
        </div>
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
