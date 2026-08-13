/**
 * SlideEase 3D Brand Logos
 * Self-contained IIFE — exposes window.SELogo3D
 * Compatibility alias: window.Logo3D
 */
(function (global) {
  'use strict';

  var STYLE_ID = 'se-logo-3d-styles';
  var FONT_ID = 'se-logo-3d-fonts';
  var FONT_HREF =
    'https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@500;600;700&display=swap';

  var CSS = [
    "/**",
    " * 3D Brand Logo Carousel",
    " * Premium Shopify-ready styles — cylindrical trusted-by logos",
    " */",
    "",
    ".logo-3d {",
    "  --l3-bg: #f5f5f3;",
    "  --l3-bg-soft: #ebebe8;",
    "  --l3-surface: #ffffff;",
    "  --l3-ink: #161616;",
    "  --l3-ink-muted: #6b6b66;",
    "  --l3-ink-soft: #9a9a94;",
    "  --l3-line: rgba(22, 22, 22, 0.08);",
    "  --l3-font-display: \"Instrument Sans\", \"Helvetica Neue\", sans-serif;",
    "  --l3-font-body: \"Instrument Sans\", \"Helvetica Neue\", sans-serif;",
    "  --l3-transition: 700ms cubic-bezier(0.22, 1, 0.36, 1);",
    "  --l3-perspective: 1200px;",
    "  --l3-logo-size: 88px;",
    "  --l3-stage-pad: clamp(2rem, 4vw, 3.5rem);",
    "",
    "  position: relative;",
    "  isolation: isolate;",
    "  width: 100vw;",
    "  max-width: 100vw;",
    "  margin-left: calc(50% - 50vw);",
    "  margin-right: calc(50% - 50vw);",
    "  padding: clamp(2.75rem, 6vw, 5rem) 0;",
    "  font-family: var(--l3-font-body);",
    "  color: var(--l3-ink);",
    "  --l3-section-bg: radial-gradient(80% 55% at 50% 0%, #fff 0%, transparent 60%), linear-gradient(180deg, var(--l3-bg) 0%, var(--l3-bg-soft) 100%);",
    "  background: var(--l3-section-bg);",
    "  overflow: hidden;",
    "  -webkit-font-smoothing: antialiased;",
    "  -moz-osx-font-smoothing: grayscale;",
    "}",
    "",
    ".logo-3d *,",
    ".logo-3d *::before,",
    ".logo-3d *::after {",
    "  box-sizing: border-box;",
    "}",
    "",
    ".logo-3d__inner {",
    "  width: min(100% - 2.5rem, 1100px);",
    "  margin-inline: auto;",
    "}",
    "",
    ".logo-3d__header {",
    "  text-align: center;",
    "  margin-bottom: clamp(1.75rem, 4vw, 3rem);",
    "}",
    "",
    ".logo-3d__eyebrow {",
    "  display: block;",
    "  margin: 0 0 0.6rem;",
    "  font-size: 0.6875rem;",
    "  font-weight: 600;",
    "  letter-spacing: 0.22em;",
    "  text-transform: uppercase;",
    "  color: var(--l3-ink-soft);",
    "}",
    "",
    ".logo-3d__heading {",
    "  margin: 0;",
    "  font-family: var(--l3-font-display);",
    "  font-size: clamp(1.65rem, 3.5vw, 2.35rem);",
    "  font-weight: 600;",
    "  line-height: 1.15;",
    "  letter-spacing: -0.02em;",
    "}",
    "",
    ".logo-3d__subheading {",
    "  margin: 0.75rem auto 0;",
    "  max-width: 28rem;",
    "  font-size: 0.9rem;",
    "  line-height: 1.55;",
    "  color: var(--l3-ink-muted);",
    "}",
    "",
    "/* Stage */",
    ".logo-3d__stage {",
    "  position: relative;",
    "  width: 100%;",
    "  perspective: var(--l3-perspective);",
    "  perspective-origin: 50% 50%;",
    "  touch-action: pan-y;",
    "  overscroll-behavior-x: none;",
    "  user-select: none;",
    "  -webkit-user-select: none;",
    "  cursor: grab;",
    "}",
    "",
    ".logo-3d__stage.is-dragging {",
    "  cursor: grabbing;",
    "}",
    "",
    ".logo-3d.is-dragging .logo-3d__slide,",
    ".logo-3d.is-instant .logo-3d__slide {",
    "  transition: none;",
    "}",
    "",
    ".logo-3d__tilt {",
    "  position: relative;",
    "  width: 100%;",
    "  transform-style: preserve-3d;",
    "  transition: transform 420ms cubic-bezier(0.22, 1, 0.36, 1);",
    "  will-change: transform;",
    "}",
    "",
    ".logo-3d.is-dragging .logo-3d__tilt {",
    "  transition: none;",
    "}",
    "",
    ".logo-3d__track {",
    "  position: relative;",
    "  display: flex;",
    "  align-items: center;",
    "  justify-content: center;",
    "  width: 100%;",
    "  min-height: calc(var(--l3-logo-size) * 2.4 + var(--l3-stage-pad) * 2);",
    "  padding-block: var(--l3-stage-pad);",
    "  transform-style: preserve-3d;",
    "}",
    "",
    "/* Slides */",
    ".logo-3d__slide {",
    "  position: absolute;",
    "  top: 50%;",
    "  left: 50%;",
    "  width: calc(var(--l3-logo-size) * 2.1);",
    "  margin: 0;",
    "  padding: 0;",
    "  list-style: none;",
    "  transform-style: preserve-3d;",
    "  transform-origin: center center;",
    "  transition:",
    "    transform var(--l3-transition),",
    "    opacity var(--l3-transition),",
    "    visibility var(--l3-transition);",
    "  will-change: transform, opacity;",
    "  backface-visibility: hidden;",
    "  -webkit-backface-visibility: hidden;",
    "}",
    "",
    ".logo-3d__slide.is-hidden {",
    "  visibility: hidden;",
    "  pointer-events: none;",
    "  opacity: 0;",
    "}",
    "",
    ".logo-3d__slide.is-active {",
    "  z-index: 20;",
    "}",
    "",
    ".logo-3d__slide.is-clickable:not(.is-active) {",
    "  cursor: pointer;",
    "}",
    "",
    ".logo-3d.is-animating .logo-3d__slide {",
    "  pointer-events: none;",
    "}",
    "",
    ".logo-3d__card {",
    "  display: flex;",
    "  flex-direction: column;",
    "  align-items: center;",
    "  gap: 0.75rem;",
    "  width: 100%;",
    "  padding: 1.15rem 1rem;",
    "  text-align: center;",
    "  text-decoration: none;",
    "  color: inherit;",
    "  background: var(--l3-surface);",
    "  border: 1px solid var(--l3-line);",
    "  border-radius: 14px;",
    "  box-shadow: 0 8px 20px rgba(22, 22, 22, 0.06);",
    "  transform: translateZ(0);",
    "  transition: box-shadow var(--l3-transition);",
    "}",
    "",
    ".logo-3d__slide.is-active .logo-3d__card {",
    "  box-shadow:",
    "    0 4px 10px rgba(22, 22, 22, 0.05),",
    "    0 18px 36px rgba(22, 22, 22, 0.1);",
    "}",
    "",
    ".logo-3d__logo-wrap {",
    "  display: flex;",
    "  align-items: center;",
    "  justify-content: center;",
    "  width: var(--l3-logo-size);",
    "  height: var(--l3-logo-size);",
    "}",
    "",
    ".logo-3d__logo {",
    "  display: block;",
    "  max-width: 100%;",
    "  max-height: 100%;",
    "  width: auto;",
    "  height: auto;",
    "  object-fit: contain;",
    "  filter: grayscale(0.15);",
    "  transition: filter var(--l3-transition);",
    "}",
    "",
    ".logo-3d__slide.is-active .logo-3d__logo {",
    "  filter: none;",
    "}",
    "",
    ".logo-3d__slide:not(.is-active) .logo-3d__logo {",
    "  filter: grayscale(0.35) opacity(0.92);",
    "}",
    "",
    ".logo-3d__name {",
    "  margin: 0;",
    "  font-size: 0.8125rem;",
    "  font-weight: 600;",
    "  letter-spacing: -0.01em;",
    "  color: var(--l3-ink);",
    "  line-height: 1.25;",
    "}",
    "",
    ".logo-3d__description {",
    "  margin: 0;",
    "  font-size: 0.75rem;",
    "  line-height: 1.4;",
    "  color: var(--l3-ink-muted);",
    "  max-width: 16ch;",
    "}",
    "",
    ".logo-3d__slide:not(.is-active) .logo-3d__description {",
    "  display: none;",
    "}",
    "",
    ".logo-3d__slide:not(.is-active) .logo-3d__name {",
    "  opacity: 0.75;",
    "}",
    "",
    "/* Controls */",
    ".logo-3d__controls {",
    "  display: flex;",
    "  flex-direction: column;",
    "  align-items: center;",
    "  gap: 1.1rem;",
    "  margin-top: clamp(0.25rem, 1.5vw, 0.85rem);",
    "}",
    "",
    ".logo-3d__nav {",
    "  display: flex;",
    "  align-items: center;",
    "  justify-content: center;",
    "  gap: 0.65rem;",
    "}",
    "",
    ".logo-3d__arrow {",
    "  display: inline-flex;",
    "  align-items: center;",
    "  justify-content: center;",
    "  width: 2.6rem;",
    "  height: 2.6rem;",
    "  padding: 0;",
    "  color: var(--l3-ink);",
    "  background: rgba(255, 255, 255, 0.75);",
    "  border: 1px solid var(--l3-line);",
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
    ".logo-3d__arrow svg {",
    "  width: 0.9rem;",
    "  height: 0.9rem;",
    "  pointer-events: none;",
    "}",
    "",
    ".logo-3d__arrow:hover:not(:disabled),",
    ".logo-3d__arrow:focus-visible {",
    "  background: #fff;",
    "  border-color: rgba(22, 22, 22, 0.16);",
    "  outline: none;",
    "}",
    "",
    ".logo-3d__arrow:focus-visible {",
    "  outline: 2px solid var(--l3-ink);",
    "  outline-offset: 3px;",
    "}",
    "",
    ".logo-3d__arrow:active:not(:disabled) {",
    "  transform: scale(0.96);",
    "}",
    "",
    ".logo-3d__arrow:disabled {",
    "  opacity: 0.35;",
    "  cursor: not-allowed;",
    "}",
    "",
    ".logo-3d__pagination {",
    "  display: flex;",
    "  flex-wrap: wrap;",
    "  align-items: center;",
    "  justify-content: center;",
    "  gap: 0.35rem;",
    "  max-width: min(100%, 22rem);",
    "  padding: 0;",
    "  margin: 0;",
    "  list-style: none;",
    "}",
    "",
    ".logo-3d__dot {",
    "  width: 0.35rem;",
    "  height: 0.35rem;",
    "  padding: 0;",
    "  background: rgba(22, 22, 22, 0.18);",
    "  border: 0;",
    "  border-radius: 50%;",
    "  cursor: pointer;",
    "  transition:",
    "    background-color 200ms ease,",
    "    width 200ms ease;",
    "}",
    "",
    ".logo-3d__dot.is-active {",
    "  width: 1.15rem;",
    "  border-radius: 999px;",
    "  background: var(--l3-ink);",
    "}",
    "",
    ".logo-3d__dot:hover:not(.is-active),",
    ".logo-3d__dot:focus-visible {",
    "  background: rgba(22, 22, 22, 0.4);",
    "  outline: none;",
    "}",
    "",
    ".logo-3d__dot:focus-visible {",
    "  outline: 2px solid var(--l3-ink);",
    "  outline-offset: 3px;",
    "}",
    "",
    ".logo-3d__live {",
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
    "@media (max-width: 749px) {",
    "  .logo-3d {",
    "    --l3-logo-size: 72px;",
    "    padding-block: 2rem 2.5rem;",
    "  }",
    "",
    "  .logo-3d__inner {",
    "    width: min(100% - 1.15rem, 1100px);",
    "  }",
    "}",
    "",
    "@media (prefers-reduced-motion: reduce) {",
    "  .logo-3d {",
    "    --l3-transition: 1ms linear;",
    "  }",
    "",
    "  .logo-3d__tilt,",
    "  .logo-3d__slide,",
    "  .logo-3d__card,",
    "  .logo-3d__logo,",
    "  .logo-3d__arrow,",
    "  .logo-3d__dot {",
    "    transition: none !important;",
    "  }",
    "}",
    "",
    "/* No-JS fallback */",
    ".logo-3d:not(.is-ready) .logo-3d__track {",
    "  display: flex;",
    "  flex-wrap: wrap;",
    "  justify-content: center;",
    "  gap: 1rem;",
    "  min-height: 0;",
    "  padding: 1rem;",
    "}",
    "",
    ".logo-3d:not(.is-ready) .logo-3d__slide {",
    "  position: relative;",
    "  top: auto;",
    "  left: auto;",
    "  width: calc(var(--l3-logo-size) * 2.1);",
    "  transform: none !important;",
    "  opacity: 1 !important;",
    "  visibility: visible !important;",
    "}",
    "",
    ".logo-3d:not(.is-ready) .logo-3d__nav,",
    ".logo-3d:not(.is-ready) .logo-3d__pagination {",
    "  display: none;",
    "}",
    "/**",
    " * 3D Brand Logo Carousel",
    " * Cylindrical layout — Shopify multi-instance safe",
    " */",
  ].join('\n');

var DEFAULTS = {
    perspective: 1200,
    cylinderRadius: 320,
    depth: 160,
    rotation: 28,
    scale: 0.82,
    scaleStep: 0.08,
    sideOpacity: 0.55,
    spacing: 0,
    autoplay: true,
    autoplayDelay: 3200,
    animationSpeed: 700,
    navigation: true,
    pagination: false,
    loop: true,
    logoSize: 88,
    visibleSlides: 7,
    tabletVisibleSlides: 5,
    mobileVisibleSlides: 3,
    tiltIntensity: 0.35,
    mobileBreakpoint: 990,
    dragSensitivity: 1,
    swipeThreshold: 40,
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

  function isCoarsePointer() {
    return (
      global.matchMedia &&
      global.matchMedia('(hover: none), (pointer: coarse)').matches
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
    var raw = el.getAttribute('data-logo-3d-config');
    if (!raw) return {};
    try {
      return JSON.parse(raw);
    } catch (err) {
      console.warn('[Logo3D] Invalid config JSON', err);
      return {};
    }
  }

  function getBreakpointOverrides(config) {
    var width = global.innerWidth || document.documentElement.clientWidth;
    if (width <= 749) {
      return {
        visibleSlides: config.mobileVisibleSlides || 3,
        cylinderRadius: Math.min(config.cylinderRadius, 220),
        depth: Math.min(config.depth, 110),
        rotation: Math.min(config.rotation, 22),
        logoSize: Math.min(config.logoSize, 72),
        tiltIntensity: 0,
      };
    }
    if (width <= (config.mobileBreakpoint || 990)) {
      return {
        visibleSlides: config.tabletVisibleSlides || 5,
        cylinderRadius: Math.min(config.cylinderRadius, 280),
        logoSize: Math.min(config.logoSize, 80),
        tiltIntensity: 0,
      };
    }
    return { visibleSlides: config.visibleSlides || 7 };
  }

  function Logo3D(root, userConfig) {
    this.root = root;
    this.instanceId = 'l3-' + ++uid;
    this.userConfig = userConfig || {};
    this.config = mergeConfig(
      DEFAULTS,
      mergeConfig(parseConfigFromElement(root), this.userConfig)
    );
    this.runtime = mergeConfig(this.config, getBreakpointOverrides(this.config));

    this.stage = root.querySelector('[data-logo-3d-stage]');
    this.tiltEl = root.querySelector('[data-logo-3d-tilt]') || this.stage;
    this.track = root.querySelector('[data-logo-3d-track]');
    this.liveRegion = root.querySelector('[data-logo-3d-live]');
    this.prevBtn = root.querySelector('[data-logo-3d-prev]');
    this.nextBtn = root.querySelector('[data-logo-3d-next]');
    this.pagination = root.querySelector('[data-logo-3d-pagination]');
    this.nav = root.querySelector('[data-logo-3d-nav]');

    this.slides = [];
    this.index = 0;
    this.isDragging = false;
    this.dragStartX = 0;
    this.dragDelta = 0;
    this.pointerId = null;
    this.tiltX = 0;
    this.targetTiltX = 0;
    this.tiltEnabled = false;
    this.rafId = null;
    this.autoplayTimer = null;
    this.transitionTimer = null;
    this.bound = {};
    this.destroyed = false;

    root.setAttribute('data-logo-3d-instance', this.instanceId);
    root.classList.add(this.instanceId);

    if (!this.stage || !this.track) {
      console.warn('[Logo3D] Missing stage/track', this.instanceId);
      return;
    }

    this._collectSlides();
    if (!this.slides.length) return;

    this._applyChrome();
    this._bind();
    this._applyVisualConfig();
    this._updateTiltCapability();
    this.goTo(this._initialIndex(), { animate: false, announce: false });
    this.root.classList.add('is-ready');
    this._startAutoplay();
  }

  Logo3D.prototype._initialIndex = function () {
    var marked = this.slides.findIndex(function (slide) {
      return slide.classList.contains('is-active') || slide.getAttribute('aria-current') === 'true';
    });
    return marked >= 0 ? marked : 0;
  };

  Logo3D.prototype._collectSlides = function () {
    this.slides = Array.prototype.slice.call(
      this.track.querySelectorAll('[data-logo-3d-slide]')
    );
    this.slides.forEach(function (slide, i) {
      slide.setAttribute('role', 'group');
      slide.setAttribute('aria-roledescription', 'slide');
      slide.setAttribute('aria-label', i + 1 + ' of ' + this.slides.length);
      slide.dataset.index = String(i);
      slide.id = this.instanceId + '-slide-' + i;
    }, this);
  };

  Logo3D.prototype._applyChrome = function () {
    if (this.nav) {
      this.nav.hidden = !this.runtime.navigation || this.slides.length < 2;
    }
    if (this.pagination) {
      this.pagination.hidden = !this.runtime.pagination || this.slides.length < 2;
      if (this.runtime.pagination) this._buildPagination();
    }
  };

  Logo3D.prototype._buildPagination = function () {
    var self = this;
    this.pagination.innerHTML = '';
    this.slides.forEach(function (_, i) {
      var li = document.createElement('li');
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'logo-3d__dot';
      btn.setAttribute('data-logo-3d-dot', String(i));
      btn.setAttribute('aria-label', 'Go to logo ' + (i + 1));
      btn.setAttribute('aria-controls', self.instanceId + '-slide-' + i);
      if (i === self.index) {
        btn.classList.add('is-active');
        btn.setAttribute('aria-current', 'true');
      }
      li.appendChild(btn);
      self.pagination.appendChild(li);
    });
  };

  Logo3D.prototype._applyVisualConfig = function () {
    var reduced = this.runtime.respectReducedMotion && prefersReducedMotion();
    var speed = reduced ? 1 : this.runtime.animationSpeed;
    this.root.style.setProperty(
      '--l3-transition',
      speed + 'ms cubic-bezier(0.22, 1, 0.36, 1)'
    );
    this.root.style.setProperty('--l3-perspective', this.runtime.perspective + 'px');
    this.root.style.setProperty('--l3-logo-size', this.runtime.logoSize + 'px');
    this.stage.style.perspective = this.runtime.perspective + 'px';
  };

  Logo3D.prototype._updateTiltCapability = function () {
    var reduced = this.runtime.respectReducedMotion && prefersReducedMotion();
    var width = global.innerWidth || document.documentElement.clientWidth;
    var mobile = width <= (this.runtime.mobileBreakpoint || 990);
    this.tiltEnabled =
      !reduced &&
      !mobile &&
      !isCoarsePointer() &&
      (this.runtime.tiltIntensity || 0) > 0;

    if (!this.tiltEnabled) {
      this.targetTiltX = 0;
      this.tiltX = 0;
      this._applyTilt(true);
    }
  };

  Logo3D.prototype._bind = function () {
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
      var btn = e.target.closest('[data-logo-3d-dot]');
      if (!btn || !self.pagination.contains(btn)) return;
      var i = Number(btn.getAttribute('data-logo-3d-dot'));
      if (!Number.isNaN(i)) self.goTo(i);
    };
    this.bound.onSlideClick = function (e) {
      if (!self.runtime.clickNeighborToCenter) return;
      if (Math.abs(self.dragDelta) > 8) return;
      var slide = e.target.closest('[data-logo-3d-slide]');
      if (!slide || !self.track.contains(slide)) return;
      if (slide.classList.contains('is-active')) return;
      if (e.target.closest('a')) e.preventDefault();
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
    this.bound.onStageMove = function (e) {
      self._onStagePointerMove(e);
    };
    this.bound.onStageLeave = function () {
      self._onStagePointerLeave();
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
    this.bound.onRaf = function () {
      self._tickTilt();
    };

    if (this.prevBtn) this.prevBtn.addEventListener('click', this.bound.onPrev);
    if (this.nextBtn) this.nextBtn.addEventListener('click', this.bound.onNext);
    if (this.pagination) this.pagination.addEventListener('click', this.bound.onPagination);
    this.track.addEventListener('click', this.bound.onSlideClick);
    this.stage.addEventListener('pointerdown', this.bound.onPointerDown);
    this.stage.addEventListener('pointermove', this.bound.onStageMove);
    this.stage.addEventListener('pointerleave', this.bound.onStageLeave);
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

  Logo3D.prototype._onResize = function () {
    this.runtime = mergeConfig(this.config, getBreakpointOverrides(this.config));
    this._applyVisualConfig();
    this._updateTiltCapability();
    this._applyChrome();
    this._render({ animate: false });
  };

  Logo3D.prototype._onStagePointerMove = function (e) {
    if (!this.tiltEnabled || this.isDragging) return;
    if (e.pointerType && e.pointerType !== 'mouse') return;
    var rect = this.stage.getBoundingClientRect();
    if (!rect.width) return;
    var nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    this.targetTiltX = clamp(nx, -1, 1) * (this.runtime.tiltIntensity || 0.35);
    this._ensureRaf();
  };

  Logo3D.prototype._onStagePointerLeave = function () {
    if (!this.tiltEnabled) return;
    this.targetTiltX = 0;
    this._ensureRaf();
  };

  Logo3D.prototype._ensureRaf = function () {
    if (this.rafId !== null) return;
    this.rafId = global.requestAnimationFrame(this.bound.onRaf);
  };

  Logo3D.prototype._tickTilt = function () {
    this.rafId = null;
    this.tiltX += (this.targetTiltX - this.tiltX) * 0.1;
    if (Math.abs(this.targetTiltX - this.tiltX) > 0.001) {
      this._applyTilt(false);
      this._ensureRaf();
    } else {
      this.tiltX = this.targetTiltX;
      this._applyTilt(false);
    }
  };

  Logo3D.prototype._applyTilt = function (instant) {
    if (!this.tiltEl) return;
    var rotY = this.tiltX * 8;
    if (instant) this.tiltEl.style.transition = 'none';
    this.tiltEl.style.transform = 'rotateY(' + rotY + 'deg)';
    if (instant) {
      void this.tiltEl.offsetHeight;
      this.tiltEl.style.transition = '';
    }
  };

  Logo3D.prototype._onPointerDown = function (e) {
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

  Logo3D.prototype._onPointerMove = function (e) {
    if (!this.isDragging) return;
    this.dragDelta = (e.clientX - this.dragStartX) * (this.runtime.dragSensitivity || 1);
    if (!(this.runtime.respectReducedMotion && prefersReducedMotion())) {
      this._renderDragPreview(this.dragDelta);
    }
  };

  Logo3D.prototype._onPointerUp = function () {
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
    var threshold = this.runtime.swipeThreshold || 40;
    var stepSize = Math.max(70, (this.runtime.cylinderRadius || 320) * 0.28);
    var steps = 0;

    if (this.runtime.inertia && Math.abs(delta) > threshold) {
      steps = Math.round(delta / stepSize);
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

  Logo3D.prototype._wrapIndex = function (i) {
    var len = this.slides.length;
    if (!len) return 0;
    if (this.runtime.loop) return ((i % len) + len) % len;
    return clamp(i, 0, len - 1);
  };

  Logo3D.prototype._offsetForIndex = function (slideIndex, activeIndex) {
    var len = this.slides.length;
    if (!this.runtime.loop) return slideIndex - activeIndex;
    var half = Math.floor(len / 2);
    var offset = slideIndex - activeIndex;
    if (offset > half) offset -= len;
    if (offset < -half) offset += len;
    return offset;
  };

  Logo3D.prototype._sideCount = function () {
    var visible = Math.max(1, this.runtime.visibleSlides || 7);
    return Math.max(1, Math.floor((visible - 1) / 2));
  };

  /**
   * Place logos on a horizontal cylinder.
   * Angle step derived from visible arc so logos stay readable.
   */
  Logo3D.prototype._transformForOffset = function (offset, dragProgress) {
    var cfg = this.runtime;
    var t = offset - (dragProgress || 0);
    var abs = Math.abs(t);
    var side = this._sideCount();

    var maxAngle = Math.min(cfg.rotation, 36);
    var angleDeg = t * maxAngle;
    var angleRad = (angleDeg * Math.PI) / 180;
    var radius = cfg.cylinderRadius || 320;

    var x = Math.sin(angleRad) * radius;
    var z = Math.cos(angleRad) * radius - radius + (abs === 0 ? 24 : 0);
    // Soften far depth with configured depth
    if (abs > 0) z -= cfg.depth * 0.15 * Math.min(abs, side);

    var rotateY = -angleDeg;

    var scale = 1;
    if (abs < 1) scale = 1 - (1 - cfg.scale) * abs;
    else scale = Math.max(cfg.scale - cfg.scaleStep * (abs - 1), 0.62);

    var opacity = 1;
    if (abs === 0) opacity = 1;
    else if (abs > side + 0.2) opacity = 0;
    else if (abs > side - 0.25) {
      opacity = clamp(1 - (abs - (side - 0.25)) / 0.55, 0, 1);
    } else {
      opacity = Math.max(cfg.sideOpacity, 1 - abs * ((1 - cfg.sideOpacity) / side));
    }

    // Keep logos readable — floor opacity
    if (opacity > 0) opacity = Math.max(opacity, 0.42);

    return { x: x, z: z, rotateY: rotateY, scale: scale, opacity: opacity };
  };

  Logo3D.prototype._applySlideTransform = function (slide, t) {
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

  Logo3D.prototype._updateImageLoading = function (slide, abs) {
    var img = slide.querySelector('img.logo-3d__logo');
    if (!img) return;
    if (abs <= this._sideCount()) {
      if (img.dataset.src && !img.getAttribute('src')) img.src = img.dataset.src;
      img.loading = abs === 0 ? 'eager' : 'lazy';
      if (abs === 0) img.setAttribute('fetchpriority', 'high');
      else img.removeAttribute('fetchpriority');
    } else {
      img.loading = 'lazy';
      img.removeAttribute('fetchpriority');
    }
  };

  Logo3D.prototype._renderDragPreview = function (deltaX) {
    var stepSize = Math.max(70, (this.runtime.cylinderRadius || 320) * 0.28);
    var progress = deltaX / stepSize;
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

  Logo3D.prototype._render = function (options) {
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

  Logo3D.prototype._syncChrome = function () {
    var i;
    if (this.pagination && this.runtime.pagination) {
      var dots = this.pagination.querySelectorAll('[data-logo-3d-dot]');
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

  Logo3D.prototype._announce = function () {
    if (!this.liveRegion) return;
    var active = this.slides[this.index];
    if (!active) return;
    var name =
      active.getAttribute('data-brand-name') ||
      (active.querySelector('.logo-3d__name') &&
        active.querySelector('.logo-3d__name').textContent) ||
      'Logo ' + (this.index + 1);
    this.liveRegion.textContent =
      name.trim() + ', slide ' + (this.index + 1) + ' of ' + this.slides.length;
  };

  Logo3D.prototype.goTo = function (index, options) {
    options = options || {};
    if (!this.slides.length) return;
    var next = this._wrapIndex(index);
    if (!this.runtime.loop) next = clamp(index, 0, this.slides.length - 1);
    this.index = next;
    this._render({ animate: options.animate !== false });
    if (options.announce !== false) this._announce();
    this._restartAutoplay();
  };

  Logo3D.prototype.next = function () {
    this.goTo(this.index + 1);
  };

  Logo3D.prototype.prev = function () {
    this.goTo(this.index - 1);
  };

  Logo3D.prototype._startAutoplay = function () {
    var self = this;
    this._stopAutoplay();
    if (!this.runtime.autoplay || this.slides.length < 2) return;
    if (this.runtime.respectReducedMotion && prefersReducedMotion()) return;
    if (document.hidden) return;
    this.autoplayTimer = setInterval(function () {
      self.next();
    }, Math.max(1800, this.runtime.autoplayDelay || 3200));
  };

  Logo3D.prototype._stopAutoplay = function () {
    if (this.autoplayTimer) {
      clearInterval(this.autoplayTimer);
      this.autoplayTimer = null;
    }
  };

  Logo3D.prototype._restartAutoplay = function () {
    if (this.runtime.autoplay) this._startAutoplay();
  };

  Logo3D.prototype.updateConfig = function (partial) {
    this.userConfig = mergeConfig(this.userConfig, partial || {});
    this.config = mergeConfig(
      DEFAULTS,
      mergeConfig(parseConfigFromElement(this.root), this.userConfig)
    );
    this.runtime = mergeConfig(this.config, getBreakpointOverrides(this.config));
    this._applyVisualConfig();
    this._updateTiltCapability();
    this._applyChrome();
    this._render({ animate: false });
    this._restartAutoplay();
  };

  Logo3D.prototype.refresh = function () {
    this._collectSlides();
    this._applyChrome();
    this.index = this._wrapIndex(this.index);
    this._render({ animate: false });
  };

  Logo3D.prototype.destroy = function () {
    if (this.destroyed) return;
    this.destroyed = true;
    this._stopAutoplay();
    clearTimeout(this.transitionTimer);
    if (this.rafId !== null) {
      global.cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }

    if (this.prevBtn) this.prevBtn.removeEventListener('click', this.bound.onPrev);
    if (this.nextBtn) this.nextBtn.removeEventListener('click', this.bound.onNext);
    if (this.pagination) this.pagination.removeEventListener('click', this.bound.onPagination);
    this.track.removeEventListener('click', this.bound.onSlideClick);
    this.stage.removeEventListener('pointerdown', this.bound.onPointerDown);
    this.stage.removeEventListener('pointermove', this.bound.onStageMove);
    this.stage.removeEventListener('pointerleave', this.bound.onStageLeave);
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
    if (this.tiltEl) this.tiltEl.style.transform = '';
    this.root.classList.remove(
      'is-ready',
      'is-animating',
      'is-dragging',
      'is-instant',
      this.instanceId
    );
    this.root.removeAttribute('data-logo-3d-instance');
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
    var instance = new Logo3D(root, config);
    INSTANCES.set(root, instance);
    return instance;
  }

  function initAll(selector, config) {
    var nodes = document.querySelectorAll(selector || '[data-logo-3d]');
    var instances = [];
    Array.prototype.forEach.call(nodes, function (node) {
      instances.push(init(node, config));
    });
    return instances;
  }

  var API = {
    defaults: DEFAULTS,
    injectStyles: injectStyles,
    ensureFonts: ensureFonts,
    init: init,
    initAll: initAll,
    getInstance: function (root) {
      return INSTANCES.get(root) || null;
    },
  };

  global.SELogo3D = API;
  global.Logo3D = API;

})(typeof window !== 'undefined' ? window : this);
