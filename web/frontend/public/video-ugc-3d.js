/**
 * SlideEase 3D UGC Feed
 * Self-contained IIFE — exposes window.SEVideoUgc3D
 * Compatibility alias: window.VideoUgc3D
 */
(function (global) {
  'use strict';

  var STYLE_ID = 'se-video-ugc-3d-styles';
  var FONT_ID = 'se-video-ugc-3d-fonts';
  var FONT_HREF =
    'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;600;700&family=Syne:wght@700&display=swap';

  var CSS = [
    "/**",
    " * 3D Video & UGC Carousel",
    " * Premium Shopify-ready styles — vertical social video cards",
    " */",
    "",
    ".video-ugc-3d {",
    "  --vu-bg: #121417;",
    "  --vu-bg-soft: #1a1e24;",
    "  --vu-ink: #f4f5f7;",
    "  --vu-ink-muted: rgba(244, 245, 247, 0.68);",
    "  --vu-ink-soft: rgba(244, 245, 247, 0.45);",
    "  --vu-accent: #ffffff;",
    "  --vu-radius: 16px;",
    "  --vu-font-display: \"Syne\", \"Helvetica Neue\", sans-serif;",
    "  --vu-font-body: \"Plus Jakarta Sans\", \"Helvetica Neue\", sans-serif;",
    "  --vu-transition: 650ms cubic-bezier(0.22, 1, 0.36, 1);",
    "  --vu-perspective: 1300px;",
    "  --vu-aspect: 9 / 16;",
    "  --vu-card-width: min(28vw, 280px);",
    "  --vu-stage-pad: clamp(1.75rem, 4vw, 3.25rem);",
    "",
    "  position: relative;",
    "  isolation: isolate;",
    "  width: 100vw;",
    "  max-width: 100vw;",
    "  margin-left: calc(50% - 50vw);",
    "  margin-right: calc(50% - 50vw);",
    "  padding: clamp(2.25rem, 5vw, 4.5rem) 0;",
    "  font-family: var(--vu-font-body);",
    "  color: var(--vu-ink);",
    "  --vu-section-bg: radial-gradient(70% 55% at 50% 20%, rgba(255, 255, 255, 0.05) 0%, transparent 55%), linear-gradient(180deg, var(--vu-bg) 0%, var(--vu-bg-soft) 100%);",
    "  background: var(--vu-section-bg);",
    "  overflow: hidden;",
    "  -webkit-font-smoothing: antialiased;",
    "  -moz-osx-font-smoothing: grayscale;",
    "}",
    "",
    ".video-ugc-3d *,",
    ".video-ugc-3d *::before,",
    ".video-ugc-3d *::after {",
    "  box-sizing: border-box;",
    "}",
    "",
    ".video-ugc-3d__inner {",
    "  width: min(100% - 2rem, 1180px);",
    "  margin-inline: auto;",
    "}",
    "",
    ".video-ugc-3d__header {",
    "  text-align: center;",
    "  margin-bottom: clamp(1.5rem, 3.5vw, 2.75rem);",
    "}",
    "",
    ".video-ugc-3d__eyebrow {",
    "  display: block;",
    "  margin: 0 0 0.55rem;",
    "  font-size: 0.6875rem;",
    "  font-weight: 600;",
    "  letter-spacing: 0.22em;",
    "  text-transform: uppercase;",
    "  color: var(--vu-ink-soft);",
    "}",
    "",
    ".video-ugc-3d__heading {",
    "  margin: 0;",
    "  font-family: var(--vu-font-display);",
    "  font-size: clamp(1.85rem, 4vw, 2.85rem);",
    "  font-weight: 700;",
    "  line-height: 1.1;",
    "  letter-spacing: -0.02em;",
    "}",
    "",
    ".video-ugc-3d__subheading {",
    "  margin: 0.75rem auto 0;",
    "  max-width: 28rem;",
    "  font-size: 0.9rem;",
    "  line-height: 1.55;",
    "  color: var(--vu-ink-muted);",
    "}",
    "",
    "/* Stage */",
    ".video-ugc-3d__stage {",
    "  position: relative;",
    "  width: 100%;",
    "  perspective: var(--vu-perspective);",
    "  perspective-origin: 50% 45%;",
    "  touch-action: pan-y;",
    "  overscroll-behavior-x: none;",
    "  user-select: none;",
    "  -webkit-user-select: none;",
    "  cursor: grab;",
    "}",
    "",
    ".video-ugc-3d__stage.is-dragging {",
    "  cursor: grabbing;",
    "}",
    "",
    ".video-ugc-3d.is-dragging .video-ugc-3d__slide,",
    ".video-ugc-3d.is-instant .video-ugc-3d__slide {",
    "  transition: none;",
    "}",
    "",
    ".video-ugc-3d__track {",
    "  position: relative;",
    "  display: flex;",
    "  align-items: center;",
    "  justify-content: center;",
    "  width: 100%;",
    "  min-height: calc(var(--vu-card-width) * 16 / 9 + var(--vu-stage-pad) * 2);",
    "  padding-block: var(--vu-stage-pad);",
    "  transform-style: preserve-3d;",
    "}",
    "",
    "/* Slides */",
    ".video-ugc-3d__slide {",
    "  position: absolute;",
    "  top: 50%;",
    "  left: 50%;",
    "  width: var(--vu-card-width);",
    "  margin: 0;",
    "  padding: 0;",
    "  list-style: none;",
    "  transform-style: preserve-3d;",
    "  transform-origin: center center;",
    "  transition:",
    "    transform var(--vu-transition),",
    "    opacity var(--vu-transition),",
    "    filter var(--vu-transition),",
    "    visibility var(--vu-transition);",
    "  will-change: transform, opacity;",
    "  backface-visibility: hidden;",
    "  -webkit-backface-visibility: hidden;",
    "}",
    "",
    ".video-ugc-3d__slide.is-hidden {",
    "  visibility: hidden;",
    "  pointer-events: none;",
    "  opacity: 0;",
    "}",
    "",
    ".video-ugc-3d__slide.is-active {",
    "  z-index: 20;",
    "}",
    "",
    ".video-ugc-3d__slide.is-clickable:not(.is-active) {",
    "  cursor: pointer;",
    "}",
    "",
    ".video-ugc-3d.is-animating .video-ugc-3d__slide {",
    "  pointer-events: none;",
    "}",
    "",
    ".video-ugc-3d__slide:not(.is-active) {",
    "  filter: brightness(0.72) saturate(0.9);",
    "}",
    "",
    ".video-ugc-3d__slide.is-active {",
    "  filter: none;",
    "}",
    "",
    ".video-ugc-3d__slide.is-active .video-ugc-3d__card {",
    "  box-shadow:",
    "    0 12px 28px rgba(0, 0, 0, 0.35),",
    "    0 32px 64px rgba(0, 0, 0, 0.4);",
    "}",
    "",
    ".video-ugc-3d__slide:not(.is-active) .video-ugc-3d__card {",
    "  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.28);",
    "}",
    "",
    "/* Card */",
    ".video-ugc-3d__card {",
    "  position: relative;",
    "  width: 100%;",
    "  aspect-ratio: var(--vu-aspect);",
    "  border-radius: var(--vu-radius);",
    "  overflow: hidden;",
    "  background: #0b0d10;",
    "  transform: translateZ(0);",
    "}",
    "",
    ".video-ugc-3d__media {",
    "  position: absolute;",
    "  inset: 0;",
    "  background: #0b0d10;",
    "}",
    "",
    ".video-ugc-3d__video,",
    ".video-ugc-3d__poster {",
    "  display: block;",
    "  width: 100%;",
    "  height: 100%;",
    "  object-fit: cover;",
    "  object-position: center;",
    "}",
    "",
    ".video-ugc-3d__video {",
    "  position: relative;",
    "  z-index: 1;",
    "  background: #0b0d10;",
    "}",
    "",
    ".video-ugc-3d__poster {",
    "  position: absolute;",
    "  inset: 0;",
    "  z-index: 2;",
    "  transition: opacity 280ms ease;",
    "}",
    "",
    ".video-ugc-3d__slide.is-playing .video-ugc-3d__poster {",
    "  opacity: 0;",
    "  pointer-events: none;",
    "}",
    "",
    ".video-ugc-3d__fallback {",
    "  position: absolute;",
    "  inset: 0;",
    "  z-index: 3;",
    "  display: none;",
    "  align-items: center;",
    "  justify-content: center;",
    "  padding: 1.25rem;",
    "  text-align: center;",
    "  font-size: 0.8125rem;",
    "  line-height: 1.45;",
    "  color: var(--vu-ink-muted);",
    "  background: #161a20;",
    "}",
    "",
    ".video-ugc-3d__slide.is-error .video-ugc-3d__fallback {",
    "  display: flex;",
    "}",
    "",
    ".video-ugc-3d__slide.is-error .video-ugc-3d__video,",
    ".video-ugc-3d__slide.is-error .video-ugc-3d__poster {",
    "  opacity: 0;",
    "}",
    "",
    ".video-ugc-3d__gradient {",
    "  position: absolute;",
    "  inset: 0;",
    "  z-index: 4;",
    "  pointer-events: none;",
    "  background: linear-gradient(",
    "    180deg,",
    "    rgba(0, 0, 0, 0.35) 0%,",
    "    transparent 28%,",
    "    transparent 55%,",
    "    rgba(0, 0, 0, 0.72) 100%",
    "  );",
    "}",
    "",
    "/* Meta overlays */",
    ".video-ugc-3d__top {",
    "  position: absolute;",
    "  top: 0;",
    "  left: 0;",
    "  right: 0;",
    "  z-index: 5;",
    "  display: flex;",
    "  align-items: center;",
    "  justify-content: space-between;",
    "  gap: 0.5rem;",
    "  padding: 0.85rem 0.85rem 0;",
    "  pointer-events: none;",
    "}",
    "",
    ".video-ugc-3d__creator {",
    "  display: flex;",
    "  align-items: center;",
    "  gap: 0.55rem;",
    "  min-width: 0;",
    "}",
    "",
    ".video-ugc-3d__avatar {",
    "  width: 2rem;",
    "  height: 2rem;",
    "  border-radius: 50%;",
    "  object-fit: cover;",
    "  border: 1.5px solid rgba(255, 255, 255, 0.85);",
    "  background: #2a3038;",
    "  flex: 0 0 auto;",
    "}",
    "",
    ".video-ugc-3d__creator-text {",
    "  display: flex;",
    "  flex-direction: column;",
    "  min-width: 0;",
    "}",
    "",
    ".video-ugc-3d__name {",
    "  margin: 0;",
    "  font-size: 0.75rem;",
    "  font-weight: 700;",
    "  line-height: 1.2;",
    "  color: #fff;",
    "  white-space: nowrap;",
    "  overflow: hidden;",
    "  text-overflow: ellipsis;",
    "}",
    "",
    ".video-ugc-3d__handle {",
    "  margin: 0;",
    "  font-size: 0.625rem;",
    "  color: rgba(255, 255, 255, 0.7);",
    "  white-space: nowrap;",
    "  overflow: hidden;",
    "  text-overflow: ellipsis;",
    "}",
    "",
    ".video-ugc-3d__bottom {",
    "  position: absolute;",
    "  left: 0;",
    "  right: 0;",
    "  bottom: 0;",
    "  z-index: 5;",
    "  display: flex;",
    "  flex-direction: column;",
    "  align-items: flex-start;",
    "  gap: 0.35rem;",
    "  padding: 0 0.9rem 3.4rem;",
    "  pointer-events: none;",
    "}",
    "",
    ".video-ugc-3d__title {",
    "  margin: 0;",
    "  font-family: var(--vu-font-display);",
    "  font-size: 0.95rem;",
    "  font-weight: 700;",
    "  line-height: 1.25;",
    "  color: #fff;",
    "}",
    "",
    ".video-ugc-3d__description {",
    "  margin: 0;",
    "  font-size: 0.75rem;",
    "  line-height: 1.4;",
    "  color: rgba(255, 255, 255, 0.78);",
    "  display: -webkit-box;",
    "  -webkit-line-clamp: 2;",
    "  -webkit-box-orient: vertical;",
    "  overflow: hidden;",
    "}",
    "",
    ".video-ugc-3d__slide:not(.is-active) .video-ugc-3d__description {",
    "  display: none;",
    "}",
    "",
    ".video-ugc-3d__cta {",
    "  display: inline-flex;",
    "  align-items: center;",
    "  margin-top: 0.35rem;",
    "  padding: 0.45rem 0.85rem;",
    "  font-size: 0.625rem;",
    "  font-weight: 700;",
    "  letter-spacing: 0.12em;",
    "  text-transform: uppercase;",
    "  text-decoration: none;",
    "  color: #121417;",
    "  background: #fff;",
    "  border-radius: 999px;",
    "  pointer-events: auto;",
    "  transition: opacity 180ms ease;",
    "}",
    "",
    ".video-ugc-3d__cta:hover,",
    ".video-ugc-3d__cta:focus-visible {",
    "  opacity: 0.85;",
    "  outline: none;",
    "}",
    "",
    ".video-ugc-3d__slide:not(.is-active) .video-ugc-3d__cta {",
    "  pointer-events: none;",
    "}",
    "",
    "/* Media controls */",
    ".video-ugc-3d__media-controls {",
    "  position: absolute;",
    "  right: 0.75rem;",
    "  bottom: 0.85rem;",
    "  z-index: 6;",
    "  display: flex;",
    "  gap: 0.4rem;",
    "  opacity: 0;",
    "  transform: translateY(4px);",
    "  transition:",
    "    opacity 200ms ease,",
    "    transform 200ms ease;",
    "  pointer-events: none;",
    "}",
    "",
    ".video-ugc-3d__slide.is-active .video-ugc-3d__media-controls {",
    "  opacity: 1;",
    "  transform: translateY(0);",
    "  pointer-events: auto;",
    "}",
    "",
    ".video-ugc-3d__control {",
    "  display: inline-flex;",
    "  align-items: center;",
    "  justify-content: center;",
    "  width: 2.35rem;",
    "  height: 2.35rem;",
    "  padding: 0;",
    "  color: #fff;",
    "  background: rgba(18, 20, 23, 0.55);",
    "  border: 1px solid rgba(255, 255, 255, 0.18);",
    "  border-radius: 50%;",
    "  cursor: pointer;",
    "  backdrop-filter: blur(8px);",
    "  transition: background-color 160ms ease;",
    "}",
    "",
    ".video-ugc-3d__control svg {",
    "  width: 0.95rem;",
    "  height: 0.95rem;",
    "  pointer-events: none;",
    "}",
    "",
    ".video-ugc-3d__control:hover,",
    ".video-ugc-3d__control:focus-visible {",
    "  background: rgba(18, 20, 23, 0.78);",
    "  outline: none;",
    "}",
    "",
    ".video-ugc-3d__control:focus-visible {",
    "  outline: 2px solid #fff;",
    "  outline-offset: 2px;",
    "}",
    "",
    ".video-ugc-3d__icon-pause,",
    ".video-ugc-3d__slide.is-playing .video-ugc-3d__icon-play {",
    "  display: none;",
    "}",
    "",
    ".video-ugc-3d__slide.is-playing .video-ugc-3d__icon-pause {",
    "  display: block;",
    "}",
    "",
    ".video-ugc-3d__icon-unmute,",
    ".video-ugc-3d__slide.is-unmuted .video-ugc-3d__icon-mute {",
    "  display: none;",
    "}",
    "",
    ".video-ugc-3d__slide.is-unmuted .video-ugc-3d__icon-unmute {",
    "  display: block;",
    "}",
    "",
    "/* Carousel chrome */",
    ".video-ugc-3d__controls {",
    "  display: flex;",
    "  flex-direction: column;",
    "  align-items: center;",
    "  gap: 1.1rem;",
    "  margin-top: clamp(0.35rem, 1.5vw, 1rem);",
    "}",
    "",
    ".video-ugc-3d__nav {",
    "  display: flex;",
    "  align-items: center;",
    "  justify-content: center;",
    "  gap: 0.7rem;",
    "}",
    "",
    ".video-ugc-3d__arrow {",
    "  display: inline-flex;",
    "  align-items: center;",
    "  justify-content: center;",
    "  width: 2.75rem;",
    "  height: 2.75rem;",
    "  padding: 0;",
    "  color: #15181c;",
    "  background: rgba(255, 255, 255, 0.75);",
    "  border: 1px solid rgba(21, 24, 28, 0.08);",
    "  border-radius: 50%;",
    "  cursor: pointer;",
    "  backdrop-filter: blur(8px);",
    "  -webkit-backdrop-filter: blur(8px);",
    "  transition:",
    "    background-color 180ms ease,",
    "    border-color 180ms ease,",
    "    transform 180ms ease,",
    "    opacity 180ms ease;",
    "}",
    "",
    ".video-ugc-3d__arrow svg {",
    "  width: 0.95rem;",
    "  height: 0.95rem;",
    "  pointer-events: none;",
    "}",
    "",
    ".video-ugc-3d__arrow:hover:not(:disabled),",
    ".video-ugc-3d__arrow:focus-visible {",
    "  background: #fff;",
    "  border-color: rgba(21, 24, 28, 0.18);",
    "  outline: none;",
    "}",
    "",
    ".video-ugc-3d__arrow:focus-visible {",
    "  outline: 2px solid #fff;",
    "  outline-offset: 3px;",
    "}",
    "",
    ".video-ugc-3d__arrow:active:not(:disabled) {",
    "  transform: scale(0.96);",
    "}",
    "",
    ".video-ugc-3d__arrow:disabled {",
    "  opacity: 0.35;",
    "  cursor: not-allowed;",
    "}",
    "",
    ".video-ugc-3d__pagination {",
    "  display: flex;",
    "  flex-wrap: wrap;",
    "  align-items: center;",
    "  justify-content: center;",
    "  gap: 0.4rem;",
    "  max-width: min(100%, 24rem);",
    "  padding: 0;",
    "  margin: 0;",
    "  list-style: none;",
    "}",
    "",
    ".video-ugc-3d__dot {",
    "  width: 0.4rem;",
    "  height: 0.4rem;",
    "  padding: 0;",
    "  background: rgba(21, 24, 28, 0.22);",
    "  border: 0;",
    "  border-radius: 50%;",
    "  cursor: pointer;",
    "  transition:",
    "    background-color 200ms ease,",
    "    width 200ms ease;",
    "}",
    "",
    ".video-ugc-3d__dot.is-active {",
    "  width: 1.25rem;",
    "  border-radius: 999px;",
    "  background: #15181c;",
    "}",
    "",
    ".video-ugc-3d__dot:hover:not(.is-active),",
    ".video-ugc-3d__dot:focus-visible {",
    "  background: rgba(21, 24, 28, 0.45);",
    "  outline: none;",
    "}",
    "",
    ".video-ugc-3d__dot:focus-visible {",
    "  outline: 2px solid #fff;",
    "  outline-offset: 3px;",
    "}",
    "",
    ".video-ugc-3d__live {",
    "  position: absolute;",
    "  width: 1px;",
    "  height: 1px;",
    "  padding: 0;",
    "  margin: -1px;",
    "  overflow: hidden;",
    "  clip: rect(0, 0, 0, 0);",
    "  white-space: nowrap;",
    "  border: 0;",
    "}",
    "",
    "@media (max-width: 989px) {",
    "  .video-ugc-3d {",
    "    --vu-card-width: min(36vw, 260px);",
    "  }",
    "}",
    "",
    "@media (max-width: 749px) {",
    "  .video-ugc-3d {",
    "    --vu-card-width: min(58vw, 240px);",
    "    padding-block: 1.75rem 2.25rem;",
    "  }",
    "",
    "  .video-ugc-3d__inner {",
    "    width: min(100% - 1rem, 1180px);",
    "  }",
    "}",
    "",
    "@media (max-width: 479px) {",
    "  .video-ugc-3d {",
    "    --vu-card-width: min(68vw, 230px);",
    "  }",
    "}",
    "",
    "@media (prefers-reduced-motion: reduce) {",
    "  .video-ugc-3d {",
    "    --vu-transition: 1ms linear;",
    "  }",
    "",
    "  .video-ugc-3d__slide,",
    "  .video-ugc-3d__poster,",
    "  .video-ugc-3d__media-controls,",
    "  .video-ugc-3d__arrow,",
    "  .video-ugc-3d__dot {",
    "    transition: none !important;",
    "  }",
    "}",
    "",
    "/* No-JS fallback */",
    ".video-ugc-3d:not(.is-ready) .video-ugc-3d__track {",
    "  display: flex;",
    "  gap: 0.85rem;",
    "  overflow-x: auto;",
    "  scroll-snap-type: x mandatory;",
    "  padding: 0.75rem;",
    "  min-height: 0;",
    "  -webkit-overflow-scrolling: touch;",
    "}",
    "",
    ".video-ugc-3d:not(.is-ready) .video-ugc-3d__slide {",
    "  position: relative;",
    "  top: auto;",
    "  left: auto;",
    "  flex: 0 0 var(--vu-card-width);",
    "  scroll-snap-align: center;",
    "  transform: none !important;",
    "  opacity: 1 !important;",
    "  visibility: visible !important;",
    "  filter: none !important;",
    "}",
    "",
    ".video-ugc-3d:not(.is-ready) .video-ugc-3d__nav,",
    ".video-ugc-3d:not(.is-ready) .video-ugc-3d__pagination {",
    "  display: none;",
    "}",
    "",
    "",
    "/* Image-only cards — poster fills, no video chrome */",
    ".video-ugc-3d__slide.is-image-only .video-ugc-3d__video {",
    "  display: none;",
    "}",
    ".video-ugc-3d__slide.is-image-only .video-ugc-3d__poster {",
    "  opacity: 1;",
    "  visibility: visible;",
    "}",
    ".video-ugc-3d__slide.is-image-only .video-ugc-3d__media-controls,",
    ".video-ugc-3d__slide.is-image-only .video-ugc-3d__fallback {",
    "  display: none !important;",
    "}",
    ""
  ].join('\n');

var DEFAULTS = {
    videoAspectRatio: '9 / 16',
    cardWidth: 280,
    perspective: 1300,
    depth: 180,
    rotation: 18,
    scale: 0.84,
    scaleStep: 0.07,
    spacing: 200,
    autoplay: true,
    mutedByDefault: true,
    showMediaControls: true,
    transitionDuration: 650,
    navigation: true,
    pagination: true,
    loop: true,
    visibleSlides: 5,
    tabletVisibleSlides: 3,
    mobileVisibleSlides: 3,
    dragSensitivity: 1,
    swipeThreshold: 48,
    inertia: true,
    clickNeighborToCenter: true,
    respectReducedMotion: true,
    carouselAutoplay: false,
    carouselAutoplayDelay: 8000,
  };

  var INSTANCES = new WeakMap();
  var stylesInjected = false;
  var fontsLoaded = false;
  var uid = 0;

  function injectStyles() {
    if (stylesInjected || typeof document === 'undefined') return;
    if (document.getElementById(STYLE_ID)) {
      stylesInjected = true;
      return;
    }
    var style = document.createElement('style');
    style.id = STYLE_ID;
    style.type = 'text/css';
    style.textContent = CSS;
    document.head.appendChild(style);
    stylesInjected = true;
  }

  function ensureFonts() {
    if (fontsLoaded || typeof document === 'undefined') return;
    if (document.getElementById(FONT_ID)) {
      fontsLoaded = true;
      return;
    }
    var preconnect1 = document.createElement('link');
    preconnect1.rel = 'preconnect';
    preconnect1.href = 'https://fonts.googleapis.com';
    document.head.appendChild(preconnect1);

    var preconnect2 = document.createElement('link');
    preconnect2.rel = 'preconnect';
    preconnect2.href = 'https://fonts.gstatic.com';
    preconnect2.crossOrigin = 'anonymous';
    document.head.appendChild(preconnect2);

    var link = document.createElement('link');
    link.id = FONT_ID;
    link.rel = 'stylesheet';
    link.href = FONT_HREF;
    document.head.appendChild(link);
    fontsLoaded = true;
  }

  function prefersReducedMotion() {
    return (
      global.matchMedia &&
      global.matchMedia('(prefers-reduced-motion: reduce)').matches
    );
  }

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function mergeConfig(base, extra) {
    var out = {};
    var key;
    for (key in base) {
      if (Object.prototype.hasOwnProperty.call(base, key)) out[key] = base[key];
    }
    if (!extra) return out;
    for (key in extra) {
      if (Object.prototype.hasOwnProperty.call(extra, key) && extra[key] !== undefined) {
        out[key] = extra[key];
      }
    }
    return out;
  }

  function parseConfigFromElement(el) {
    var raw = el.getAttribute('data-video-ugc-config');
    if (!raw) return {};
    try {
      return JSON.parse(raw);
    } catch (err) {
      console.warn('[SEVideoUgc3D] Invalid config JSON', err);
      return {};
    }
  }

  function getBreakpointOverrides(config) {
    var width = global.innerWidth || document.documentElement.clientWidth;
    if (width <= 749) {
      return {
        visibleSlides: config.mobileVisibleSlides || 3,
        cardWidth: Math.min(config.cardWidth, 240),
        spacing: Math.min(config.spacing, 150),
        depth: Math.min(config.depth, 130),
        rotation: Math.min(config.rotation, 14),
      };
    }
    if (width <= 989) {
      return {
        visibleSlides: config.tabletVisibleSlides || 3,
        cardWidth: Math.min(config.cardWidth, 260),
        spacing: Math.min(config.spacing, 175),
      };
    }
    return { visibleSlides: config.visibleSlides || 5 };
  }

  function VideoUgc3D(root, userConfig) {
    this.root = root;
    this.instanceId = 'vu-' + ++uid;
    this.userConfig = userConfig || {};
    this.config = mergeConfig(
      DEFAULTS,
      mergeConfig(parseConfigFromElement(root), this.userConfig)
    );
    this.runtime = mergeConfig(this.config, getBreakpointOverrides(this.config));

    this.stage = root.querySelector('[data-video-ugc-stage]');
    this.track = root.querySelector('[data-video-ugc-track]');
    this.liveRegion = root.querySelector('[data-video-ugc-live]');
    this.prevBtn = root.querySelector('[data-video-ugc-prev]');
    this.nextBtn = root.querySelector('[data-video-ugc-next]');
    this.pagination = root.querySelector('[data-video-ugc-pagination]');
    this.nav = root.querySelector('[data-video-ugc-nav]');

    this.slides = [];
    this.index = 0;
    this.isDragging = false;
    this.dragStartX = 0;
    this.dragDelta = 0;
    this.pointerId = null;
    this.autoplayTimer = null;
    this.transitionTimer = null;
    this.userPaused = false;
    this.isMuted = this.runtime.mutedByDefault !== false;
    this.inView = true;
    this.observer = null;
    this.bound = {};
    this.destroyed = false;

    root.setAttribute('data-video-ugc-instance', this.instanceId);
    root.classList.add(this.instanceId);

    if (!this.stage || !this.track) {
      console.warn('[SEVideoUgc3D] Missing stage/track', this.instanceId);
      return;
    }

    this._collectSlides();
    if (!this.slides.length) return;

    this._applyChrome();
    this._bind();
    this._applyVisualConfig();
    this._setupIntersectionObserver();
    this.goTo(this._initialIndex(), { animate: false, announce: false });
    this.root.classList.add('is-ready');
    this._startSlideAutoplay();
  }

  VideoUgc3D.prototype._initialIndex = function () {
    var marked = this.slides.findIndex(function (slide) {
      return slide.classList.contains('is-active') || slide.getAttribute('aria-current') === 'true';
    });
    return marked >= 0 ? marked : 0;
  };

  VideoUgc3D.prototype._hasVideoSource = function (video) {
    if (!video) return false;
    if (video.dataset.src && String(video.dataset.src).trim()) return true;
    if (video.getAttribute('src') && String(video.getAttribute('src')).trim()) return true;
    var sources = video.querySelectorAll('source');
    for (var i = 0; i < sources.length; i++) {
      var src = sources[i].dataset.src || sources[i].getAttribute('src') || '';
      if (String(src).trim()) return true;
    }
    return false;
  };

  VideoUgc3D.prototype._collectSlides = function () {
    this.slides = Array.prototype.slice.call(
      this.track.querySelectorAll('[data-video-ugc-slide]')
    );
    this.slides.forEach(function (slide, i) {
      slide.setAttribute('role', 'group');
      slide.setAttribute('aria-roledescription', 'slide');
      slide.setAttribute('aria-label', i + 1 + ' of ' + this.slides.length);
      slide.dataset.index = String(i);
      slide.id = this.instanceId + '-slide-' + i;

      var video = slide.querySelector('video');
      var hasVideo = this._hasVideoSource(video);
      slide.classList.toggle('is-image-only', !hasVideo);

      if (video && hasVideo) {
        video.muted = this.isMuted;
        video.playsInline = true;
        video.setAttribute('playsinline', '');
        video.setAttribute('webkit-playsinline', '');
        video.preload = 'none';
        video.removeAttribute('autoplay');
        this._detachSources(video);
      } else if (video && !hasVideo) {
        video.remove();
        video = null;
      }

      var controls = slide.querySelector('[data-video-ugc-media-controls]');
      if (controls) {
        controls.hidden = !hasVideo || this.runtime.showMediaControls === false;
      }
    }, this);

    this.root.classList.toggle('is-unmuted', !this.isMuted);
  };

  VideoUgc3D.prototype._detachSources = function (video) {
    if (video.dataset.src && !video.dataset.vuDetached) {
      video.dataset.vuDetached = '1';
    }
    var sources = video.querySelectorAll('source');
    Array.prototype.forEach.call(sources, function (source) {
      if (source.getAttribute('src') && !source.dataset.src) {
        source.dataset.src = source.getAttribute('src');
        source.removeAttribute('src');
      }
    });
    if (video.getAttribute('src') && !video.dataset.src) {
      video.dataset.src = video.getAttribute('src');
      video.removeAttribute('src');
    }
    try {
      video.load();
    } catch (_) { /* noop */ }
  };

  VideoUgc3D.prototype._attachSources = function (video) {
    if (!video) return;
    var sources = video.querySelectorAll('source');
    var attached = false;
    Array.prototype.forEach.call(sources, function (source) {
      if (source.dataset.src && !source.getAttribute('src')) {
        source.setAttribute('src', source.dataset.src);
        attached = true;
      }
    });
    if (video.dataset.src && !video.getAttribute('src') && !sources.length) {
      video.setAttribute('src', video.dataset.src);
      attached = true;
    }
    if (attached || video.readyState === 0) {
      try {
        video.load();
      } catch (_) { /* noop */ }
    }
  };

  VideoUgc3D.prototype._applyChrome = function () {
    if (this.nav) {
      this.nav.hidden = !this.runtime.navigation || this.slides.length < 2;
    }
    if (this.pagination) {
      this.pagination.hidden = !this.runtime.pagination || this.slides.length < 2;
      if (this.runtime.pagination) this._buildPagination();
    }
  };

  VideoUgc3D.prototype._buildPagination = function () {
    var self = this;
    this.pagination.innerHTML = '';
    this.slides.forEach(function (_, i) {
      var li = document.createElement('li');
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'video-ugc-3d__dot';
      btn.setAttribute('data-video-ugc-dot', String(i));
      btn.setAttribute('aria-label', 'Go to video ' + (i + 1));
      btn.setAttribute('aria-controls', self.instanceId + '-slide-' + i);
      if (i === self.index) {
        btn.classList.add('is-active');
        btn.setAttribute('aria-current', 'true');
      }
      li.appendChild(btn);
      self.pagination.appendChild(li);
    });
  };

  VideoUgc3D.prototype._applyVisualConfig = function () {
    var reduced = this.runtime.respectReducedMotion && prefersReducedMotion();
    var speed = reduced ? 1 : this.runtime.transitionDuration;
    this.root.style.setProperty(
      '--vu-transition',
      speed + 'ms cubic-bezier(0.22, 1, 0.36, 1)'
    );
    this.root.style.setProperty('--vu-perspective', this.runtime.perspective + 'px');
    this.root.style.setProperty('--vu-aspect', this.runtime.videoAspectRatio || '9 / 16');
    this.root.style.setProperty(
      '--vu-card-width',
      'min(68vw, ' + this.runtime.cardWidth + 'px)'
    );
    this.stage.style.perspective = this.runtime.perspective + 'px';
  };

  VideoUgc3D.prototype._setupIntersectionObserver = function () {
    var self = this;
    if (!('IntersectionObserver' in global)) {
      this.inView = true;
      return;
    }
    this.observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          self.inView = entry.isIntersecting && entry.intersectionRatio > 0.35;
          if (!self.inView) self._pauseAll();
          else self._syncActivePlayback();
        });
      },
      { threshold: [0, 0.35, 0.6] }
    );
    this.observer.observe(this.root);
  };

  VideoUgc3D.prototype._bind = function () {
    var self = this;

    this.bound.onPrev = function (e) {
      e.preventDefault();
      self.prev();
    };
    this.bound.onNext = function (e) {
      e.preventDefault();
      self.next();
    };
    this.bound.onPagination = function (e) {
      var btn = e.target.closest('[data-video-ugc-dot]');
      if (!btn || !self.pagination.contains(btn)) return;
      var i = Number(btn.getAttribute('data-video-ugc-dot'));
      if (!Number.isNaN(i)) self.goTo(i);
    };
    this.bound.onSlideClick = function (e) {
      var playBtn = e.target.closest('[data-video-ugc-play]');
      var muteBtn = e.target.closest('[data-video-ugc-mute]');
      if (playBtn) {
        e.preventDefault();
        e.stopPropagation();
        self._togglePlay();
        return;
      }
      if (muteBtn) {
        e.preventDefault();
        e.stopPropagation();
        self._toggleMute();
        return;
      }

      if (!self.runtime.clickNeighborToCenter) return;
      if (Math.abs(self.dragDelta) > 8) return;
      var slide = e.target.closest('[data-video-ugc-slide]');
      if (!slide || !self.track.contains(slide)) return;
      if (slide.classList.contains('is-active')) return;
      if (e.target.closest('a, button')) e.preventDefault();
      var i = Number(slide.dataset.index);
      if (!Number.isNaN(i)) self.goTo(i);
    };
    this.bound.onPointerDown = function (e) {
      self._onPointerDown(e);
    };
    this.bound.onPointerMove = function (e) {
      self._onPointerMove(e);
    };
    this.bound.onPointerUp = function (e) {
      self._onPointerUp(e);
    };
    this.bound.onKeyDown = function (e) {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        self.prev();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        self.next();
      } else if (e.key === ' ' || e.key === 'k' || e.key === 'K') {
        e.preventDefault();
        self._togglePlay();
      } else if (e.key === 'm' || e.key === 'M') {
        e.preventDefault();
        self._toggleMute();
      } else if (e.key === 'Home') {
        e.preventDefault();
        self.goTo(0);
      } else if (e.key === 'End') {
        e.preventDefault();
        self.goTo(self.slides.length - 1);
      }
    };
    this.bound.onResize = debounce(function () {
      self._onResize();
    }, 150);
    this.bound.onVisibility = function () {
      if (document.hidden) {
        self._pauseAll();
        self._stopSlideAutoplay();
      } else {
        self._syncActivePlayback();
        self._startSlideAutoplay();
      }
    };
    this.bound.onEnter = function () {
      self._stopSlideAutoplay();
    };
    this.bound.onLeave = function () {
      self._startSlideAutoplay();
    };
    this.bound.onTouchMoveGuard = function (e) {
      if (!self.isDragging) return;
      if (Math.abs(self.dragDelta) > 8 && e.cancelable) e.preventDefault();
    };
    this.bound.onVideoError = function (e) {
      var video = e.target;
      var slide = video.closest('[data-video-ugc-slide]');
      if (slide) slide.classList.add('is-error');
    };

    if (this.prevBtn) this.prevBtn.addEventListener('click', this.bound.onPrev);
    if (this.nextBtn) this.nextBtn.addEventListener('click', this.bound.onNext);
    if (this.pagination) this.pagination.addEventListener('click', this.bound.onPagination);
    this.track.addEventListener('click', this.bound.onSlideClick);
    this.stage.addEventListener('pointerdown', this.bound.onPointerDown);
    this.stage.addEventListener('touchmove', this.bound.onTouchMoveGuard, { passive: false });
    this.root.addEventListener('keydown', this.bound.onKeyDown);
    this.root.setAttribute('tabindex', '0');
    this.root.setAttribute('aria-roledescription', 'carousel');
    global.addEventListener('resize', this.bound.onResize);
    document.addEventListener('visibilitychange', this.bound.onVisibility);
    this.root.addEventListener('mouseenter', this.bound.onEnter);
    this.root.addEventListener('mouseleave', this.bound.onLeave);
    this.root.addEventListener('focusin', this.bound.onEnter);
    this.root.addEventListener('focusout', this.bound.onLeave);

    this.slides.forEach(function (slide) {
      var video = slide.querySelector('video');
      if (video) video.addEventListener('error', this.bound.onVideoError);
    }, this);
  };

  VideoUgc3D.prototype._onResize = function () {
    this.runtime = mergeConfig(this.config, getBreakpointOverrides(this.config));
    this._applyVisualConfig();
    this._applyChrome();
    this._render({ animate: false });
  };

  VideoUgc3D.prototype._onPointerDown = function (e) {
    if (e.button !== undefined && e.button !== 0) return;
    if (e.target.closest('a, button')) return;
    this.isDragging = true;
    this.pointerId = e.pointerId;
    this.dragStartX = e.clientX;
    this.dragDelta = 0;
    this.stage.classList.add('is-dragging');
    this.root.classList.add('is-dragging');
    this._stopSlideAutoplay();
    try {
      this.stage.setPointerCapture(e.pointerId);
    } catch (_) { /* noop */ }
    this.stage.addEventListener('pointermove', this.bound.onPointerMove);
    this.stage.addEventListener('pointerup', this.bound.onPointerUp);
    this.stage.addEventListener('pointercancel', this.bound.onPointerUp);
  };

  VideoUgc3D.prototype._onPointerMove = function (e) {
    if (!this.isDragging) return;
    this.dragDelta = (e.clientX - this.dragStartX) * (this.runtime.dragSensitivity || 1);
    if (!(this.runtime.respectReducedMotion && prefersReducedMotion())) {
      this._renderDragPreview(this.dragDelta);
    }
  };

  VideoUgc3D.prototype._onPointerUp = function () {
    if (!this.isDragging) return;
    this.isDragging = false;
    this.stage.classList.remove('is-dragging');
    this.root.classList.remove('is-dragging');
    this.stage.removeEventListener('pointermove', this.bound.onPointerMove);
    this.stage.removeEventListener('pointerup', this.bound.onPointerUp);
    this.stage.removeEventListener('pointercancel', this.bound.onPointerUp);
    try {
      if (this.pointerId !== null) this.stage.releasePointerCapture(this.pointerId);
    } catch (_) { /* noop */ }
    this.pointerId = null;

    var delta = this.dragDelta;
    var threshold = this.runtime.swipeThreshold || 48;
    var spacing = this.runtime.spacing || 200;
    var steps = 0;

    if (this.runtime.inertia && Math.abs(delta) > threshold) {
      steps = Math.round(delta / spacing);
      if (steps === 0) steps = delta > 0 ? 1 : -1;
      steps = clamp(steps, -2, 2);
    } else if (Math.abs(delta) > threshold) {
      steps = delta > 0 ? 1 : -1;
    }

    this.dragDelta = 0;

    if (steps !== 0) this.goTo(this.index - steps);
    else this._render({ animate: true });

    this._startSlideAutoplay();
  };

  VideoUgc3D.prototype._wrapIndex = function (i) {
    var len = this.slides.length;
    if (!len) return 0;
    if (this.runtime.loop) return ((i % len) + len) % len;
    return clamp(i, 0, len - 1);
  };

  VideoUgc3D.prototype._offsetForIndex = function (slideIndex, activeIndex) {
    var len = this.slides.length;
    if (!this.runtime.loop) return slideIndex - activeIndex;
    var half = Math.floor(len / 2);
    var offset = slideIndex - activeIndex;
    if (offset > half) offset -= len;
    if (offset < -half) offset += len;
    return offset;
  };

  VideoUgc3D.prototype._sideCount = function () {
    var visible = Math.max(1, this.runtime.visibleSlides || 5);
    return Math.max(1, Math.floor((visible - 1) / 2));
  };

  VideoUgc3D.prototype._transformForOffset = function (offset, dragProgress) {
    var cfg = this.runtime;
    var t = offset - (dragProgress || 0);
    var abs = Math.abs(t);
    var dir = t === 0 ? 0 : t > 0 ? 1 : -1;

    var x = t * cfg.spacing;
    var z = abs === 0 ? 40 : -cfg.depth * Math.min(abs, 1) - cfg.depth * 0.35 * Math.max(abs - 1, 0);
    var rotateY =
      -dir * cfg.rotation * Math.min(abs, 1) -
      dir * cfg.rotation * 0.25 * Math.max(abs - 1, 0);

    var scale = 1;
    if (abs < 1) scale = 1 - (1 - cfg.scale) * abs;
    else scale = Math.max(cfg.scale - cfg.scaleStep * (abs - 1), 0.68);

    var side = this._sideCount();
    var opacity = 1;
    if (abs > side + 0.15) opacity = 0;
    else if (abs > side - 0.2) opacity = clamp(1 - (abs - (side - 0.2)) / 0.5, 0, 1);
    else if (abs > 0) opacity = 1 - Math.min(abs, 1) * 0.1;

    return { x: x, z: z, rotateY: rotateY, scale: scale, opacity: opacity };
  };

  VideoUgc3D.prototype._applySlideTransform = function (slide, t) {
    slide.style.transform =
      'translate(-50%, -50%) translate3d(' +
      t.x +
      'px, 0, ' +
      t.z +
      'px) rotateY(' +
      t.rotateY +
      'deg) scale(' +
      t.scale +
      ')';
    slide.style.opacity = String(t.opacity);
  };

  VideoUgc3D.prototype._manageVideoLoading = function () {
    var self = this;
    var side = this._sideCount();
    this.slides.forEach(function (slide, i) {
      var offset = Math.abs(self._offsetForIndex(i, self.index));
      var video = slide.querySelector('video');
      if (!video) return;

      if (offset <= side) {
        self._attachSources(video);
        video.preload = offset === 0 ? 'auto' : 'metadata';
      } else {
        video.preload = 'none';
        // Keep detached for far slides to save bandwidth
        if (video.getAttribute('src') || video.querySelector('source[src]')) {
          self._pauseVideo(slide);
          self._detachSources(video);
        }
      }
    });
  };

  VideoUgc3D.prototype._pauseVideo = function (slide) {
    var video = slide.querySelector('video');
    if (!video) return;
    try {
      video.pause();
      video.currentTime = 0;
    } catch (_) { /* noop */ }
    slide.classList.remove('is-playing');
  };

  VideoUgc3D.prototype._pauseAll = function () {
    this.slides.forEach(function (slide) {
      this._pauseVideo(slide);
    }, this);
  };

  VideoUgc3D.prototype._playActive = function () {
    var self = this;
    if (!this.inView || document.hidden) return;
    if (this.runtime.respectReducedMotion && prefersReducedMotion() && !this.runtime.autoplay) {
      return;
    }

    var active = this.slides[this.index];
    if (!active || active.classList.contains('is-error')) return;
    var video = active.querySelector('video');
    if (!video) return;

    this._attachSources(video);
    video.muted = this.isMuted;
    video.loop = true;

    var playPromise = video.play();
    if (playPromise && typeof playPromise.then === 'function') {
      playPromise
        .then(function () {
          active.classList.add('is-playing');
        })
        .catch(function () {
          // Autoplay blocked — keep poster, wait for user gesture
          active.classList.remove('is-playing');
        });
    } else {
      active.classList.add('is-playing');
    }
  };

  VideoUgc3D.prototype._syncActivePlayback = function () {
    var self = this;
    this.slides.forEach(function (slide, i) {
      if (i !== self.index) self._pauseVideo(slide);
    });

    if (this.userPaused) return;
    if (this.runtime.autoplay === false) return;
    this._playActive();
  };

  VideoUgc3D.prototype._togglePlay = function () {
    var active = this.slides[this.index];
    if (!active) return;
    var video = active.querySelector('video');
    if (!video) return;

    if (active.classList.contains('is-playing') && !video.paused) {
      video.pause();
      active.classList.remove('is-playing');
      this.userPaused = true;
    } else {
      this.userPaused = false;
      this._playActive();
    }
  };

  VideoUgc3D.prototype._toggleMute = function () {
    this.isMuted = !this.isMuted;
    this.root.classList.toggle('is-unmuted', !this.isMuted);
    this.slides.forEach(function (slide) {
      var video = slide.querySelector('video');
      if (video) video.muted = this.isMuted;
      slide.classList.toggle('is-unmuted', !this.isMuted);
    }, this);
  };

  VideoUgc3D.prototype._renderDragPreview = function (deltaX) {
    var progress = deltaX / (this.runtime.spacing || 200);
    var self = this;
    var side = this._sideCount();
    this.slides.forEach(function (slide, i) {
      var offset = self._offsetForIndex(i, self.index);
      var t = self._transformForOffset(offset, progress);
      var hidden = Math.abs(offset - progress) > side + 1.1;
      slide.classList.toggle('is-hidden', hidden);
      self._applySlideTransform(slide, t);
    });
  };

  VideoUgc3D.prototype._render = function (options) {
    options = options || {};
    var animate =
      options.animate !== false &&
      !(this.runtime.respectReducedMotion && prefersReducedMotion());
    var self = this;
    var side = this._sideCount();

    if (!animate) this.root.classList.add('is-instant');
    this.root.classList.toggle('is-animating', animate);

    this.slides.forEach(function (slide, i) {
      var offset = self._offsetForIndex(i, self.index);
      var abs = Math.abs(offset);
      var t = self._transformForOffset(offset, 0);
      var isActive = offset === 0;
      var hidden = abs > side;

      slide.classList.toggle('is-active', isActive);
      slide.classList.toggle('is-hidden', hidden);
      slide.classList.toggle('is-clickable', !isActive && abs <= side);
      slide.classList.toggle('is-unmuted', !self.isMuted);
      slide.setAttribute('aria-hidden', isActive ? 'false' : 'true');
      slide.tabIndex = isActive ? 0 : -1;
      slide.style.zIndex = String(100 - Math.round(abs * 10));

      self._applySlideTransform(slide, t);
    });

    this._manageVideoLoading();
    this._syncChrome();

    // Reset user pause on slide change unless same index
    if (options.resetPause !== false) this.userPaused = false;
    this._syncActivePlayback();

    if (!animate) {
      void this.track.offsetHeight;
      this.root.classList.remove('is-instant');
    }

    clearTimeout(this.transitionTimer);
    if (animate) {
      this.transitionTimer = setTimeout(function () {
        self.root.classList.remove('is-animating');
      }, this.runtime.transitionDuration + 40);
    } else {
      this.root.classList.remove('is-animating');
    }
  };

  VideoUgc3D.prototype._syncChrome = function () {
    var i;
    if (this.pagination && this.runtime.pagination) {
      var dots = this.pagination.querySelectorAll('[data-video-ugc-dot]');
      for (i = 0; i < dots.length; i++) {
        var active = i === this.index;
        dots[i].classList.toggle('is-active', active);
        if (active) dots[i].setAttribute('aria-current', 'true');
        else dots[i].removeAttribute('aria-current');
      }
    }

    if (!this.runtime.loop) {
      if (this.prevBtn) this.prevBtn.disabled = this.index <= 0;
      if (this.nextBtn) this.nextBtn.disabled = this.index >= this.slides.length - 1;
    } else {
      if (this.prevBtn) this.prevBtn.disabled = this.slides.length < 2;
      if (this.nextBtn) this.nextBtn.disabled = this.slides.length < 2;
    }
  };

  VideoUgc3D.prototype._announce = function () {
    if (!this.liveRegion) return;
    var active = this.slides[this.index];
    if (!active) return;
    var title =
      active.getAttribute('data-video-title') ||
      (active.querySelector('.video-ugc-3d__title') &&
        active.querySelector('.video-ugc-3d__title').textContent) ||
      (active.querySelector('.video-ugc-3d__name') &&
        active.querySelector('.video-ugc-3d__name').textContent) ||
      'Video ' + (this.index + 1);
    this.liveRegion.textContent =
      title.trim() + ', slide ' + (this.index + 1) + ' of ' + this.slides.length;
  };

  VideoUgc3D.prototype.goTo = function (index, options) {
    options = options || {};
    if (!this.slides.length) return;
    var next = this._wrapIndex(index);
    if (!this.runtime.loop) next = clamp(index, 0, this.slides.length - 1);
    this._pauseAll();
    this.index = next;
    this._render({ animate: options.animate !== false });
    if (options.announce !== false) this._announce();
    this._restartSlideAutoplay();
  };

  VideoUgc3D.prototype.next = function () {
    this.goTo(this.index + 1);
  };

  VideoUgc3D.prototype.prev = function () {
    this.goTo(this.index - 1);
  };

  VideoUgc3D.prototype._startSlideAutoplay = function () {
    // Carousel slide rotation — separate from video autoplay
    // Disabled by default unless explicitly wanted via data attribute carouselAutoplay
    // Using runtime.autoplay for VIDEO only. Slide rotation uses carouselAutoplay if set.
    var self = this;
    this._stopSlideAutoplay();
    if (!this.runtime.carouselAutoplay || this.slides.length < 2) return;
    if (this.runtime.respectReducedMotion && prefersReducedMotion()) return;
    if (document.hidden) return;
    this.autoplayTimer = setInterval(function () {
      self.next();
    }, Math.max(4000, this.runtime.carouselAutoplayDelay || 8000));
  };

  VideoUgc3D.prototype._stopSlideAutoplay = function () {
    if (this.autoplayTimer) {
      clearInterval(this.autoplayTimer);
      this.autoplayTimer = null;
    }
  };

  VideoUgc3D.prototype._restartSlideAutoplay = function () {
    if (this.runtime.carouselAutoplay) this._startSlideAutoplay();
  };

  VideoUgc3D.prototype.updateConfig = function (partial) {
    this.userConfig = mergeConfig(this.userConfig, partial || {});
    this.config = mergeConfig(
      DEFAULTS,
      mergeConfig(parseConfigFromElement(this.root), this.userConfig)
    );
    this.runtime = mergeConfig(this.config, getBreakpointOverrides(this.config));
    if (partial && partial.mutedByDefault !== undefined) {
      this.isMuted = !!partial.mutedByDefault;
    }
    this._applyVisualConfig();
    this._applyChrome();
    this._render({ animate: false });
  };

  VideoUgc3D.prototype.refresh = function () {
    this._collectSlides();
    this._applyChrome();
    this.index = this._wrapIndex(this.index);
    this._render({ animate: false });
  };

  VideoUgc3D.prototype.destroy = function () {
    if (this.destroyed) return;
    this.destroyed = true;
    this._stopSlideAutoplay();
    this._pauseAll();
    clearTimeout(this.transitionTimer);
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }

    if (this.prevBtn) this.prevBtn.removeEventListener('click', this.bound.onPrev);
    if (this.nextBtn) this.nextBtn.removeEventListener('click', this.bound.onNext);
    if (this.pagination) this.pagination.removeEventListener('click', this.bound.onPagination);
    this.track.removeEventListener('click', this.bound.onSlideClick);
    this.stage.removeEventListener('pointerdown', this.bound.onPointerDown);
    this.stage.removeEventListener('touchmove', this.bound.onTouchMoveGuard);
    this.root.removeEventListener('keydown', this.bound.onKeyDown);
    global.removeEventListener('resize', this.bound.onResize);
    document.removeEventListener('visibilitychange', this.bound.onVisibility);
    this.root.removeEventListener('mouseenter', this.bound.onEnter);
    this.root.removeEventListener('mouseleave', this.bound.onLeave);
    this.root.removeEventListener('focusin', this.bound.onEnter);
    this.root.removeEventListener('focusout', this.bound.onLeave);

    this.slides.forEach(function (slide) {
      var video = slide.querySelector('video');
      if (video) video.removeEventListener('error', this.bound.onVideoError);
      slide.style.transform = '';
      slide.style.opacity = '';
      slide.classList.remove('is-active', 'is-hidden', 'is-clickable', 'is-playing', 'is-error');
    }, this);

    this.root.classList.remove(
      'is-ready',
      'is-animating',
      'is-dragging',
      'is-instant',
      'is-unmuted',
      this.instanceId
    );
    this.root.removeAttribute('data-video-ugc-instance');
    INSTANCES.delete(this.root);
  };

  function debounce(fn, wait) {
    var t;
    return function () {
      var ctx = this;
      var args = arguments;
      clearTimeout(t);
      t = setTimeout(function () {
        fn.apply(ctx, args);
      }, wait);
    };
  }

  function init(root, config) {
    if (!root) return null;
    injectStyles();
    ensureFonts();

    var existing = INSTANCES.get(root);
    if (existing) existing.destroy();

    var instance = new VideoUgc3D(root, config);
    INSTANCES.set(root, instance);
    return instance;
  }

  function getInstance(root) {
    return INSTANCES.get(root) || null;
  }

  function initAll(selector, config) {
    var nodes = document.querySelectorAll(selector || '[data-video-ugc]');
    var instances = [];
    Array.prototype.forEach.call(nodes, function (node) {
      instances.push(init(node, config));
    });
    return instances;
  }

  global.SEVideoUgc3D = {
    defaults: DEFAULTS,
    init: init,
    initAll: initAll,
    getInstance: getInstance,
    injectStyles: injectStyles,
  };

  // Compatibility alias
  global.VideoUgc3D = global.SEVideoUgc3D;

  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function () {
        initAll();
      });
    } else {
      initAll();
    }
  }

})(typeof window !== 'undefined' ? window : this);
