"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { Text, Button, Badge } from "@shopify/polaris"
import {
  SAMPLE_SLIDES,
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
    heightOverride ?? (compact ? Math.min(Number(settings.height) || 360, 240) : Number(settings.height) || 360)
  const radius = Number(settings.borderRadius ?? 14)

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
        {heading ? (
          <h3 style={{ margin: "0 0 0.3rem", fontSize: compact ? "1rem" : "1.5rem", fontWeight: 700, letterSpacing: "-0.02em" }}>
            {heading}
          </h3>
        ) : null}
        {subheading ? (
          <p style={{ margin: "0 0 0.35rem", fontSize: compact ? "0.75rem" : "0.92rem", opacity: 0.95 }}>{subheading}</p>
        ) : null}
        {description && !compact ? (
          <p style={{ margin: "0 0 0.8rem", maxWidth: "28rem", lineHeight: 1.4, fontSize: "0.88rem", opacity: 0.9 }}>
            {description}
          </p>
        ) : null}
        {slide.ctaText ? (
          <span
            style={{
              display: "inline-block",
              padding: compact ? "0.4rem 0.7rem" : "0.6rem 1rem",
              borderRadius: 8,
              background: slide.buttonBg || "#1a2f4a",
              color: slide.buttonTextColor || "#ffffff",
              fontWeight: 650,
              fontSize: compact ? "0.72rem" : "0.84rem",
            }}
          >
            {slide.ctaText}
          </span>
        ) : null}
      </div>
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

function Dots({ slides, index, setIndex, color }) {
  if (slides.length < 2) return null
  return (
    <div style={{ display: "flex", justifyContent: "center", gap: 7, marginTop: 12 }}>
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
    if (filtered.length === 0 && useSampleWhenEmpty) return SAMPLE_SLIDES
    return filtered
  }, [slides, useSampleWhenEmpty])

  const isSample =
    (!slides || slides.filter((s) => s?.isVisible !== false).length === 0) && useSampleWhenEmpty

  useEffect(() => {
    setIndex(0)
  }, [visibleSlides.length, sliderType])

  useEffect(() => {
    if (effect === "marquee") return undefined
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
  const showArrows = mergedSettings.arrows !== false && visibleSlides.length > 1 && effect !== "marquee"

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

  const renderSingleStage = (heightOverride) => {
    const frame = (
      <SlideFrame
        slide={current}
        settings={mergedSettings}
        compact={Boolean(heightOverride)}
        heightOverride={heightOverride}
        contentClassName={effect === "slide-up" ? "se-rise-content" : undefined}
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
      <div key={`${current.id}-${effect}`} className={fxClassFor(effect)}>
        {frame}
      </div>
    )
  }

  const renderStage = () => {
    if (compact) {
      return (
        <div style={{ position: "relative", touchAction: "pan-y" }} onPointerDown={onPointerDown} onPointerUp={onPointerUp}>
          {renderSingleStage(Math.min(Number(mergedSettings.height) || 360, 220))}
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
                  border: i === index ? "2px solid #2c4a6e" : "2px solid transparent",
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
