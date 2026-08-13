/**
 * SlideEase Premium 3D Coverflow
 * Self-contained IIFE — exposes window.SEPremiumCoverflow
 */
(function (global) {
  'use strict';

  var STYLE_ID = 'se-premium-coverflow-styles';
  var FONT_ID = 'se-premium-coverflow-fonts';
  var FONT_HREF =
    'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600&family=Manrope:wght@500;600;700&display=swap';

  var DEFAULTS = {
    slideSpacing: 280,
    perspective: 1200,
    depth: 180,
    rotation: 48,
    scale: 0.78,
    scaleStep: 0.1,
    transitionSpeed: 620,
    autoplay: false,
    autoplayDelay: 4200,
    navigation: true,
    pagination: true,
    loop: true,
    visibleSlides: 5,
    dragSensitivity: 1,
    swipeThreshold: 48,
    inertia: true,
    clickNeighborToCenter: true,
  };

  var INSTANCES = new WeakMap();
  var stylesInjected = false;
  var fontsLoaded = false;

  var CSS = [
    '/* SlideEase Premium Coverflow — scoped to .se-pcf */',
    '.se-pcf {',
    '  --cf-bg-start: #ece8e2;',
    '  --cf-bg-end: #d9d4cc;',
    '  --cf-surface: #f7f5f1;',
    '  --cf-ink: #1a1816;',
    '  --cf-ink-muted: #6b6560;',
    '  --cf-ink-soft: #9a948c;',
    '  --cf-line: rgba(26, 24, 22, 0.08);',
    '  --cf-accent: #8a6a3d;',
    '  --cf-accent-soft: rgba(138, 106, 61, 0.12);',
    '  --cf-shadow: 0 18px 40px rgba(26, 24, 22, 0.14);',
    '  --cf-shadow-active: 0 28px 56px rgba(26, 24, 22, 0.22);',
    '  --cf-radius: 2px;',
    '  --cf-font-display: "Cormorant Garamond", "Times New Roman", serif;',
    '  --cf-font-body: "Manrope", "Helvetica Neue", sans-serif;',
    '  --cf-transition: 620ms cubic-bezier(0.22, 1, 0.36, 1);',
    '  --cf-slide-width: min(42vw, 340px);',
    '  --cf-perspective: 1200px;',
    '  --cf-stage-pad-y: clamp(2.5rem, 6vw, 4.5rem);',
    '  position: relative;',
    '  isolation: isolate;',
    '  width: 100vw;',
    '  max-width: 100vw;',
    '  margin-left: calc(50% - 50vw);',
    '  margin-right: calc(50% - 50vw);',
    '  padding: clamp(2rem, 5vw, 4rem) 0 clamp(2.5rem, 6vw, 5rem);',
    '  font-family: var(--cf-font-body);',
    '  color: var(--cf-ink);',
    '  background: var(--cf-section-bg);',
    '  overflow: hidden;',
    '  -webkit-font-smoothing: antialiased;',
    '  -moz-osx-font-smoothing: grayscale;',
    '}',
    '.se-pcf *,',
    '.se-pcf *::before,',
    '.se-pcf *::after {',
    '  box-sizing: border-box;',
    '}',
    '.se-pcf__inner {',
    '  width: min(100% - 2.5rem, 1280px);',
    '  margin-inline: auto;',
    '}',
    '.se-pcf__header {',
    '  text-align: center;',
    '  margin-bottom: clamp(1.75rem, 4vw, 3rem);',
    '}',
    '.se-pcf__eyebrow {',
    '  display: block;',
    '  margin: 0 0 0.65rem;',
    '  font-size: 0.6875rem;',
    '  font-weight: 600;',
    '  letter-spacing: 0.22em;',
    '  text-transform: uppercase;',
    '  color: var(--cf-accent);',
    '}',
    '.se-pcf__heading {',
    '  margin: 0;',
    '  font-family: var(--cf-font-display);',
    '  font-size: clamp(2.25rem, 5vw, 3.75rem);',
    '  font-weight: 500;',
    '  line-height: 1.05;',
    '  letter-spacing: -0.02em;',
    '  color: var(--cf-ink);',
    '}',
    '.se-pcf__subheading {',
    '  margin: 0.85rem auto 0;',
    '  max-width: 32rem;',
    '  font-size: 0.9375rem;',
    '  line-height: 1.6;',
    '  color: var(--cf-ink-muted);',
    '}',
    '.se-pcf__stage {',
    '  position: relative;',
    '  width: 100%;',
    '  perspective: var(--cf-perspective);',
    '  perspective-origin: 50% 45%;',
    '  touch-action: pan-y;',
    '  user-select: none;',
    '  -webkit-user-select: none;',
    '}',
    '.se-pcf__stage.is-dragging {',
    '  cursor: grabbing;',
    '}',
    '.se-pcf.is-dragging .se-pcf__slide,',
    '.se-pcf.is-instant .se-pcf__slide {',
    '  transition: none;',
    '}',
    '.se-pcf__stage:not(.is-dragging) {',
    '  cursor: grab;',
    '}',
    '.se-pcf__track {',
    '  position: relative;',
    '  display: flex;',
    '  align-items: center;',
    '  justify-content: center;',
    '  width: 100%;',
    '  min-height: calc(var(--cf-slide-width) * 1.55 + var(--cf-stage-pad-y) * 2);',
    '  padding-block: var(--cf-stage-pad-y);',
    '  transform-style: preserve-3d;',
    '  will-change: contents;',
    '}',
    '.se-pcf__slide {',
    '  position: absolute;',
    '  top: 50%;',
    '  left: 50%;',
    '  width: var(--cf-slide-width);',
    '  margin: 0;',
    '  padding: 0;',
    '  list-style: none;',
    '  transform-style: preserve-3d;',
    '  transform-origin: center center;',
    '  transition:',
    '    transform var(--cf-transition),',
    '    opacity var(--cf-transition),',
    '    filter var(--cf-transition),',
    '    visibility var(--cf-transition);',
    '  will-change: transform, opacity, filter;',
    '  backface-visibility: hidden;',
    '  -webkit-backface-visibility: hidden;',
    '}',
    '.se-pcf__slide.is-hidden {',
    '  visibility: hidden;',
    '  pointer-events: none;',
    '  opacity: 0;',
    '}',
    '.se-pcf__slide.is-active {',
    '  z-index: 10;',
    '}',
    '.se-pcf__slide:not(.is-active) {',
    '  z-index: 1;',
    '}',
    '.se-pcf__slide.is-active .se-pcf-card {',
    '  box-shadow: var(--cf-shadow-active);',
    '}',
    '.se-pcf__slide:not(.is-active) .se-pcf-card {',
    '  box-shadow: var(--cf-shadow);',
    '  filter: saturate(0.88) brightness(0.97);',
    '}',
    '.se-pcf__slide:not(.is-active) .se-pcf-card__body {',
    '  opacity: 0.72;',
    '}',
    '.se-pcf__slide.is-active .se-pcf-card__body {',
    '  opacity: 1;',
    '}',
    '.se-pcf.is-animating .se-pcf__slide {',
    '  pointer-events: none;',
    '}',
    '.se-pcf__slide.is-clickable:not(.is-active) {',
    '  cursor: pointer;',
    '}',
    '.se-pcf-card {',
    '  display: flex;',
    '  flex-direction: column;',
    '  width: 100%;',
    '  background: var(--cf-surface);',
    '  border: 1px solid var(--cf-line);',
    '  border-radius: var(--cf-radius);',
    '  overflow: hidden;',
    '  transform: translateZ(0);',
    '  transition:',
    '    box-shadow var(--cf-transition),',
    '    filter var(--cf-transition);',
    '}',
    '.se-pcf-card__media {',
    '  position: relative;',
    '  width: 100%;',
    '  aspect-ratio: 4 / 5;',
    '  background: #e4e0d9;',
    '  overflow: hidden;',
    '}',
    '.se-pcf-card__media::after {',
    '  content: "";',
    '  position: absolute;',
    '  inset: 0;',
    '  pointer-events: none;',
    '  background: linear-gradient(180deg, transparent 62%, rgba(26, 24, 22, 0.04) 100%);',
    '  opacity: 0;',
    '  transition: opacity var(--cf-transition);',
    '}',
    '.se-pcf__slide.is-active .se-pcf-card__media::after {',
    '  opacity: 1;',
    '}',
    '.se-pcf-card__image {',
    '  display: block;',
    '  width: 100%;',
    '  height: 100%;',
    '  object-fit: cover;',
    '  object-position: center;',
    '  transform: scale(1.01);',
    '  transition: transform 900ms cubic-bezier(0.22, 1, 0.36, 1), opacity 0.25s ease;',
    '}',
    '.se-pcf__slide.is-active .se-pcf-card__image:not(.se-pcf-card__image--hover) {',
    '  transform: scale(1);',
    '}',
    '.se-pcf-card__image--hover,',
    '.se-pcf-card__media .se-product-card__img--hover {',
    '  position: absolute;',
    '  inset: 0;',
    '  opacity: 0;',
    '  pointer-events: none;',
    '  transform: scale(1);',
    '  z-index: 1;',
    '}',
    '@media (hover: hover) and (pointer: fine) {',
    '  .se-pcf__slide.is-active .se-pcf-card--has-hover:hover .se-pcf-card__image--hover,',
    '  .se-pcf__slide.is-active .se-pcf-card--has-hover:hover .se-product-card__img--hover,',
    '  .se-pcf__slide.is-active .se-product-card--has-hover:hover .se-pcf-card__image--hover,',
    '  .se-pcf__slide.is-active .se-product-card--has-hover:hover .se-product-card__img--hover {',
    '    opacity: 1;',
    '  }',
    '}',
    '.se-pcf-card__media .se-product-card__atc.se-product-card__quick-add {',
    '  position: absolute;',
    '  right: 0.75rem;',
    '  bottom: 0.75rem;',
    '  z-index: 4;',
    '  width: auto;',
    '  min-width: 0;',
    '  min-height: 0;',
    '  height: auto;',
    '  margin: 0;',
    '  padding: 0.45rem;',
    '  display: inline-flex;',
    '  align-items: center;',
    '  justify-content: center;',
    '  border-radius: 4px;',
    '  border: 0;',
    '  letter-spacing: 0.02em;',
    '  text-transform: none;',
    '  font-size: var(--cf-quick-add-size, 11px);',
    '  font-weight: 700;',
    '  line-height: 1;',
    '  color: #fff;',
    '  background: var(--cf-quick-add-bg, #170f49);',
    '  opacity: 0;',
    '  pointer-events: none;',
    '  cursor: pointer;',
    '  transition: opacity 180ms ease, transform 180ms ease, background-color 180ms ease;',
    '}',
    '.se-pcf-card__media .se-product-card__atc.se-product-card__quick-add .se-product-card__quick-add-icon,',
    '.se-pcf-card__media .se-product-card__atc.se-product-card__quick-add svg {',
    '  display: block;',
    '  width: var(--cf-quick-add-size, 11px);',
    '  height: var(--cf-quick-add-size, 11px);',
    '}',
    '@media (hover: hover) and (pointer: fine) {',
    '  .se-pcf__slide.is-active .se-pcf-card--quick-add:hover .se-product-card__quick-add,',
    '  .se-pcf__slide.is-active .se-product-card--quick-add:hover .se-product-card__quick-add {',
    '    opacity: 1;',
    '    pointer-events: auto;',
    '  }',
    '}',
    '@media (hover: none), (pointer: coarse) {',
    '  .se-pcf__slide.is-active .se-pcf-card__media .se-product-card__quick-add {',
    '    opacity: 1;',
    '    pointer-events: auto;',
    '  }',
    '}',
    '.se-pcf__slide:not(.is-active) .se-pcf-card__media .se-product-card__quick-add {',
    '  opacity: 0;',
    '  pointer-events: none;',
    '}',
    '.se-pcf-card__badge,',
    '.se-pcf-card__media .se-product-card__badge {',
    '  position: absolute;',
    '  top: 0.85rem;',
    '  left: 0.85rem;',
    '  z-index: 2;',
    '  margin: 0;',
    '  padding: var(--cf-sales-badge-pad, 8px);',
    '  font-size: 0.625rem;',
    '  font-weight: 700;',
    '  letter-spacing: 0.14em;',
    '  text-transform: uppercase;',
    '  color: var(--cf-surface);',
    '  background: var(--cf-sales-badge-bg, #170f49);',
    '  border-radius: 1px;',
    '}',
    '.se-pcf-card__badge--sale,',
    '.se-pcf-card__media .se-product-card__badge--sale {',
    '  background: var(--cf-sales-badge-bg, #170f49);',
    '}',
    '.se-pcf-card__body {',
    '  display: flex;',
    '  flex-direction: column;',
    '  gap: 0.55rem;',
    '  padding: 1.1rem 1.15rem 1.25rem;',
    '  transition: opacity var(--cf-transition);',
    '  text-align: center;',
    '}',
    '.se-pcf-card__title {',
    '  margin: 0;',
    '  font-family: var(--cf-font-display);',
    '  font-size: clamp(1.2rem, 2.4vw, 1.45rem);',
    '  font-weight: 500;',
    '  line-height: 1.25;',
    '  letter-spacing: 0.01em;',
    '  color: var(--cf-ink);',
    '}',
    '.se-pcf-card__title a {',
    '  color: inherit;',
    '  text-decoration: none;',
    '}',
    '.se-pcf-card__title a:hover,',
    '.se-pcf-card__title a:focus-visible {',
    '  text-decoration: underline;',
    '  text-underline-offset: 0.18em;',
    '}',
    '.se-pcf-card__price {',
    '  display: flex;',
    '  align-items: baseline;',
    '  justify-content: center;',
    '  gap: 0.5rem;',
    '  margin: 0;',
    '  font-size: 0.8125rem;',
    '  font-weight: 600;',
    '  letter-spacing: 0.04em;',
    '  color: var(--cf-ink);',
    '}',
    '.se-pcf-card__compare {',
    '  font-weight: 500;',
    '  color: var(--cf-ink-soft);',
    '  text-decoration: line-through;',
    '}',
    '.se-pcf-card__actions {',
    '  display: flex;',
    '  flex-direction: row;',
    '  flex-wrap: nowrap;',
    '  align-items: center;',
    '  justify-content: center;',
    '  gap: 0.45rem;',
    '  width: 100%;',
    '  margin-top: 0.35rem;',
    '}',
    '.se-pcf-card__cta,',
    '.se-pcf-card__body .se-product-card__atc:not(.se-product-card__quick-add) {',
    '  display: inline-flex;',
    '  align-items: center;',
    '  justify-content: center;',
    '  flex: 0 0 auto;',
    '  align-self: center;',
    '  margin-top: 0;',
    '  min-height: 2.5rem;',
    '  width: auto;',
    '  min-width: 0;',
    '  padding: 0.65rem 1.35rem;',
    '  font-family: var(--cf-font-body);',
    '  font-size: 0.6875rem;',
    '  font-weight: 700;',
    '  letter-spacing: 0.16em;',
    '  text-transform: uppercase;',
    '  text-decoration: none;',
    '  color: var(--cf-cta-color, var(--cf-surface));',
    '  background: var(--cf-cta-bg, var(--cf-ink));',
    '  border: 1px solid var(--cf-cta-border, var(--cf-ink));',
    '  border-radius: var(--cf-cta-radius, 1px);',
    '  cursor: pointer;',
    '  white-space: nowrap;',
    '  transition:',
    '    background-color 220ms ease,',
    '    color 220ms ease,',
    '    border-color 220ms ease,',
    '    transform 220ms ease;',
    '}',
    '.se-pcf-card__body .se-product-card__atc:not(.se-product-card__quick-add) {',
    '  color: var(--cf-atc-color, var(--cf-cta-color, var(--cf-surface)));',
    '  background: var(--cf-atc-bg, var(--cf-cta-bg, var(--cf-ink)));',
    '  border-color: var(--cf-atc-border, var(--cf-cta-border, var(--cf-ink)));',
    '}',
    '.se-pcf-card__cta:hover,',
    '.se-pcf-card__cta:focus-visible,',
    '.se-pcf-card__body .se-product-card__atc:not(.se-product-card__quick-add):hover,',
    '.se-pcf-card__body .se-product-card__atc:not(.se-product-card__quick-add):focus-visible {',
    '  background: var(--cf-cta-hover-bg, transparent);',
    '  color: var(--cf-cta-hover-color, var(--cf-ink));',
    '  border-color: var(--cf-cta-border, var(--cf-ink));',
    '  outline: none;',
    '}',
    '.se-pcf-card__body .se-product-card__atc:not(.se-product-card__quick-add):hover,',
    '.se-pcf-card__body .se-product-card__atc:not(.se-product-card__quick-add):focus-visible {',
    '  background: var(--cf-atc-hover-bg, var(--cf-cta-hover-bg, transparent));',
    '  color: var(--cf-atc-hover-color, var(--cf-cta-hover-color, var(--cf-ink)));',
    '  border-color: var(--cf-atc-border, var(--cf-cta-border, var(--cf-ink)));',
    '}',
    '.se-pcf-card__cta:focus-visible,',
    '.se-pcf-card__body .se-product-card__atc:not(.se-product-card__quick-add):focus-visible {',
    '  outline: 2px solid var(--cf-accent);',
    '  outline-offset: 3px;',
    '}',
    '.se-pcf__slide:not(.is-active) .se-pcf-card__cta,',
    '.se-pcf__slide:not(.is-active) .se-pcf-card__body .se-product-card__atc:not(.se-product-card__quick-add) {',
    '  pointer-events: none;',
    '}',
    '.se-pcf__controls {',
    '  display: flex;',
    '  flex-direction: column;',
    '  align-items: center;',
    '  gap: 1.25rem;',
    '  margin-top: clamp(0.5rem, 2vw, 1.25rem);',
    '}',
    '.se-pcf__nav {',
    '  display: flex;',
    '  align-items: center;',
    '  justify-content: center;',
    '  gap: 0.75rem;',
    '}',
    '.se-pcf__arrow {',
    '  display: inline-flex;',
    '  align-items: center;',
    '  justify-content: center;',
    '  width: 2.75rem;',
    '  height: 2.75rem;',
    '  padding: 0;',
    '  color: var(--cf-ink);',
    '  background: rgba(247, 245, 241, 0.72);',
    '  border: 1px solid var(--cf-line);',
    '  border-radius: 50%;',
    '  cursor: pointer;',
    '  backdrop-filter: blur(8px);',
    '  transition:',
    '    background-color 200ms ease,',
    '    border-color 200ms ease,',
    '    transform 200ms ease,',
    '    opacity 200ms ease;',
    '}',
    '.se-pcf__arrow svg {',
    '  width: 1rem;',
    '  height: 1rem;',
    '  pointer-events: none;',
    '}',
    '.se-pcf__arrow:hover:not(:disabled),',
    '.se-pcf__arrow:focus-visible {',
    '  background: var(--cf-surface);',
    '  border-color: rgba(26, 24, 22, 0.2);',
    '  outline: none;',
    '}',
    '.se-pcf__arrow:focus-visible {',
    '  outline: 2px solid var(--cf-accent);',
    '  outline-offset: 3px;',
    '}',
    '.se-pcf__arrow:active:not(:disabled) {',
    '  transform: scale(0.96);',
    '}',
    '.se-pcf__arrow:disabled {',
    '  opacity: 0.35;',
    '  cursor: not-allowed;',
    '}',
    '.se-pcf__pagination {',
    '  display: flex;',
    '  flex-wrap: wrap;',
    '  align-items: center;',
    '  justify-content: center;',
    '  gap: 0.45rem;',
    '  max-width: min(100%, 28rem);',
    '  padding: 0;',
    '  margin: 0;',
    '  list-style: none;',
    '}',
    '.se-pcf__dot {',
    '  width: 0.45rem;',
    '  height: 0.45rem;',
    '  padding: 0;',
    '  background: rgba(26, 24, 22, 0.22);',
    '  border: 0;',
    '  border-radius: 50%;',
    '  cursor: pointer;',
    '  transition:',
    '    background-color 220ms ease,',
    '    transform 220ms ease,',
    '    width 220ms ease;',
    '}',
    '.se-pcf__dot.is-active {',
    '  width: 1.35rem;',
    '  border-radius: 999px;',
    '  background: var(--cf-ink);',
    '}',
    '.se-pcf__dot:hover:not(.is-active),',
    '.se-pcf__dot:focus-visible {',
    '  background: rgba(26, 24, 22, 0.45);',
    '  outline: none;',
    '}',
    '.se-pcf__dot:focus-visible {',
    '  outline: 2px solid var(--cf-accent);',
    '  outline-offset: 3px;',
    '}',
    '.se-pcf__live {',
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
    '@media (max-width: 989px) {',
    '  .se-pcf {',
    '    --cf-slide-width: min(58vw, 300px);',
    '  }',
    '}',
    '@media (max-width: 749px) {',
    '  .se-pcf {',
    '    --cf-slide-width: min(72vw, 280px);',
    '    padding-block: 1.75rem 2.5rem;',
    '  }',
    '  .se-pcf__inner {',
    '    width: min(100% - 1.25rem, 1280px);',
    '  }',
    '  .se-pcf-card__body {',
    '    padding: 0.95rem 0.9rem 1.1rem;',
    '  }',
    '  .se-pcf-card__actions {',
    '    gap: 0.35rem;',
    '  }',
    '  .se-pcf-card__cta,',
    '  .se-pcf-card__body .se-product-card__atc:not(.se-product-card__quick-add) {',
    '    flex: 0 0 auto;',
    '    width: auto;',
    '    padding: 0.55rem 1rem;',
    '    font-size: 0.625rem;',
    '    letter-spacing: 0.12em;',
    '  }',
    '}',
    '@media (max-width: 479px) {',
    '  .se-pcf {',
    '    --cf-slide-width: min(78vw, 260px);',
    '  }',
    '}',
    '@media (prefers-reduced-motion: reduce) {',
    '  .se-pcf {',
    '    --cf-transition: 1ms linear;',
    '  }',
    '  .se-pcf__slide,',
    '  .se-pcf-card,',
    '  .se-pcf-card__image,',
    '  .se-pcf-card__body,',
    '  .se-pcf-card__media::after,',
    '  .se-pcf-card__cta,',
    '  .se-pcf-card__body .se-product-card__atc,',
    '  .se-pcf__arrow,',
    '  .se-pcf__dot {',
    '    transition: none !important;',
    '  }',
    '}',
    '.se-pcf:not(.is-ready) .se-pcf__stage {',
    '  min-height: calc(var(--cf-slide-width) * 1.55 + var(--cf-stage-pad-y) * 2);',
    '  opacity: 0;',
    '  visibility: hidden;',
    '  pointer-events: none;',
    '}',
    '.se-pcf:not(.is-ready) .se-pcf__controls {',
    '  opacity: 0;',
    '  visibility: hidden;',
    '  pointer-events: none;',
    '}',
    '.se-pcf.is-ready .se-pcf__stage,',
    '.se-pcf.is-ready .se-pcf__controls {',
    '  opacity: 1;',
    '  visibility: visible;',
    '  transition: opacity 160ms ease, visibility 160ms ease;',
    '}',
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
      if (Object.prototype.hasOwnProperty.call(base, key)) {
        out[key] = base[key];
      }
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
    var raw = el.getAttribute('data-se-pcf-config');
    if (!raw) return {};
    try {
      return JSON.parse(raw);
    } catch (err) {
      console.warn('[SEPremiumCoverflow] Invalid data-se-pcf-config JSON', err);
      return {};
    }
  }

  function getBreakpointOverrides(config) {
    var width = global.innerWidth || document.documentElement.clientWidth;
    if (width <= 749) {
      return {
        slideSpacing: Math.min(config.slideSpacing, 210),
        depth: Math.min(config.depth, 140),
        rotation: Math.min(config.rotation, 42),
        visibleSlides: Math.min(config.visibleSlides, 3),
        scale: Math.max(config.scale, 0.82),
      };
    }
    if (width <= 989) {
      return {
        slideSpacing: Math.min(config.slideSpacing, 240),
        depth: Math.min(config.depth, 160),
        visibleSlides: Math.min(config.visibleSlides, 5),
      };
    }
    return {};
  }

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

  function PremiumCoverflow(root, userConfig) {
    this.root = root;
    this.userConfig = userConfig || {};
    this.config = mergeConfig(
      DEFAULTS,
      mergeConfig(parseConfigFromElement(root), this.userConfig)
    );
    this.runtime = mergeConfig(this.config, getBreakpointOverrides(this.config));

    this.stage = root.querySelector('[data-se-pcf-stage]');
    this.track = root.querySelector('[data-se-pcf-track]');
    this.liveRegion = root.querySelector('[data-se-pcf-live]');
    this.prevBtn = root.querySelector('[data-se-pcf-prev]');
    this.nextBtn = root.querySelector('[data-se-pcf-next]');
    this.pagination = root.querySelector('[data-se-pcf-pagination]');
    this.nav = root.querySelector('[data-se-pcf-nav]');

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

    if (!this.stage || !this.track) {
      console.warn('[SEPremiumCoverflow] Missing stage/track elements');
      return;
    }

    this._collectSlides();
    if (!this.slides.length) return;

    this._applyChrome();
    this._bind();
    this._setTransitionSpeed();
    this._setPerspective();
    this.root.classList.add('is-instant');
    this.goTo(this._initialIndex(), { animate: false, announce: false });
    var self = this;
    // Reveal only after transforms are painted — avoids FOUC / back-nav flash
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        if (self.destroyed) return;
        self.root.classList.add('is-ready');
        requestAnimationFrame(function () {
          if (!self.destroyed) self.root.classList.remove('is-instant');
        });
      });
    });
    this._startAutoplay();
  }

  PremiumCoverflow.prototype._initialIndex = function () {
    var marked = this.slides.findIndex(function (slide) {
      return slide.classList.contains('is-active') || slide.getAttribute('aria-current') === 'true';
    });
    return marked >= 0 ? marked : 0;
  };

  PremiumCoverflow.prototype._collectSlides = function () {
    this.slides = Array.prototype.slice.call(
      this.track.querySelectorAll('[data-se-pcf-slide]')
    );
    this.slides.forEach(function (slide, i) {
      slide.setAttribute('role', 'group');
      slide.setAttribute('aria-roledescription', 'slide');
      slide.setAttribute('aria-label', i + 1 + ' of ' + this.slides.length);
      slide.dataset.index = String(i);
    }, this);
  };

  PremiumCoverflow.prototype._applyChrome = function () {
    if (this.nav) {
      this.nav.hidden = !this.runtime.navigation || this.slides.length < 2;
    }
    if (this.pagination) {
      this.pagination.hidden = !this.runtime.pagination || this.slides.length < 2;
      if (this.runtime.pagination) this._buildPagination();
    }
  };

  PremiumCoverflow.prototype._buildPagination = function () {
    var self = this;
    this.pagination.innerHTML = '';
    this.slides.forEach(function (_, i) {
      var li = document.createElement('li');
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'se-pcf__dot';
      btn.setAttribute('data-se-pcf-dot', String(i));
      btn.setAttribute('aria-label', 'Go to product ' + (i + 1));
      if (i === self.index) {
        btn.classList.add('is-active');
        btn.setAttribute('aria-current', 'true');
      }
      li.appendChild(btn);
      self.pagination.appendChild(li);
    });
  };

  PremiumCoverflow.prototype._setTransitionSpeed = function () {
    var speed = prefersReducedMotion() ? 1 : this.runtime.transitionSpeed;
    this.root.style.setProperty('--cf-transition', speed + 'ms cubic-bezier(0.22, 1, 0.36, 1)');
  };

  PremiumCoverflow.prototype._setPerspective = function () {
    this.root.style.setProperty('--cf-perspective', this.runtime.perspective + 'px');
    if (this.stage) {
      this.stage.style.perspective = this.runtime.perspective + 'px';
    }
  };

  PremiumCoverflow.prototype._bind = function () {
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
      var btn = e.target.closest('[data-se-pcf-dot]');
      if (!btn || !self.pagination.contains(btn)) return;
      var i = Number(btn.getAttribute('data-se-pcf-dot'));
      if (!Number.isNaN(i)) self.goTo(i);
    };
    this.bound.onSlideClick = function (e) {
      if (!self.runtime.clickNeighborToCenter) return;
      if (Math.abs(self.dragDelta) > 8) return;
      var slide = e.target.closest('[data-se-pcf-slide]');
      if (!slide || !self.track.contains(slide)) return;
      if (slide.classList.contains('is-active')) return;
      if (e.target.closest('a, button')) {
        e.preventDefault();
      }
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
    this.bound.onEnter = function () {
      self._stopAutoplay();
    };
    this.bound.onLeave = function () {
      self._startAutoplay();
    };
    this.bound.onPageShow = function (e) {
      if (!e.persisted || self.destroyed) return;
      self.root.classList.add('is-instant');
      self._render({ animate: false });
      self.root.classList.add('is-ready');
      requestAnimationFrame(function () {
        if (!self.destroyed) self.root.classList.remove('is-instant');
      });
    };

    if (this.prevBtn) this.prevBtn.addEventListener('click', this.bound.onPrev);
    if (this.nextBtn) this.nextBtn.addEventListener('click', this.bound.onNext);
    if (this.pagination) this.pagination.addEventListener('click', this.bound.onPagination);
    this.track.addEventListener('click', this.bound.onSlideClick);
    this.stage.addEventListener('pointerdown', this.bound.onPointerDown);
    this.root.addEventListener('keydown', this.bound.onKeyDown);
    this.root.setAttribute('tabindex', '0');
    this.root.setAttribute('aria-roledescription', 'carousel');
    global.addEventListener('resize', this.bound.onResize);
    global.addEventListener('pageshow', this.bound.onPageShow);
    document.addEventListener('visibilitychange', this.bound.onVisibility);
    this.root.addEventListener('mouseenter', this.bound.onEnter);
    this.root.addEventListener('mouseleave', this.bound.onLeave);
    this.root.addEventListener('focusin', this.bound.onEnter);
    this.root.addEventListener('focusout', this.bound.onLeave);
  };

  PremiumCoverflow.prototype._onResize = function () {
    this.runtime = mergeConfig(this.config, getBreakpointOverrides(this.config));
    this._setTransitionSpeed();
    this._setPerspective();
    this._applyChrome();
    this._render({ animate: false });
  };

  PremiumCoverflow.prototype._onPointerDown = function (e) {
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
    } catch (_) {
      /* noop */
    }
    this.stage.addEventListener('pointermove', this.bound.onPointerMove);
    this.stage.addEventListener('pointerup', this.bound.onPointerUp);
    this.stage.addEventListener('pointercancel', this.bound.onPointerUp);
  };

  PremiumCoverflow.prototype._onPointerMove = function (e) {
    if (!this.isDragging) return;
    this.dragDelta = (e.clientX - this.dragStartX) * (this.runtime.dragSensitivity || 1);
    if (!prefersReducedMotion()) {
      this._renderDragPreview(this.dragDelta);
    }
  };

  PremiumCoverflow.prototype._onPointerUp = function () {
    if (!this.isDragging) return;
    this.isDragging = false;
    this.stage.classList.remove('is-dragging');
    this.root.classList.remove('is-dragging');
    this.stage.removeEventListener('pointermove', this.bound.onPointerMove);
    this.stage.removeEventListener('pointerup', this.bound.onPointerUp);
    this.stage.removeEventListener('pointercancel', this.bound.onPointerUp);
    try {
      if (this.pointerId !== null) this.stage.releasePointerCapture(this.pointerId);
    } catch (_) {
      /* noop */
    }
    this.pointerId = null;

    var delta = this.dragDelta;
    var threshold = this.runtime.swipeThreshold || 48;
    var spacing = this.runtime.slideSpacing || 280;
    var steps = 0;

    if (this.runtime.inertia && Math.abs(delta) > threshold) {
      steps = Math.round(delta / spacing);
      if (steps === 0) steps = delta > 0 ? 1 : -1;
      steps = clamp(steps, -3, 3);
    } else if (Math.abs(delta) > threshold) {
      steps = delta > 0 ? 1 : -1;
    }

    this.dragDelta = 0;

    if (steps !== 0) {
      this.goTo(this.index - steps);
    } else {
      this._render({ animate: true });
    }
    this._startAutoplay();
  };

  PremiumCoverflow.prototype._wrapIndex = function (i) {
    var len = this.slides.length;
    if (!len) return 0;
    if (this.runtime.loop) {
      return ((i % len) + len) % len;
    }
    return clamp(i, 0, len - 1);
  };

  PremiumCoverflow.prototype._offsetForIndex = function (slideIndex, activeIndex) {
    var len = this.slides.length;
    if (!this.runtime.loop) return slideIndex - activeIndex;

    var half = Math.floor(len / 2);
    var offset = slideIndex - activeIndex;
    if (offset > half) offset -= len;
    if (offset < -half) offset += len;
    return offset;
  };

  PremiumCoverflow.prototype._sideCount = function () {
    var visible = Math.max(1, this.runtime.visibleSlides || 5);
    return Math.max(1, Math.floor((visible - 1) / 2));
  };

  PremiumCoverflow.prototype._transformForOffset = function (offset, dragProgress) {
    var cfg = this.runtime;
    var t = offset - (dragProgress || 0);
    var abs = Math.abs(t);
    var dir = t === 0 ? 0 : t > 0 ? 1 : -1;
    var x = t * cfg.slideSpacing;
    var z = -cfg.depth * abs;
    var rot =
      -dir * cfg.rotation * Math.min(abs, 1) -
      dir * cfg.rotation * 0.35 * Math.max(abs - 1, 0);
    var scale = Math.max(cfg.scale - cfg.scaleStep * Math.max(abs - 1, 0), 0.55);
    if (abs < 1) {
      scale = 1 - (1 - cfg.scale) * abs;
    }
    return {
      x: x,
      z: z,
      rotateY: rot,
      scale: scale,
      opacity: abs > this._sideCount() + 0.35 ? 0 : 1 - Math.max(0, abs - this._sideCount()) * 0.85,
    };
  };

  PremiumCoverflow.prototype._applySlideTransform = function (slide, transform) {
    slide.style.transform =
      'translate(-50%, -50%) translateX(' +
      transform.x +
      'px) translateZ(' +
      transform.z +
      'px) rotateY(' +
      transform.rotateY +
      'deg) scale(' +
      transform.scale +
      ')';
    slide.style.opacity = String(transform.opacity);
  };

  PremiumCoverflow.prototype._updateImageLoading = function (slide, offsetAbs) {
    var img = slide.querySelector('img');
    if (!img) return;
    if (offsetAbs <= 1) {
      if (img.dataset.src && !img.getAttribute('src')) {
        img.setAttribute('src', img.dataset.src);
      }
      if (img.dataset.srcset && !img.getAttribute('srcset')) {
        img.setAttribute('srcset', img.dataset.srcset);
      }
      img.loading = 'eager';
      img.setAttribute('fetchpriority', offsetAbs === 0 ? 'high' : 'auto');
    } else if (offsetAbs <= this._sideCount()) {
      if (img.dataset.src && !img.getAttribute('src')) {
        img.setAttribute('src', img.dataset.src);
      }
      if (img.dataset.srcset && !img.getAttribute('srcset')) {
        img.setAttribute('srcset', img.dataset.srcset);
      }
      img.loading = 'lazy';
      img.removeAttribute('fetchpriority');
    } else {
      img.loading = 'lazy';
      img.removeAttribute('fetchpriority');
    }
  };

  PremiumCoverflow.prototype._renderDragPreview = function (deltaX) {
    var progress = deltaX / (this.runtime.slideSpacing || 280);
    var self = this;
    this.slides.forEach(function (slide, i) {
      var offset = self._offsetForIndex(i, self.index);
      var transform = self._transformForOffset(offset, progress);
      var side = self._sideCount();
      var hidden = Math.abs(offset - progress) > side + 1.2;
      slide.classList.toggle('is-hidden', hidden);
      self._applySlideTransform(slide, transform);
    });
  };

  PremiumCoverflow.prototype._render = function (options) {
    options = options || {};
    var animate = options.animate !== false && !prefersReducedMotion();
    var self = this;
    var side = this._sideCount();

    if (!animate) {
      this.root.classList.add('is-instant');
    }

    this.root.classList.toggle('is-animating', animate);

    this.slides.forEach(function (slide, i) {
      var offset = self._offsetForIndex(i, self.index);
      var abs = Math.abs(offset);
      var transform = self._transformForOffset(offset, 0);
      var isActive = offset === 0;
      var hidden = abs > side;

      slide.classList.toggle('is-active', isActive);
      slide.classList.toggle('is-hidden', hidden);
      slide.classList.toggle('is-clickable', !isActive && abs <= side);
      slide.setAttribute('aria-hidden', isActive ? 'false' : 'true');
      if (isActive) {
        slide.setAttribute('aria-current', 'true');
      } else {
        slide.removeAttribute('aria-current');
      }
      slide.tabIndex = isActive ? 0 : -1;
      slide.style.zIndex = String(100 - abs);

      self._applySlideTransform(slide, transform);
      self._updateImageLoading(slide, abs);
    });

    this._syncChrome();

    if (!animate) {
      void this.track.offsetHeight;
      this.root.classList.remove('is-instant');
    }

    clearTimeout(this.transitionTimer);
    if (animate) {
      var selfRef = this;
      this.transitionTimer = setTimeout(function () {
        selfRef.root.classList.remove('is-animating');
      }, this.runtime.transitionSpeed + 40);
    } else {
      this.root.classList.remove('is-animating');
    }
  };

  PremiumCoverflow.prototype._syncChrome = function () {
    var i;
    if (this.pagination && this.runtime.pagination) {
      var dots = this.pagination.querySelectorAll('[data-se-pcf-dot]');
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

  PremiumCoverflow.prototype._announce = function () {
    if (!this.liveRegion) return;
    var active = this.slides[this.index];
    if (!active) return;
    var titleEl = active.querySelector('.se-pcf-card__title');
    var title =
      (active.getAttribute('data-product-title') ||
        (titleEl && titleEl.textContent) ||
        'Product ' + (this.index + 1)).trim();
    this.liveRegion.textContent =
      title + ', slide ' + (this.index + 1) + ' of ' + this.slides.length;
  };

  PremiumCoverflow.prototype.goTo = function (index, options) {
    options = options || {};
    if (!this.slides.length) return;
    var next = this._wrapIndex(index);
    if (!this.runtime.loop) next = clamp(index, 0, this.slides.length - 1);
    this.index = next;
    this._render({ animate: options.animate !== false });
    if (options.announce !== false) this._announce();
    this._restartAutoplay();
  };

  PremiumCoverflow.prototype.next = function () {
    this.goTo(this.index + 1);
  };

  PremiumCoverflow.prototype.prev = function () {
    this.goTo(this.index - 1);
  };

  PremiumCoverflow.prototype._startAutoplay = function () {
    var self = this;
    this._stopAutoplay();
    if (!this.runtime.autoplay || this.slides.length < 2 || prefersReducedMotion()) return;
    if (document.hidden) return;
    this.autoplayTimer = setInterval(function () {
      self.next();
    }, Math.max(1800, this.runtime.autoplayDelay || 4200));
  };

  PremiumCoverflow.prototype._stopAutoplay = function () {
    if (this.autoplayTimer) {
      clearInterval(this.autoplayTimer);
      this.autoplayTimer = null;
    }
  };

  PremiumCoverflow.prototype._restartAutoplay = function () {
    if (this.runtime.autoplay) this._startAutoplay();
  };

  PremiumCoverflow.prototype.updateConfig = function (partial) {
    this.userConfig = mergeConfig(this.userConfig, partial || {});
    this.config = mergeConfig(
      DEFAULTS,
      mergeConfig(parseConfigFromElement(this.root), this.userConfig)
    );
    this.runtime = mergeConfig(this.config, getBreakpointOverrides(this.config));
    this._setTransitionSpeed();
    this._setPerspective();
    this._applyChrome();
    this._render({ animate: false });
    this._restartAutoplay();
  };

  PremiumCoverflow.prototype.refresh = function () {
    this._collectSlides();
    this._applyChrome();
    this.index = this._wrapIndex(this.index);
    this._render({ animate: false });
  };

  PremiumCoverflow.prototype.destroy = function () {
    if (this.destroyed) return;
    this.destroyed = true;
    this._stopAutoplay();
    clearTimeout(this.transitionTimer);

    if (this.prevBtn) this.prevBtn.removeEventListener('click', this.bound.onPrev);
    if (this.nextBtn) this.nextBtn.removeEventListener('click', this.bound.onNext);
    if (this.pagination) this.pagination.removeEventListener('click', this.bound.onPagination);
    this.track.removeEventListener('click', this.bound.onSlideClick);
    this.stage.removeEventListener('pointerdown', this.bound.onPointerDown);
    this.root.removeEventListener('keydown', this.bound.onKeyDown);
    global.removeEventListener('resize', this.bound.onResize);
    global.removeEventListener('pageshow', this.bound.onPageShow);
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
    this.root.classList.remove('is-ready', 'is-animating', 'is-dragging', 'is-instant');
    INSTANCES.delete(this.root);
  };

  function init(root, config) {
    if (!root) return null;
    injectStyles();
    ensureFonts();

    var existing = INSTANCES.get(root);
    if (existing) {
      existing.destroy();
    }

    var instance = new PremiumCoverflow(root, config);
    INSTANCES.set(root, instance);
    return instance;
  }

  function getInstance(root) {
    return INSTANCES.get(root) || null;
  }

  global.SEPremiumCoverflow = {
    defaults: DEFAULTS,
    injectStyles: injectStyles,
    ensureFonts: ensureFonts,
    init: init,
    getInstance: getInstance,
  };
})(typeof window !== 'undefined' ? window : this);
