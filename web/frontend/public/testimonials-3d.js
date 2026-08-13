/**
 * SlideEase 3D Testimonials
 * Self-contained IIFE — exposes window.SETestimonials3D
 * Compatibility alias: window.Testimonials3D
 */
(function (global) {
  'use strict';

  var STYLE_ID = 'se-testimonials-3d-styles';
  var FONT_ID = 'se-testimonials-3d-fonts';
  var FONT_HREF =
    'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;600;700&family=Source+Serif+4:opsz,wght@8..60,500;8..60,600&display=swap';

  var CSS = [
    '/**',
    ' * 3D Testimonial Carousel',
    ' * Premium Shopify-ready styles — floating depth cards',
    ' */',
    '',
    '.testimonials-3d {',
    '  --t3-bg-a: #f4f6f8;',
    '  --t3-bg-b: #e8ecf0;',
    '  --t3-surface: #ffffff;',
    '  --t3-ink: #15181c;',
    '  --t3-ink-muted: #5f6770;',
    '  --t3-ink-soft: #8b939c;',
    '  --t3-line: rgba(21, 24, 28, 0.08);',
    '  --t3-accent: #2f6fed;',
    '  --t3-star: #e6a817;',
    '  --t3-radius: 18px;',
    '  --t3-font-display: "Source Serif 4", "Times New Roman", serif;',
    '  --t3-font-body: "Plus Jakarta Sans", "Helvetica Neue", sans-serif;',
    '  --t3-transition: 680ms cubic-bezier(0.22, 1, 0.36, 1);',
    '  --t3-perspective: 1300px;',
    '  --t3-card-width: min(86vw, 420px);',
    '  --t3-card-min-height: 280px;',
    '  --t3-stage-pad: clamp(2.25rem, 5vw, 4rem);',
    '  --t3-section-bg: radial-gradient(80% 60% at 50% 0%, rgba(255, 255, 255, 0.85) 0%, transparent 60%), linear-gradient(165deg, var(--t3-bg-a) 0%, var(--t3-bg-b) 100%);',
    '',
    '  position: relative;',
    '  isolation: isolate;',
    '  width: 100vw;',
    '  max-width: 100vw;',
    '  margin-left: calc(50% - 50vw);',
    '  margin-right: calc(50% - 50vw);',
    '  padding: clamp(2.5rem, 6vw, 5rem) 0;',
    '  font-family: var(--t3-font-body);',
    '  color: var(--t3-ink);',
    '  background: var(--t3-section-bg);',
    '  overflow: hidden;',
    '  -webkit-font-smoothing: antialiased;',
    '  -moz-osx-font-smoothing: grayscale;',
    '}',
    '',
    '.testimonials-3d *,',
    '.testimonials-3d *::before,',
    '.testimonials-3d *::after {',
    '  box-sizing: border-box;',
    '}',
    '',
    '.testimonials-3d__inner {',
    '  width: min(100% - 2.5rem, 1100px);',
    '  margin-inline: auto;',
    '}',
    '',
    '.testimonials-3d__header {',
    '  text-align: center;',
    '  margin-bottom: clamp(1.75rem, 4vw, 3rem);',
    '}',
    '',
    '.testimonials-3d__eyebrow {',
    '  display: block;',
    '  margin: 0 0 0.6rem;',
    '  font-size: 0.6875rem;',
    '  font-weight: 600;',
    '  letter-spacing: 0.2em;',
    '  text-transform: uppercase;',
    '  color: var(--t3-accent);',
    '}',
    '',
    '.testimonials-3d__heading {',
    '  margin: 0;',
    '  font-family: var(--t3-font-display);',
    '  font-size: clamp(1.85rem, 4vw, 2.85rem);',
    '  font-weight: 600;',
    '  line-height: 1.15;',
    '  letter-spacing: -0.02em;',
    '}',
    '',
    '.testimonials-3d__subheading {',
    '  margin: 0.85rem auto 0;',
    '  max-width: 32rem;',
    '  font-size: 0.9375rem;',
    '  line-height: 1.6;',
    '  color: var(--t3-ink-muted);',
    '}',
    '',
    '/* Stage */',
    '.testimonials-3d__stage {',
    '  position: relative;',
    '  width: 100%;',
    '  perspective: var(--t3-perspective);',
    '  perspective-origin: 50% 45%;',
    '  touch-action: pan-y;',
    '  overscroll-behavior-x: none;',
    '  user-select: none;',
    '  -webkit-user-select: none;',
    '  cursor: grab;',
    '}',
    '',
    '.testimonials-3d__stage.is-dragging {',
    '  cursor: grabbing;',
    '}',
    '',
    '.testimonials-3d.is-dragging .testimonials-3d__slide,',
    '.testimonials-3d.is-instant .testimonials-3d__slide {',
    '  transition: none;',
    '}',
    '',
    '.testimonials-3d__track {',
    '  position: relative;',
    '  display: flex;',
    '  align-items: center;',
    '  justify-content: center;',
    '  width: 100%;',
    '  min-height: calc(var(--t3-card-min-height) + 6rem + var(--t3-stage-pad) * 2);',
    '  padding-block: var(--t3-stage-pad);',
    '  transform-style: preserve-3d;',
    '}',
    '',
    '/* Slides */',
    '.testimonials-3d__slide {',
    '  position: absolute;',
    '  top: 50%;',
    '  left: 50%;',
    '  width: var(--t3-card-width);',
    '  margin: 0;',
    '  padding: 0;',
    '  list-style: none;',
    '  transform-style: preserve-3d;',
    '  transform-origin: center center;',
    '  transition:',
    '    transform var(--t3-transition),',
    '    opacity var(--t3-transition),',
    '    visibility var(--t3-transition);',
    '  will-change: transform, opacity;',
    '  backface-visibility: hidden;',
    '  -webkit-backface-visibility: hidden;',
    '}',
    '',
    '.testimonials-3d__slide.is-hidden {',
    '  visibility: hidden;',
    '  pointer-events: none;',
    '  opacity: 0;',
    '}',
    '',
    '.testimonials-3d__slide.is-active {',
    '  z-index: 20;',
    '}',
    '',
    '.testimonials-3d__slide.is-clickable:not(.is-active) {',
    '  cursor: pointer;',
    '}',
    '',
    '.testimonials-3d.is-animating .testimonials-3d__slide {',
    '  pointer-events: none;',
    '}',
    '',
    '/* Floating idle — active card only */',
    '.testimonials-3d.is-floating .testimonials-3d__slide.is-active .testimonials-3d__card {',
    '  animation: t3-float 5.5s ease-in-out infinite;',
    '}',
    '',
    '@keyframes t3-float {',
    '  0%,',
    '  100% {',
    '    transform: translate3d(0, 0, 0);',
    '  }',
    '  50% {',
    '    transform: translate3d(0, -6px, 0);',
    '  }',
    '}',
    '',
    '.testimonials-3d__card {',
    '  display: flex;',
    '  flex-direction: column;',
    '  gap: 1.15rem;',
    '  width: 100%;',
    '  min-height: var(--t3-card-min-height);',
    '  padding: 1.65rem 1.55rem 1.55rem;',
    '  background: var(--t3-surface);',
    '  border: 1px solid var(--t3-line);',
    '  border-radius: var(--t3-radius);',
    '  box-shadow:',
    '    0 10px 28px rgba(21, 24, 28, 0.08),',
    '    0 2px 6px rgba(21, 24, 28, 0.04);',
    '  transform: translateZ(0);',
    '  will-change: transform;',
    '}',
    '',
    '.testimonials-3d__slide.is-active .testimonials-3d__card {',
    '  box-shadow:',
    '    0 22px 48px rgba(21, 24, 28, 0.14),',
    '    0 4px 12px rgba(21, 24, 28, 0.06);',
    '}',
    '',
    '.testimonials-3d__slide:not(.is-active) .testimonials-3d__card {',
    '  box-shadow: 0 8px 20px rgba(21, 24, 28, 0.08);',
    '}',
    '',
    '.testimonials-3d__quote {',
    '  margin: 0;',
    '  font-family: var(--t3-font-display);',
    '  font-size: clamp(1.15rem, 2.4vw, 1.4rem);',
    '  font-weight: 500;',
    '  line-height: 1.55;',
    '  letter-spacing: -0.01em;',
    '  color: var(--t3-ink);',
    '}',
    '',
    '.testimonials-3d__stars {',
    '  display: flex;',
    '  align-items: center;',
    '  gap: 0.2rem;',
    '  margin: 0;',
    '  padding: 0;',
    '  list-style: none;',
    '  color: var(--t3-star);',
    '}',
    '',
    '.testimonials-3d__star {',
    '  width: 1rem;',
    '  height: 1rem;',
    '}',
    '',
    '.testimonials-3d__star.is-empty {',
    '  color: rgba(21, 24, 28, 0.15);',
    '}',
    '',
    '.testimonials-3d__footer {',
    '  display: flex;',
    '  align-items: center;',
    '  gap: 0.85rem;',
    '  margin-top: auto;',
    '  padding-top: 0.25rem;',
    '}',
    '',
    '.testimonials-3d__avatar {',
    '  flex: 0 0 auto;',
    '  width: 3rem;',
    '  height: 3rem;',
    '  border-radius: 50%;',
    '  object-fit: cover;',
    '  background: #dfe4ea;',
    '  border: 2px solid #fff;',
    '  box-shadow: 0 2px 8px rgba(21, 24, 28, 0.1);',
    '}',
    '',
    '.testimonials-3d__avatar-fallback {',
    '  display: inline-flex;',
    '  align-items: center;',
    '  justify-content: center;',
    '  flex: 0 0 auto;',
    '  width: 3rem;',
    '  height: 3rem;',
    '  border-radius: 50%;',
    '  background: #e8edf3;',
    '  color: var(--t3-ink-muted);',
    '  font-size: 0.85rem;',
    '  font-weight: 700;',
    '  letter-spacing: 0.02em;',
    '}',
    '',
    '.testimonials-3d__meta {',
    '  display: flex;',
    '  flex-direction: column;',
    '  gap: 0.15rem;',
    '  min-width: 0;',
    '  flex: 1 1 auto;',
    '}',
    '',
    '.testimonials-3d__name-row {',
    '  display: flex;',
    '  align-items: center;',
    '  flex-wrap: wrap;',
    '  gap: 0.4rem;',
    '}',
    '',
    '.testimonials-3d__name {',
    '  margin: 0;',
    '  font-size: 0.9rem;',
    '  font-weight: 700;',
    '  color: var(--t3-ink);',
    '  line-height: 1.3;',
    '}',
    '',
    '.testimonials-3d__verified {',
    '  display: inline-flex;',
    '  align-items: center;',
    '  gap: 0.2rem;',
    '  font-size: 0.625rem;',
    '  font-weight: 700;',
    '  letter-spacing: 0.06em;',
    '  text-transform: uppercase;',
    '  color: var(--t3-accent);',
    '}',
    '',
    '.testimonials-3d__verified svg {',
    '  width: 0.85rem;',
    '  height: 0.85rem;',
    '}',
    '',
    '.testimonials-3d__role {',
    '  margin: 0;',
    '  font-size: 0.75rem;',
    '  line-height: 1.35;',
    '  color: var(--t3-ink-muted);',
    '}',
    '',
    '.testimonials-3d__logo {',
    '  flex: 0 0 auto;',
    '  max-width: 4.5rem;',
    '  max-height: 1.5rem;',
    '  width: auto;',
    '  height: auto;',
    '  object-fit: contain;',
    '  opacity: 0.7;',
    '  margin-left: auto;',
    '}',
    '',
    '/* Controls */',
    '.testimonials-3d__controls {',
    '  display: flex;',
    '  flex-direction: column;',
    '  align-items: center;',
    '  gap: 1.15rem;',
    '  margin-top: clamp(0.35rem, 1.5vw, 1rem);',
    '}',
    '',
    '.testimonials-3d__nav {',
    '  display: flex;',
    '  align-items: center;',
    '  justify-content: center;',
    '  gap: 0.7rem;',
    '}',
    '',
    '.testimonials-3d__arrow {',
    '  display: inline-flex;',
    '  align-items: center;',
    '  justify-content: center;',
    '  width: 2.75rem;',
    '  height: 2.75rem;',
    '  padding: 0;',
    '  color: var(--t3-ink);',
    '  background: rgba(255, 255, 255, 0.75);',
    '  border: 1px solid var(--t3-line);',
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
    '.testimonials-3d__arrow svg {',
    '  width: 0.95rem;',
    '  height: 0.95rem;',
    '  pointer-events: none;',
    '}',
    '',
    '.testimonials-3d__arrow:hover:not(:disabled),',
    '.testimonials-3d__arrow:focus-visible {',
    '  background: #fff;',
    '  border-color: rgba(21, 24, 28, 0.18);',
    '  outline: none;',
    '}',
    '',
    '.testimonials-3d__arrow:focus-visible {',
    '  outline: 2px solid var(--t3-accent);',
    '  outline-offset: 3px;',
    '}',
    '',
    '.testimonials-3d__arrow:active:not(:disabled) {',
    '  transform: scale(0.96);',
    '}',
    '',
    '.testimonials-3d__arrow:disabled {',
    '  opacity: 0.35;',
    '  cursor: not-allowed;',
    '}',
    '',
    '.testimonials-3d__pagination {',
    '  display: flex;',
    '  flex-wrap: wrap;',
    '  align-items: center;',
    '  justify-content: center;',
    '  gap: 0.4rem;',
    '  max-width: min(100%, 24rem);',
    '  padding: 0;',
    '  margin: 0;',
    '  list-style: none;',
    '}',
    '',
    '.testimonials-3d__dot {',
    '  width: 0.4rem;',
    '  height: 0.4rem;',
    '  padding: 0;',
    '  background: rgba(21, 24, 28, 0.18);',
    '  border: 0;',
    '  border-radius: 50%;',
    '  cursor: pointer;',
    '  transition:',
    '    background-color 200ms ease,',
    '    width 200ms ease;',
    '}',
    '',
    '.testimonials-3d__dot.is-active {',
    '  width: 1.25rem;',
    '  border-radius: 999px;',
    '  background: var(--t3-ink);',
    '}',
    '',
    '.testimonials-3d__dot:hover:not(.is-active),',
    '.testimonials-3d__dot:focus-visible {',
    '  background: rgba(21, 24, 28, 0.4);',
    '  outline: none;',
    '}',
    '',
    '.testimonials-3d__dot:focus-visible {',
    '  outline: 2px solid var(--t3-accent);',
    '  outline-offset: 3px;',
    '}',
    '',
    '.testimonials-3d__live {',
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
    '  .testimonials-3d {',
    '    --t3-card-width: min(80vw, 380px);',
    '  }',
    '}',
    '',
    '@media (max-width: 749px) {',
    '  .testimonials-3d {',
    '    --t3-card-width: min(90vw, 340px);',
    '    --t3-card-min-height: 260px;',
    '    padding-block: 2rem 2.5rem;',
    '  }',
    '',
    '  .testimonials-3d__inner {',
    '    width: min(100% - 1.15rem, 1100px);',
    '  }',
    '',
    '  .testimonials-3d__card {',
    '    padding: 1.4rem 1.25rem 1.3rem;',
    '  }',
    '',
    '  .testimonials-3d__logo {',
    '    display: none;',
    '  }',
    '}',
    '',
    '@media (prefers-reduced-motion: reduce) {',
    '  .testimonials-3d {',
    '    --t3-transition: 1ms linear;',
    '  }',
    '',
    '  .testimonials-3d.is-floating .testimonials-3d__slide.is-active .testimonials-3d__card {',
    '    animation: none;',
    '  }',
    '',
    '  .testimonials-3d__slide,',
    '  .testimonials-3d__arrow,',
    '  .testimonials-3d__dot {',
    '    transition: none !important;',
    '  }',
    '}',
    '',
    '/* No-JS fallback */',
    '.testimonials-3d:not(.is-ready) .testimonials-3d__track {',
    '  display: flex;',
    '  gap: 1rem;',
    '  overflow-x: auto;',
    '  scroll-snap-type: x mandatory;',
    '  padding: 1rem;',
    '  min-height: 0;',
    '  -webkit-overflow-scrolling: touch;',
    '}',
    '',
    '.testimonials-3d:not(.is-ready) .testimonials-3d__slide {',
    '  position: relative;',
    '  top: auto;',
    '  left: auto;',
    '  flex: 0 0 var(--t3-card-width);',
    '  scroll-snap-align: center;',
    '  transform: none !important;',
    '  opacity: 1 !important;',
    '  visibility: visible !important;',
    '}',
    '',
    '.testimonials-3d:not(.is-ready) .testimonials-3d__nav,',
    '.testimonials-3d:not(.is-ready) .testimonials-3d__pagination {',
    '  display: none;',
    '}'
  ].join('\n');

  var DEFAULTS = {
    cardWidth: 420,
    cardMinHeight: 280,
    perspective: 1300,
    depth: 200,
    rotation: 14,
    scale: 0.86,
    scaleStep: 0.06,
    sideOpacity: 0.72,
    spacing: 260,
    animationSpeed: 680,
    autoplay: false,
    autoplayDelay: 5000,
    navigation: true,
    pagination: true,
    loop: true,
    floating: true,
    sideVisibility: 1,
    dragSensitivity: 1,
    swipeThreshold: 50,
    inertia: true,
    clickNeighborToCenter: true,
    respectReducedMotion: true,
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
    var raw = el.getAttribute('data-testimonials-3d-config');
    if (!raw) return {};
    try {
      return JSON.parse(raw);
    } catch (err) {
      console.warn('[SETestimonials3D] Invalid data-testimonials-3d-config JSON', err);
      return {};
    }
  }

  function getBreakpointOverrides(config) {
    var width = global.innerWidth || document.documentElement.clientWidth;
    if (width <= 749) {
      return {
        cardWidth: Math.min(config.cardWidth, 340),
        depth: Math.min(config.depth, 150),
        rotation: Math.min(config.rotation, 10),
        spacing: Math.min(config.spacing, 180),
        scale: Math.max(config.scale, 0.9),
      };
    }
    if (width <= 989) {
      return {
        cardWidth: Math.min(config.cardWidth, 380),
        spacing: Math.min(config.spacing, 220),
        depth: Math.min(config.depth, 175),
      };
    }
    return {};
  }

  function Testimonials3D(root, userConfig) {
    this.root = root;
    this.instanceId = 't3-' + ++uid;
    this.userConfig = userConfig || {};
    this.config = mergeConfig(
      DEFAULTS,
      mergeConfig(parseConfigFromElement(root), this.userConfig)
    );
    this.runtime = mergeConfig(this.config, getBreakpointOverrides(this.config));

    this.stage = root.querySelector('[data-testimonials-3d-stage]');
    this.track = root.querySelector('[data-testimonials-3d-track]');
    this.liveRegion = root.querySelector('[data-testimonials-3d-live]');
    this.prevBtn = root.querySelector('[data-testimonials-3d-prev]');
    this.nextBtn = root.querySelector('[data-testimonials-3d-next]');
    this.pagination = root.querySelector('[data-testimonials-3d-pagination]');
    this.nav = root.querySelector('[data-testimonials-3d-nav]');

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

    root.setAttribute('data-testimonials-3d-instance', this.instanceId);
    root.classList.add(this.instanceId);

    if (!this.stage || !this.track) {
      console.warn('[SETestimonials3D] Missing stage/track', this.instanceId);
      return;
    }

    this._collectSlides();
    if (!this.slides.length) return;

    this._applyChrome();
    this._bind();
    this._applyVisualConfig();
    this._updateFloating();
    this.goTo(this._initialIndex(), { animate: false, announce: false });
    this.root.classList.add('is-ready');
    this._startAutoplay();
  }

  Testimonials3D.prototype._initialIndex = function () {
    var marked = this.slides.findIndex(function (slide) {
      return slide.classList.contains('is-active') || slide.getAttribute('aria-current') === 'true';
    });
    return marked >= 0 ? marked : 0;
  };

  Testimonials3D.prototype._collectSlides = function () {
    this.slides = Array.prototype.slice.call(
      this.track.querySelectorAll('[data-testimonials-3d-slide]')
    );
    this.slides.forEach(function (slide, i) {
      slide.setAttribute('role', 'group');
      slide.setAttribute('aria-roledescription', 'slide');
      slide.setAttribute('aria-label', i + 1 + ' of ' + this.slides.length);
      slide.dataset.index = String(i);
      slide.id = this.instanceId + '-slide-' + i;
    }, this);
  };

  Testimonials3D.prototype._applyChrome = function () {
    if (this.nav) {
      this.nav.hidden = !this.runtime.navigation || this.slides.length < 2;
    }
    if (this.pagination) {
      this.pagination.hidden = !this.runtime.pagination || this.slides.length < 2;
      if (this.runtime.pagination) this._buildPagination();
    }
  };

  Testimonials3D.prototype._buildPagination = function () {
    var self = this;
    this.pagination.innerHTML = '';
    this.slides.forEach(function (_, i) {
      var li = document.createElement('li');
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'testimonials-3d__dot';
      btn.setAttribute('data-testimonials-3d-dot', String(i));
      btn.setAttribute('aria-label', 'Go to testimonial ' + (i + 1));
      btn.setAttribute('aria-controls', self.instanceId + '-slide-' + i);
      if (i === self.index) {
        btn.classList.add('is-active');
        btn.setAttribute('aria-current', 'true');
      }
      li.appendChild(btn);
      self.pagination.appendChild(li);
    });
  };

  Testimonials3D.prototype._applyVisualConfig = function () {
    var reduced = this.runtime.respectReducedMotion && prefersReducedMotion();
    var speed = reduced ? 1 : this.runtime.animationSpeed;
    var width = this.runtime.cardWidth;
    var minH = this.runtime.cardMinHeight;

    this.root.style.setProperty(
      '--t3-transition',
      speed + 'ms cubic-bezier(0.22, 1, 0.36, 1)'
    );
    this.root.style.setProperty('--t3-perspective', this.runtime.perspective + 'px');
    this.root.style.setProperty('--t3-card-width', 'min(90vw, ' + width + 'px)');
    this.root.style.setProperty('--t3-card-min-height', minH + 'px');
    this.stage.style.perspective = this.runtime.perspective + 'px';
  };

  Testimonials3D.prototype._updateFloating = function () {
    var reduced = this.runtime.respectReducedMotion && prefersReducedMotion();
    var on = !!this.runtime.floating && !reduced && this.slides.length > 0;
    this.root.classList.toggle('is-floating', on);
  };

  Testimonials3D.prototype._bind = function () {
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
      var btn = e.target.closest('[data-testimonials-3d-dot]');
      if (!btn || !self.pagination.contains(btn)) return;
      var i = Number(btn.getAttribute('data-testimonials-3d-dot'));
      if (!Number.isNaN(i)) self.goTo(i);
    };
    this.bound.onSlideClick = function (e) {
      if (!self.runtime.clickNeighborToCenter) return;
      if (Math.abs(self.dragDelta) > 8) return;
      var slide = e.target.closest('[data-testimonials-3d-slide]');
      if (!slide || !self.track.contains(slide)) return;
      if (slide.classList.contains('is-active')) return;
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
      if (document.hidden) {
        self._stopAutoplay();
        self.root.classList.remove('is-floating');
      } else {
        self._updateFloating();
        self._startAutoplay();
      }
    };
    this.bound.onEnter = function () {
      self._stopAutoplay();
    };
    this.bound.onLeave = function () {
      self._startAutoplay();
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
    this.root.addEventListener('mouseenter', this.bound.onEnter);
    this.root.addEventListener('mouseleave', this.bound.onLeave);
    this.root.addEventListener('focusin', this.bound.onEnter);
    this.root.addEventListener('focusout', this.bound.onLeave);
  };

  Testimonials3D.prototype._onResize = function () {
    this.runtime = mergeConfig(this.config, getBreakpointOverrides(this.config));
    this._applyVisualConfig();
    this._updateFloating();
    this._applyChrome();
    this._render({ animate: false });
  };

  Testimonials3D.prototype._onPointerDown = function (e) {
    if (e.button !== undefined && e.button !== 0) return;
    if (e.target.closest('a, button')) return;
    this.isDragging = true;
    this.pointerId = e.pointerId;
    this.dragStartX = e.clientX;
    this.dragDelta = 0;
    this.stage.classList.add('is-dragging');
    this.root.classList.add('is-dragging');
    this.root.classList.remove('is-floating');
    this._stopAutoplay();
    try {
      this.stage.setPointerCapture(e.pointerId);
    } catch (_) { /* noop */ }
    this.stage.addEventListener('pointermove', this.bound.onPointerMove);
    this.stage.addEventListener('pointerup', this.bound.onPointerUp);
    this.stage.addEventListener('pointercancel', this.bound.onPointerUp);
  };

  Testimonials3D.prototype._onPointerMove = function (e) {
    if (!this.isDragging) return;
    this.dragDelta = (e.clientX - this.dragStartX) * (this.runtime.dragSensitivity || 1);
    if (!(this.runtime.respectReducedMotion && prefersReducedMotion())) {
      this._renderDragPreview(this.dragDelta);
    }
  };

  Testimonials3D.prototype._onPointerUp = function () {
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
    var threshold = this.runtime.swipeThreshold || 50;
    var spacing = this.runtime.spacing || 260;
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

    this._updateFloating();
    this._startAutoplay();
  };

  Testimonials3D.prototype._wrapIndex = function (i) {
    var len = this.slides.length;
    if (!len) return 0;
    if (this.runtime.loop) return ((i % len) + len) % len;
    return clamp(i, 0, len - 1);
  };

  Testimonials3D.prototype._offsetForIndex = function (slideIndex, activeIndex) {
    var len = this.slides.length;
    if (!this.runtime.loop) return slideIndex - activeIndex;
    var half = Math.floor(len / 2);
    var offset = slideIndex - activeIndex;
    if (offset > half) offset -= len;
    if (offset < -half) offset += len;
    return offset;
  };

  Testimonials3D.prototype._sideCount = function () {
    return Math.max(1, this.runtime.sideVisibility || 1);
  };

  Testimonials3D.prototype._transformForOffset = function (offset, dragProgress) {
    var cfg = this.runtime;
    var t = offset - (dragProgress || 0);
    var abs = Math.abs(t);
    var dir = t === 0 ? 0 : t > 0 ? 1 : -1;

    var x = t * cfg.spacing;
    var z = abs === 0 ? 36 : -cfg.depth * Math.min(abs, 1) - cfg.depth * 0.4 * Math.max(abs - 1, 0);
    var y = abs === 0 ? -4 : abs * 8;
    var rotateY =
      -dir * cfg.rotation * Math.min(abs, 1) -
      dir * cfg.rotation * 0.25 * Math.max(abs - 1, 0);

    var scale = 1;
    if (abs < 1) scale = 1 - (1 - cfg.scale) * abs;
    else scale = Math.max(cfg.scale - cfg.scaleStep * (abs - 1), 0.72);

    var side = this._sideCount();
    var opacity = 1;
    if (abs === 0) opacity = 1;
    else if (abs > side + 0.15) opacity = 0;
    else if (abs > side - 0.2) opacity = clamp(1 - (abs - (side - 0.2)) / 0.5, 0, 1);
    else opacity = cfg.sideOpacity + (1 - cfg.sideOpacity) * (1 - Math.min(abs, 1));

    return { x: x, y: y, z: z, rotateY: rotateY, scale: scale, opacity: opacity };
  };

  Testimonials3D.prototype._applySlideTransform = function (slide, t) {
    slide.style.transform =
      'translate(-50%, -50%) translate3d(' +
      t.x +
      'px, ' +
      t.y +
      'px, ' +
      t.z +
      'px) rotateY(' +
      t.rotateY +
      'deg) scale(' +
      t.scale +
      ')';
    slide.style.opacity = String(t.opacity);
  };

  Testimonials3D.prototype._updateImageLoading = function (slide, abs) {
    var images = slide.querySelectorAll('img');
    Array.prototype.forEach.call(images, function (img) {
      if (abs <= 1) {
        img.loading = abs === 0 ? 'eager' : 'lazy';
        if (abs === 0 && img.classList.contains('testimonials-3d__avatar')) {
          img.setAttribute('fetchpriority', 'high');
        } else {
          img.removeAttribute('fetchpriority');
        }
      } else {
        img.loading = 'lazy';
        img.removeAttribute('fetchpriority');
      }
    });
  };

  Testimonials3D.prototype._renderDragPreview = function (deltaX) {
    var progress = deltaX / (this.runtime.spacing || 260);
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

  Testimonials3D.prototype._render = function (options) {
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
      }, this.runtime.animationSpeed + 40);
    } else {
      this.root.classList.remove('is-animating');
    }
  };

  Testimonials3D.prototype._syncChrome = function () {
    var i;
    if (this.pagination && this.runtime.pagination) {
      var dots = this.pagination.querySelectorAll('[data-testimonials-3d-dot]');
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

  Testimonials3D.prototype._announce = function () {
    if (!this.liveRegion) return;
    var active = this.slides[this.index];
    if (!active) return;
    var name =
      active.getAttribute('data-author') ||
      (active.querySelector('.testimonials-3d__name') &&
        active.querySelector('.testimonials-3d__name').textContent) ||
      'Testimonial ' + (this.index + 1);
    this.liveRegion.textContent =
      name.trim() + ', slide ' + (this.index + 1) + ' of ' + this.slides.length;
  };

  Testimonials3D.prototype.goTo = function (index, options) {
    options = options || {};
    if (!this.slides.length) return;
    var next = this._wrapIndex(index);
    if (!this.runtime.loop) next = clamp(index, 0, this.slides.length - 1);
    this.index = next;
    this._render({ animate: options.animate !== false });
    if (options.announce !== false) this._announce();
    this._restartAutoplay();
  };

  Testimonials3D.prototype.next = function () {
    this.goTo(this.index + 1);
  };

  Testimonials3D.prototype.prev = function () {
    this.goTo(this.index - 1);
  };

  Testimonials3D.prototype._startAutoplay = function () {
    var self = this;
    this._stopAutoplay();
    if (!this.runtime.autoplay || this.slides.length < 2) return;
    if (this.runtime.respectReducedMotion && prefersReducedMotion()) return;
    if (document.hidden) return;
    this.autoplayTimer = setInterval(function () {
      self.next();
    }, Math.max(2200, this.runtime.autoplayDelay || 5000));
  };

  Testimonials3D.prototype._stopAutoplay = function () {
    if (this.autoplayTimer) {
      clearInterval(this.autoplayTimer);
      this.autoplayTimer = null;
    }
  };

  Testimonials3D.prototype._restartAutoplay = function () {
    if (this.runtime.autoplay) this._startAutoplay();
  };

  Testimonials3D.prototype.updateConfig = function (partial) {
    this.userConfig = mergeConfig(this.userConfig, partial || {});
    this.config = mergeConfig(
      DEFAULTS,
      mergeConfig(parseConfigFromElement(this.root), this.userConfig)
    );
    this.runtime = mergeConfig(this.config, getBreakpointOverrides(this.config));
    this._applyVisualConfig();
    this._updateFloating();
    this._applyChrome();
    this._render({ animate: false });
    this._restartAutoplay();
  };

  Testimonials3D.prototype.refresh = function () {
    this._collectSlides();
    this._applyChrome();
    this.index = this._wrapIndex(this.index);
    this._render({ animate: false });
  };

  Testimonials3D.prototype.destroy = function () {
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
    this.root.removeEventListener('mouseenter', this.bound.onEnter);
    this.root.removeEventListener('mouseleave', this.bound.onLeave);
    this.root.removeEventListener('focusin', this.bound.onEnter);
    this.root.removeEventListener('focusout', this.bound.onLeave);

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
      'is-floating',
      this.instanceId
    );
    this.root.removeAttribute('data-testimonials-3d-instance');
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

    var instance = new Testimonials3D(root, config);
    INSTANCES.set(root, instance);
    return instance;
  }

  function getInstance(root) {
    return INSTANCES.get(root) || null;
  }

  function initAll(selector, config) {
    var nodes = document.querySelectorAll(selector || '[data-testimonials-3d]');
    var instances = [];
    Array.prototype.forEach.call(nodes, function (node) {
      instances.push(init(node, config));
    });
    return instances;
  }

  global.SETestimonials3D = {
    defaults: DEFAULTS,
    init: init,
    initAll: initAll,
    getInstance: getInstance,
    injectStyles: injectStyles,
  };

  // Compatibility alias
  global.Testimonials3D = global.SETestimonials3D;

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
