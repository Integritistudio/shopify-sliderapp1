/**
 * SlideEase Collection 3D Carousel
 * Self-contained IIFE — exposes window.SECollectionCarousel
 */
(function (global) {
  'use strict';

  var STYLE_ID = 'se-collection-carousel-styles';
  var FONT_ID = 'se-collection-carousel-fonts';
  var FONT_HREF =
    'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600&family=Manrope:wght@500;600;700&display=swap';

  var DEFAULTS = {
    perspective: 1400,
    depth: 200,
    rotation: 42,
    scale: 0.78,
    scaleStep: 0.09,
    spacing: 250,
    overlay: 0.55,
    borderRadius: 4,
    transitionDuration: 700,
    autoplay: false,
    autoplayDelay: 4800,
    navigation: true,
    pagination: true,
    loop: true,
    /** Total visible slides (odd preferred): desktop 5, tablet 3, mobile 3 */
    visibleSlides: 5,
    mobileVisibleSlides: 3,
    tabletVisibleSlides: 3,
    dragSensitivity: 1,
    swipeThreshold: 48,
    inertia: true,
    clickNeighborToCenter: true,
    respectReducedMotion: true,
  };

  var INSTANCES = new WeakMap();
  var stylesInjected = false;
  var fontsLoaded = false;
  var uid = 0;

  var CSS = [
    '/**',
    ' * 3D Collection Category Carousel',
    ' * Premium Shopify-ready styles — cinematic collection navigation',
    ' */',
    '',
    '.collection-3d {',
    '  --c3-bg-a: #ece8e2;',
    '  --c3-bg-b: #d8d2c8;',
    '  --c3-ink: #141210;',
    '  --c3-ink-muted: #6a645c;',
    '  --c3-surface-text: #ffffff;',
    '  --c3-overlay: 0.55;',
    '  --c3-radius: 4px;',
    '  --c3-font-display: "Cormorant Garamond", "Times New Roman", serif;',
    '  --c3-font-body: "Manrope", "Helvetica Neue", sans-serif;',
    '  --c3-transition: 700ms cubic-bezier(0.22, 1, 0.36, 1);',
    '  --c3-perspective: 1400px;',
    '  --c3-slide-width: min(38vw, 360px);',
    '  --c3-stage-pad: clamp(2rem, 5vw, 4rem);',
    '',
    '  position: relative;',
    '  isolation: isolate;',
    '  width: 100vw;',
    '  max-width: 100vw;',
    '  margin-left: calc(50% - 50vw);',
    '  margin-right: calc(50% - 50vw);',
    '  padding: clamp(2.5rem, 6vw, 5rem) 0 clamp(2.5rem, 5vw, 4.5rem);',
    '  font-family: var(--c3-font-body);',
    '  color: var(--c3-ink);',
    '  --c3-section-bg: radial-gradient(85% 60% at 50% 0%, rgba(255, 255, 255, 0.55) 0%, transparent 58%), linear-gradient(168deg, var(--c3-bg-a) 0%, var(--c3-bg-b) 100%);',
    '  background: var(--c3-section-bg);',
    '  overflow: hidden;',
    '  -webkit-font-smoothing: antialiased;',
    '  -moz-osx-font-smoothing: grayscale;',
    '}',
    '',
    '.collection-3d *,',
    '.collection-3d *::before,',
    '.collection-3d *::after {',
    '  box-sizing: border-box;',
    '}',
    '',
    '.collection-3d__inner {',
    '  width: min(100% - 2.5rem, 1240px);',
    '  margin-inline: auto;',
    '}',
    '',
    '.collection-3d__header {',
    '  text-align: center;',
    '  margin-bottom: clamp(1.75rem, 4vw, 3rem);',
    '}',
    '',
    '.collection-3d__eyebrow {',
    '  display: block;',
    '  margin: 0 0 0.65rem;',
    '  font-size: var(--c3-section-subheading-size, 0.6875rem);',
    '  font-weight: 600;',
    '  letter-spacing: 0.24em;',
    '  text-transform: uppercase;',
    '  color: #8a6a3d;',
    '}',
    '',
    '.collection-3d__heading {',
    '  margin: 0;',
    '  font-family: var(--c3-font-display);',
    '  font-size: var(--c3-section-heading-size, clamp(2.25rem, 5vw, 3.75rem));',
    '  font-weight: 500;',
    '  line-height: 1.05;',
    '  letter-spacing: -0.02em;',
    '}',
    '',
    '.collection-3d__subheading {',
    '  margin: 0.85rem auto 0;',
    '  max-width: 30rem;',
    '  font-size: var(--c3-section-description-size, 0.9375rem);',
    '  line-height: 1.6;',
    '  color: var(--c3-ink-muted);',
    '}',
    '',
    '/* Stage */',
    '.collection-3d__stage {',
    '  position: relative;',
    '  width: 100%;',
    '  perspective: var(--c3-perspective);',
    '  perspective-origin: 50% 42%;',
    '  touch-action: pan-y;',
    '  overscroll-behavior-x: none;',
    '  user-select: none;',
    '  -webkit-user-select: none;',
    '  cursor: grab;',
    '}',
    '',
    '.collection-3d__stage.is-dragging {',
    '  cursor: grabbing;',
    '}',
    '',
    '.collection-3d.is-dragging .collection-3d__slide,',
    '.collection-3d.is-instant .collection-3d__slide {',
    '  transition: none;',
    '}',
    '',
    '.collection-3d__track {',
    '  position: relative;',
    '  display: flex;',
    '  align-items: center;',
    '  justify-content: center;',
    '  width: 100%;',
    '  min-height: calc(var(--c3-slide-width) * 1.35 + var(--c3-stage-pad) * 2);',
    '  padding-block: var(--c3-stage-pad);',
    '  transform-style: preserve-3d;',
    '}',
    '',
    '/* Slides */',
    '.collection-3d__slide {',
    '  position: absolute;',
    '  top: 50%;',
    '  left: 50%;',
    '  width: var(--c3-slide-width);',
    '  margin: 0;',
    '  padding: 0;',
    '  list-style: none;',
    '  transform-style: preserve-3d;',
    '  transform-origin: center center;',
    '  transition:',
    '    transform var(--c3-transition),',
    '    opacity var(--c3-transition),',
    '    filter var(--c3-transition),',
    '    visibility var(--c3-transition);',
    '  will-change: transform, opacity, filter;',
    '  backface-visibility: hidden;',
    '  -webkit-backface-visibility: hidden;',
    '}',
    '',
    '.collection-3d__slide.is-hidden {',
    '  visibility: hidden;',
    '  pointer-events: none;',
    '  opacity: 0;',
    '}',
    '',
    '.collection-3d__slide.is-active {',
    '  z-index: 20;',
    '}',
    '',
    '.collection-3d__slide.is-clickable:not(.is-active) {',
    '  cursor: pointer;',
    '}',
    '',
    '.collection-3d.is-animating .collection-3d__slide {',
    '  pointer-events: none;',
    '}',
    '',
    '.collection-3d__slide:not(.is-active) {',
    '  filter: brightness(0.78) saturate(0.88);',
    '}',
    '',
    '.collection-3d__slide.is-active {',
    '  filter: none;',
    '}',
    '',
    '.collection-3d__slide.is-active .collection-3d__card {',
    '  box-shadow:',
    '    0 8px 20px rgba(20, 18, 16, 0.12),',
    '    0 28px 56px rgba(20, 18, 16, 0.22);',
    '}',
    '',
    '.collection-3d__slide:not(.is-active) .collection-3d__card {',
    '  box-shadow: 0 14px 32px rgba(20, 18, 16, 0.14);',
    '}',
    '',
    '/* Card */',
    '.collection-3d__card {',
    '  position: relative;',
    '  display: block;',
    '  width: 100%;',
    '  aspect-ratio: 3 / 4;',
    '  border-radius: var(--c3-radius);',
    '  overflow: hidden;',
    '  background: #2a2622;',
    '  text-decoration: none;',
    '  color: var(--c3-surface-text);',
    '  transform: translateZ(0);',
    '}',
    '',
    '.collection-3d__media {',
    '  position: absolute;',
    '  inset: 0;',
    '  overflow: hidden;',
    '}',
    '',
    '.collection-3d__image {',
    '  display: block;',
    '  width: 100%;',
    '  height: 100%;',
    '  object-fit: cover;',
    '  object-position: center;',
    '  transform: scale(1.06);',
    '  transition: transform 1000ms cubic-bezier(0.22, 1, 0.36, 1);',
    '}',
    '',
    '.collection-3d__slide.is-active .collection-3d__image {',
    '  transform: scale(1);',
    '}',
    '',
    '.collection-3d__overlay {',
    '  position: absolute;',
    '  inset: 0;',
    '  z-index: 1;',
    '  pointer-events: none;',
    '  background: linear-gradient(',
    '    180deg,',
    '    rgba(20, 18, 16, calc(var(--c3-overlay) * 0.15)) 0%,',
    '    rgba(20, 18, 16, calc(var(--c3-overlay) * 0.35)) 45%,',
    '    rgba(20, 18, 16, calc(var(--c3-overlay) * 1.05)) 100%',
    '  );',
    '}',
    '',
    '.collection-3d__content {',
    '  position: absolute;',
    '  left: 0;',
    '  right: 0;',
    '  bottom: 0;',
    '  z-index: 2;',
    '  display: flex;',
    '  flex-direction: column;',
    '  align-items: flex-start;',
    '  gap: 0.4rem;',
    '  padding: 1.35rem 1.25rem 1.4rem;',
    '  transform: translate3d(0, 8px, 0);',
    '  opacity: 0.88;',
    '  transition:',
    '    transform var(--c3-transition),',
    '    opacity var(--c3-transition);',
    '}',
    '',
    '.collection-3d__slide.is-active .collection-3d__content {',
    '  transform: translate3d(0, 0, 0);',
    '  opacity: 1;',
    '}',
    '',
    '.collection-3d__count {',
    '  margin: 0;',
    '  font-size: 0.625rem;',
    '  font-weight: 600;',
    '  letter-spacing: 0.18em;',
    '  text-transform: uppercase;',
    '  color: rgba(255, 255, 255, 0.7);',
    '}',
    '',
    '.collection-3d__title {',
    '  margin: 0;',
    '  font-family: var(--c3-font-display);',
    '  font-size: var(--c3-slide-title-size, clamp(1.45rem, 2.8vw, 2rem));',
    '  font-weight: 500;',
    '  line-height: 1.15;',
    '  letter-spacing: -0.015em;',
    '  color: #fff;',
    '}',
    '',
    '.collection-3d__description {',
    '  margin: 0.15rem 0 0;',
    '  max-width: 28ch;',
    '  font-size: var(--c3-slide-detail-size, 0.8125rem);',
    '  line-height: 1.5;',
    '  color: rgba(255, 255, 255, 0.78);',
    '}',
    '',
    '.collection-3d__slide:not(.is-active) .collection-3d__description {',
    '  display: none;',
    '}',
    '',
    '.collection-3d__cta {',
    '  display: inline-flex;',
    '  align-items: center;',
    '  margin-top: 0.65rem;',
    '  min-height: 2.35rem;',
    '  padding: 0.55rem 1.1rem;',
    '  font-family: var(--c3-font-body);',
    '  font-size: 0.6875rem;',
    '  font-weight: 700;',
    '  letter-spacing: 0.14em;',
    '  text-transform: uppercase;',
    '  text-decoration: none;',
    '  color: var(--c3-ink);',
    '  background: #fff;',
    '  border: 1px solid #fff;',
    '  border-radius: 1px;',
    '  pointer-events: auto;',
    '  transition:',
    '    background-color 200ms ease,',
    '    color 200ms ease;',
    '}',
    '',
    '.collection-3d__cta:hover,',
    '.collection-3d__cta:focus-visible {',
    '  background: transparent;',
    '  color: #fff;',
    '  outline: none;',
    '}',
    '',
    '.collection-3d__cta:focus-visible {',
    '  outline: 2px solid #fff;',
    '  outline-offset: 3px;',
    '}',
    '',
    '.collection-3d__slide:not(.is-active) .collection-3d__cta {',
    '  pointer-events: none;',
    '  opacity: 0.85;',
    '}',
    '',
    '/* When entire card is a link, keep CTA non-nested-link look */',
    'a.collection-3d__card .collection-3d__cta {',
    '  pointer-events: none;',
    '}',
    '',
    '.collection-3d__slide.is-active a.collection-3d__card:hover .collection-3d__image,',
    '.collection-3d__slide.is-active a.collection-3d__card:focus-visible .collection-3d__image {',
    '  transform: scale(1.03);',
    '}',
    '',
    '/* Controls */',
    '.collection-3d__controls {',
    '  display: flex;',
    '  flex-direction: column;',
    '  align-items: center;',
    '  gap: 1.15rem;',
    '  margin-top: clamp(0.5rem, 2vw, 1.25rem);',
    '}',
    '',
    '.collection-3d__nav {',
    '  display: flex;',
    '  align-items: center;',
    '  justify-content: center;',
    '  gap: 0.7rem;',
    '}',
    '',
    '.collection-3d__arrow {',
    '  display: inline-flex;',
    '  align-items: center;',
    '  justify-content: center;',
    '  width: 2.75rem;',
    '  height: 2.75rem;',
    '  padding: 0;',
    '  color: var(--c3-ink);',
    '  background: rgba(255, 255, 255, 0.55);',
    '  border: 1px solid rgba(20, 18, 16, 0.08);',
    '  border-radius: 50%;',
    '  cursor: pointer;',
    '  backdrop-filter: blur(8px);',
    '  transition:',
    '    background-color 180ms ease,',
    '    border-color 180ms ease,',
    '    transform 180ms ease,',
    '    opacity 180ms ease;',
    '}',
    '',
    '.collection-3d__arrow svg {',
    '  width: 0.95rem;',
    '  height: 0.95rem;',
    '  pointer-events: none;',
    '}',
    '',
    '.collection-3d__arrow:hover:not(:disabled),',
    '.collection-3d__arrow:focus-visible {',
    '  background: #fff;',
    '  border-color: rgba(20, 18, 16, 0.18);',
    '  outline: none;',
    '}',
    '',
    '.collection-3d__arrow:focus-visible {',
    '  outline: 2px solid #8a6a3d;',
    '  outline-offset: 3px;',
    '}',
    '',
    '.collection-3d__arrow:active:not(:disabled) {',
    '  transform: scale(0.96);',
    '}',
    '',
    '.collection-3d__arrow:disabled {',
    '  opacity: 0.35;',
    '  cursor: not-allowed;',
    '}',
    '',
    '.collection-3d__pagination {',
    '  display: flex;',
    '  flex-wrap: wrap;',
    '  align-items: center;',
    '  justify-content: center;',
    '  gap: 0.4rem;',
    '  max-width: min(100%, 26rem);',
    '  padding: 0;',
    '  margin: 0;',
    '  list-style: none;',
    '}',
    '',
    '.collection-3d__dot {',
    '  width: 0.4rem;',
    '  height: 0.4rem;',
    '  padding: 0;',
    '  background: rgba(20, 18, 16, 0.2);',
    '  border: 0;',
    '  border-radius: 50%;',
    '  cursor: pointer;',
    '  transition:',
    '    background-color 200ms ease,',
    '    width 200ms ease;',
    '}',
    '',
    '.collection-3d__dot.is-active {',
    '  width: 1.25rem;',
    '  border-radius: 999px;',
    '  background: var(--c3-ink);',
    '}',
    '',
    '.collection-3d__dot:hover:not(.is-active),',
    '.collection-3d__dot:focus-visible {',
    '  background: rgba(20, 18, 16, 0.42);',
    '  outline: none;',
    '}',
    '',
    '.collection-3d__dot:focus-visible {',
    '  outline: 2px solid #8a6a3d;',
    '  outline-offset: 3px;',
    '}',
    '',
    '.collection-3d__live {',
    '  position: absolute;',
    '  width: 1px;',
    '  height: 1px;',
    '  padding: 0;',
    '  margin: -1px;',
    '  overflow: hidden;',
    '  clip: rect(0, 0, 0, 0);',
    '  white-space: nowrap;',
    '  border: 0;',
    '}',
    '',
    '@media (max-width: 989px) {',
    '  .collection-3d {',
    '    --c3-slide-width: min(48vw, 320px);',
    '  }',
    '}',
    '',
    '@media (max-width: 749px) {',
    '  .collection-3d {',
    '    --c3-slide-width: min(72vw, 300px);',
    '    padding-block: 1.75rem 2.5rem;',
    '  }',
    '',
    '  .collection-3d__inner {',
    '    width: min(100% - 1.15rem, 1240px);',
    '  }',
    '',
    '  .collection-3d__content {',
    '    padding: 1.15rem 1.05rem 1.2rem;',
    '  }',
    '',
    '  .collection-3d__cta {',
    '    width: 100%;',
    '    justify-content: center;',
    '  }',
    '}',
    '',
    '@media (max-width: 479px) {',
    '  .collection-3d {',
    '    --c3-slide-width: min(78vw, 280px);',
    '  }',
    '}',
    '',
    '@media (prefers-reduced-motion: reduce) {',
    '  .collection-3d {',
    '    --c3-transition: 1ms linear;',
    '  }',
    '',
    '  .collection-3d__slide,',
    '  .collection-3d__image,',
    '  .collection-3d__content,',
    '  .collection-3d__cta,',
    '  .collection-3d__arrow,',
    '  .collection-3d__dot {',
    '    transition: none !important;',
    '  }',
    '}',
    '',
    '/* No-JS fallback */',
    '.collection-3d:not(.is-ready) .collection-3d__track {',
    '  display: flex;',
    '  gap: 1rem;',
    '  overflow-x: auto;',
    '  scroll-snap-type: x mandatory;',
    '  padding-inline: 1rem;',
    '  min-height: 0;',
    '  -webkit-overflow-scrolling: touch;',
    '}',
    '',
    '.collection-3d:not(.is-ready) .collection-3d__slide {',
    '  position: relative;',
    '  top: auto;',
    '  left: auto;',
    '  flex: 0 0 var(--c3-slide-width);',
    '  scroll-snap-align: center;',
    '  transform: none !important;',
    '  opacity: 1 !important;',
    '  visibility: visible !important;',
    '  filter: none !important;',
    '}',
    '',
    '.collection-3d:not(.is-ready) .collection-3d__nav,',
    '.collection-3d:not(.is-ready) .collection-3d__pagination {',
    '  display: none;',
    '}',
    '',
    '.collection-3d__media--empty { background: linear-gradient(160deg, #3a342e 0%, #1e1b18 100%); }',
    ''
  ].join('\n');

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
    var raw = el.getAttribute('data-collection-3d-config');
    if (!raw) return {};
    try {
      return JSON.parse(raw);
    } catch (err) {
      console.warn('[Collection3D] Invalid config JSON', err);
      return {};
    }
  }

  function getBreakpointOverrides(config) {
    var width = global.innerWidth || document.documentElement.clientWidth;
    if (width <= 749) {
      return {
        visibleSlides: config.mobileVisibleSlides || 3,
        spacing: Math.min(config.spacing, 190),
        depth: Math.min(config.depth, 150),
        rotation: Math.min(config.rotation, 32),
        scale: Math.max(config.scale, 0.84),
      };
    }
    if (width <= 989) {
      return {
        visibleSlides: config.tabletVisibleSlides || 3,
        spacing: Math.min(config.spacing, 220),
        depth: Math.min(config.depth, 175),
        rotation: Math.min(config.rotation, 38),
      };
    }
    return {
      visibleSlides: config.visibleSlides || 5,
    };
  }

  function Collection3D(root, userConfig) {
    this.root = root;
    this.instanceId = 'c3-' + ++uid;
    this.userConfig = userConfig || {};
    this.config = mergeConfig(
      DEFAULTS,
      mergeConfig(parseConfigFromElement(root), this.userConfig)
    );
    this.runtime = mergeConfig(this.config, getBreakpointOverrides(this.config));

    this.stage = root.querySelector('[data-collection-3d-stage]');
    this.track = root.querySelector('[data-collection-3d-track]');
    this.liveRegion = root.querySelector('[data-collection-3d-live]');
    this.prevBtn = root.querySelector('[data-collection-3d-prev]');
    this.nextBtn = root.querySelector('[data-collection-3d-next]');
    this.pagination = root.querySelector('[data-collection-3d-pagination]');
    this.nav = root.querySelector('[data-collection-3d-nav]');

    this.slides = [];
    this.index = 0;
    this.isDragging = false;
    this.dragStartX = 0;
    this.dragDelta = 0;
    this.pointerId = null;
    this.autoplayTimer = null;
    this.transitionTimer = null;
    this.bound = {};
    this.destroyed = false;

    root.setAttribute('data-collection-3d-instance', this.instanceId);
    root.classList.add(this.instanceId);

    if (!this.stage || !this.track) {
      console.warn('[Collection3D] Missing stage/track', this.instanceId);
      return;
    }

    this._collectSlides();
    if (!this.slides.length) return;

    this._applyChrome();
    this._bind();
    this._applyVisualConfig();
    this.goTo(this._initialIndex(), { animate: false, announce: false });
    this.root.classList.add('is-ready');
    this._startAutoplay();
  }

  Collection3D.prototype._initialIndex = function () {
    var marked = this.slides.findIndex(function (slide) {
      return slide.classList.contains('is-active') || slide.getAttribute('aria-current') === 'true';
    });
    return marked >= 0 ? marked : 0;
  };

  Collection3D.prototype._collectSlides = function () {
    this.slides = Array.prototype.slice.call(
      this.track.querySelectorAll('[data-collection-3d-slide]')
    );
    this.slides.forEach(function (slide, i) {
      slide.setAttribute('role', 'group');
      slide.setAttribute('aria-roledescription', 'slide');
      slide.setAttribute('aria-label', i + 1 + ' of ' + this.slides.length);
      slide.dataset.index = String(i);
      slide.id = this.instanceId + '-slide-' + i;
    }, this);
  };

  Collection3D.prototype._applyChrome = function () {
    if (this.nav) {
      this.nav.hidden = !this.runtime.navigation || this.slides.length < 2;
    }
    if (this.pagination) {
      this.pagination.hidden = !this.runtime.pagination || this.slides.length < 2;
      if (this.runtime.pagination) this._buildPagination();
    }
  };

  Collection3D.prototype._buildPagination = function () {
    var self = this;
    this.pagination.innerHTML = '';
    this.slides.forEach(function (_, i) {
      var li = document.createElement('li');
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'collection-3d__dot';
      btn.setAttribute('data-collection-3d-dot', String(i));
      btn.setAttribute('aria-label', 'Go to collection ' + (i + 1));
      btn.setAttribute('aria-controls', self.instanceId + '-slide-' + i);
      if (i === self.index) {
        btn.classList.add('is-active');
        btn.setAttribute('aria-current', 'true');
      }
      li.appendChild(btn);
      self.pagination.appendChild(li);
    });
  };

  Collection3D.prototype._applyVisualConfig = function () {
    var reduced = this.runtime.respectReducedMotion && prefersReducedMotion();
    var speed = reduced ? 1 : this.runtime.transitionDuration;
    this.root.style.setProperty(
      '--c3-transition',
      speed + 'ms cubic-bezier(0.22, 1, 0.36, 1)'
    );
    this.root.style.setProperty('--c3-perspective', this.runtime.perspective + 'px');
    this.root.style.setProperty('--c3-overlay', String(this.runtime.overlay));
    this.root.style.setProperty('--c3-radius', (this.runtime.borderRadius || 4) + 'px');
    this.stage.style.perspective = this.runtime.perspective + 'px';
  };

  Collection3D.prototype._bind = function () {
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
      var btn = e.target.closest('[data-collection-3d-dot]');
      if (!btn || !self.pagination.contains(btn)) return;
      var i = Number(btn.getAttribute('data-collection-3d-dot'));
      if (!Number.isNaN(i)) self.goTo(i);
    };
    this.bound.onSlideClick = function (e) {
      if (!self.runtime.clickNeighborToCenter) return;
      if (Math.abs(self.dragDelta) > 8) return;
      var slide = e.target.closest('[data-collection-3d-slide]');
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
      if (document.hidden) self._stopAutoplay();
      else self._startAutoplay();
    };
    this.bound.onTouchMoveGuard = function (e) {
      if (!self.isDragging) return;
      if (Math.abs(self.dragDelta) > 8 && e.cancelable) e.preventDefault();
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
  };

  Collection3D.prototype._onResize = function () {
    this.runtime = mergeConfig(this.config, getBreakpointOverrides(this.config));
    this._applyVisualConfig();
    this._applyChrome();
    this._render({ animate: false });
  };

  Collection3D.prototype._onPointerDown = function (e) {
    if (e.button !== undefined && e.button !== 0) return;
    if (e.target.closest('a, button')) return;
    this.isDragging = true;
    this.pointerId = e.pointerId;
    this.dragStartX = e.clientX;
    this.dragDelta = 0;
    this.stage.classList.add('is-dragging');
    this.root.classList.add('is-dragging');
    this._stopAutoplay();
    try {
      this.stage.setPointerCapture(e.pointerId);
    } catch (_) { /* noop */ }
    this.stage.addEventListener('pointermove', this.bound.onPointerMove);
    this.stage.addEventListener('pointerup', this.bound.onPointerUp);
    this.stage.addEventListener('pointercancel', this.bound.onPointerUp);
  };

  Collection3D.prototype._onPointerMove = function (e) {
    if (!this.isDragging) return;
    this.dragDelta = (e.clientX - this.dragStartX) * (this.runtime.dragSensitivity || 1);
    if (!(this.runtime.respectReducedMotion && prefersReducedMotion())) {
      this._renderDragPreview(this.dragDelta);
    }
  };

  Collection3D.prototype._onPointerUp = function () {
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
    var spacing = this.runtime.spacing || 250;
    var steps = 0;

    if (this.runtime.inertia && Math.abs(delta) > threshold) {
      steps = Math.round(delta / spacing);
      if (steps === 0) steps = delta > 0 ? 1 : -1;
      steps = clamp(steps, -3, 3);
    } else if (Math.abs(delta) > threshold) {
      steps = delta > 0 ? 1 : -1;
    }

    this.dragDelta = 0;

    if (steps !== 0) this.goTo(this.index - steps);
    else this._render({ animate: true });

    this._startAutoplay();
  };

  Collection3D.prototype._wrapIndex = function (i) {
    var len = this.slides.length;
    if (!len) return 0;
    if (this.runtime.loop) return ((i % len) + len) % len;
    return clamp(i, 0, len - 1);
  };

  Collection3D.prototype._offsetForIndex = function (slideIndex, activeIndex) {
    var len = this.slides.length;
    if (!this.runtime.loop) return slideIndex - activeIndex;
    var half = Math.floor(len / 2);
    var offset = slideIndex - activeIndex;
    if (offset > half) offset -= len;
    if (offset < -half) offset += len;
    return offset;
  };

  Collection3D.prototype._sideCount = function () {
    var visible = Math.max(1, this.runtime.visibleSlides || 5);
    return Math.max(1, Math.floor((visible - 1) / 2));
  };

  Collection3D.prototype._transformForOffset = function (offset, dragProgress) {
    var cfg = this.runtime;
    var t = offset - (dragProgress || 0);
    var abs = Math.abs(t);
    var dir = t === 0 ? 0 : t > 0 ? 1 : -1;

    // Arc-like curve into perspective
    var angleDeg = t * (cfg.rotation * 0.45);
    var angleRad = (angleDeg * Math.PI) / 180;
    var arcX = Math.sin(angleRad) * cfg.depth * 1.15;
    var linearX = t * cfg.spacing;
    var x = linearX * 0.62 + arcX * 0.38;
    var z =
      abs === 0
        ? 48
        : (Math.cos(angleRad) - 1) * cfg.depth - cfg.depth * 0.15 * Math.max(abs - 1, 0);

    var rotateY =
      -dir * cfg.rotation * Math.min(abs, 1) -
      dir * cfg.rotation * 0.3 * Math.max(abs - 1, 0);

    var scale = 1;
    if (abs < 1) scale = 1 - (1 - cfg.scale) * abs;
    else scale = Math.max(cfg.scale - cfg.scaleStep * (abs - 1), 0.58);

    var side = this._sideCount();
    var opacity = 1;
    if (abs > side + 0.2) opacity = 0;
    else if (abs > side - 0.25) opacity = clamp(1 - (abs - (side - 0.25)) / 0.55, 0, 1);
    else if (abs > 0) opacity = 1 - Math.min(abs, 1) * 0.12;

    return { x: x, z: z, rotateY: rotateY, scale: scale, opacity: opacity };
  };

  Collection3D.prototype._applySlideTransform = function (slide, t) {
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

  Collection3D.prototype._updateImageLoading = function (slide, abs) {
    var img = slide.querySelector('.collection-3d__image');
    if (!img) return;
    if (abs <= 1) {
      if (img.dataset.src && !img.getAttribute('src')) img.src = img.dataset.src;
      if (img.dataset.srcset && !img.getAttribute('srcset')) img.srcset = img.dataset.srcset;
      img.loading = abs === 0 ? 'eager' : 'lazy';
      if (abs === 0) img.setAttribute('fetchpriority', 'high');
      else img.removeAttribute('fetchpriority');
    } else {
      img.loading = 'lazy';
      img.removeAttribute('fetchpriority');
    }
  };

  Collection3D.prototype._renderDragPreview = function (deltaX) {
    var progress = -deltaX / (this.runtime.spacing || 250);
    var self = this;
    var side = this._sideCount();
    this.slides.forEach(function (slide, i) {
      var offset = self._offsetForIndex(i, self.index);
      var t = self._transformForOffset(offset, progress);
      var hidden = Math.abs(offset - progress) > side + 1.15;
      slide.classList.toggle('is-hidden', hidden);
      self._applySlideTransform(slide, t);
    });
  };

  Collection3D.prototype._render = function (options) {
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
      slide.setAttribute('aria-hidden', isActive ? 'false' : 'true');
      slide.tabIndex = isActive ? 0 : -1;
      slide.style.zIndex = String(100 - Math.round(abs * 10));

      self._applySlideTransform(slide, t);
      self._updateImageLoading(slide, abs);
    });

    this._syncChrome();

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

  Collection3D.prototype._syncChrome = function () {
    var i;
    if (this.pagination && this.runtime.pagination) {
      var dots = this.pagination.querySelectorAll('[data-collection-3d-dot]');
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

  Collection3D.prototype._announce = function () {
    if (!this.liveRegion) return;
    var active = this.slides[this.index];
    if (!active) return;
    var title =
      active.getAttribute('data-collection-title') ||
      (active.querySelector('.collection-3d__title') &&
        active.querySelector('.collection-3d__title').textContent) ||
      'Collection ' + (this.index + 1);
    this.liveRegion.textContent =
      title.trim() + ', slide ' + (this.index + 1) + ' of ' + this.slides.length;
  };

  Collection3D.prototype.goTo = function (index, options) {
    options = options || {};
    if (!this.slides.length) return;
    var next = this._wrapIndex(index);
    if (!this.runtime.loop) next = clamp(index, 0, this.slides.length - 1);
    this.index = next;
    this._render({ animate: options.animate !== false });
    if (options.announce !== false) this._announce();
    this._restartAutoplay();
  };

  Collection3D.prototype.next = function () {
    this.goTo(this.index + 1);
  };

  Collection3D.prototype.prev = function () {
    this.goTo(this.index - 1);
  };

  Collection3D.prototype._startAutoplay = function () {
    var self = this;
    this._stopAutoplay();
    if (!this.runtime.autoplay || this.slides.length < 2) return;
    if (document.hidden) return;
    this.autoplayTimer = setInterval(function () {
      self.next();
    }, Math.max(2000, this.runtime.autoplayDelay || 4800));
  };

  Collection3D.prototype._stopAutoplay = function () {
    if (this.autoplayTimer) {
      clearInterval(this.autoplayTimer);
      this.autoplayTimer = null;
    }
  };

  Collection3D.prototype._restartAutoplay = function () {
    if (this.runtime.autoplay) this._startAutoplay();
  };

  Collection3D.prototype.updateConfig = function (partial) {
    this.userConfig = mergeConfig(this.userConfig, partial || {});
    this.config = mergeConfig(
      DEFAULTS,
      mergeConfig(parseConfigFromElement(this.root), this.userConfig)
    );
    this.runtime = mergeConfig(this.config, getBreakpointOverrides(this.config));
    this._applyVisualConfig();
    this._applyChrome();
    this._render({ animate: false });
    this._restartAutoplay();
  };

  Collection3D.prototype.refresh = function () {
    this._collectSlides();
    this._applyChrome();
    this.index = this._wrapIndex(this.index);
    this._render({ animate: false });
  };

  Collection3D.prototype.destroy = function () {
    if (this.destroyed) return;
    this.destroyed = true;
    this._stopAutoplay();
    clearTimeout(this.transitionTimer);

    if (this.prevBtn) this.prevBtn.removeEventListener('click', this.bound.onPrev);
    if (this.nextBtn) this.nextBtn.removeEventListener('click', this.bound.onNext);
    if (this.pagination) this.pagination.removeEventListener('click', this.bound.onPagination);
    this.track.removeEventListener('click', this.bound.onSlideClick);
    this.stage.removeEventListener('pointerdown', this.bound.onPointerDown);
    this.stage.removeEventListener('touchmove', this.bound.onTouchMoveGuard);
    this.root.removeEventListener('keydown', this.bound.onKeyDown);
    global.removeEventListener('resize', this.bound.onResize);
    document.removeEventListener('visibilitychange', this.bound.onVisibility);

    this.slides.forEach(function (slide) {
      slide.style.transform = '';
      slide.style.opacity = '';
      slide.classList.remove('is-active', 'is-hidden', 'is-clickable');
    });
    this.root.classList.remove(
      'is-ready',
      'is-animating',
      'is-dragging',
      'is-instant',
      this.instanceId
    );
    this.root.removeAttribute('data-collection-3d-instance');
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

    var instance = new Collection3D(root, config);
    INSTANCES.set(root, instance);
    return instance;
  }

  function initAll(selector, config) {
    var nodes = document.querySelectorAll(selector || '[data-collection-3d]');
    var instances = [];
    Array.prototype.forEach.call(nodes, function (node) {
      instances.push(init(node, config));
    });
    return instances;
  }

  function getInstance(root) {
    return INSTANCES.get(root) || null;
  }

  global.SECollectionCarousel = {
    defaults: DEFAULTS,
    injectStyles: injectStyles,
    ensureFonts: ensureFonts,
    init: init,
    initAll: initAll,
    getInstance: getInstance,
  };

  // Compatibility alias for standalone demos / older references
  global.Collection3D = global.SECollectionCarousel;
})(typeof window !== 'undefined' ? window : this);
