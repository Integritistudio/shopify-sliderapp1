/**
 * SlideEase Premium 3D Circular
 * Self-contained IIFE — exposes window.SEPremiumCircular
 */
(function (global) {
  'use strict';

  var STYLE_ID = 'se-premium-circular-styles';
  var FONT_ID = 'se-premium-circular-fonts';
  var FONT_HREF =
    'https://fonts.googleapis.com/css2?family=Libre+Baskerville:wght@400;700&family=Outfit:wght@500;600;700&display=swap';

  var DEG = Math.PI / 180;

  var DEFAULTS = {
    arcCurvature: 18,
    depth: 420,
    rotation: 22,
    scale: 0.88,
    scaleStep: 0.06,
    spacing: 210,
    perspective: 1400,
    transitionDuration: 650,
    autoplay: false,
    autoplayDelay: 4500,
    navigation: true,
    pagination: true,
    loop: true,
    visibleSlides: 7,
    dragSensitivity: 1,
    swipeThreshold: 44,
    inertia: true,
    clickNeighborToCenter: true,
  };

  var INSTANCES = new WeakMap();
  var stylesInjected = false;
  var fontsLoaded = false;

  var CSS = [
    '/* SlideEase Premium Circular — scoped to .se-pcc */',
    '.se-pcc {',
    '  --pcc-bg-start: #eef1f5;',
    '  --pcc-bg-end: #dde3e9;',
    '  --pcc-surface: #ffffff;',
    '  --pcc-surface-alt: #f4f6f9;',
    '  --pcc-ink: #1f2933;',
    '  --pcc-ink-muted: #5b6875;',
    '  --pcc-ink-soft: #98a4b0;',
    '  --pcc-line: rgba(31, 41, 51, 0.09);',
    '  --pcc-accent: #4a6b8a;',
    '  --pcc-accent-soft: rgba(74, 107, 138, 0.12);',
    '  --pcc-shadow: 0 16px 38px rgba(31, 41, 51, 0.12);',
    '  --pcc-shadow-active: 0 30px 60px rgba(31, 41, 51, 0.22);',
    '  --pcc-radius: 4px;',
    '  --pcc-font-display: "Libre Baskerville", "Times New Roman", serif;',
    '  --pcc-font-body: "Outfit", "Helvetica Neue", Arial, sans-serif;',
    '  --pcc-transition: 650ms cubic-bezier(0.22, 1, 0.36, 1);',
    '  --pcc-card-width: min(38vw, 300px);',
    '  --pcc-perspective: 1400px;',
    '  --pcc-stage-pad-y: clamp(2.5rem, 6vw, 4.5rem);',
    '  --pcc-section-bg: radial-gradient(120% 80% at 50% 0%, rgba(255, 255, 255, 0.6) 0%, transparent 58%), linear-gradient(168deg, var(--pcc-bg-start) 0%, var(--pcc-bg-end) 100%);',
    '  position: relative;',
    '  isolation: isolate;',
    '  width: 100%;',
    '  max-width: 100%;',
    '  margin: 0 auto;',
    '  padding: clamp(2rem, 5vw, 4rem) 0 clamp(2.5rem, 6vw, 5rem);',
    '  font-family: var(--pcc-font-body);',
    '  color: var(--pcc-ink);',
    '  background: var(--pcc-section-bg);',
    '  overflow: hidden;',
    '  -webkit-font-smoothing: antialiased;',
    '  -moz-osx-font-smoothing: grayscale;',
    '}',
    '.se-pcc *,',
    '.se-pcc *::before,',
    '.se-pcc *::after {',
    '  box-sizing: border-box;',
    '}',
    '.se-pcc__inner {',
    '  width: min(100% - 2.5rem, 1320px);',
    '  margin-inline: auto;',
    '}',
    '.se-pcc__header {',
    '  text-align: center;',
    '  margin-bottom: clamp(1.75rem, 4vw, 3rem);',
    '}',
    '.se-pcc__eyebrow {',
    '  display: block;',
    '  margin: 0 0 0.7rem;',
    '  font-size: 0.6875rem;',
    '  font-weight: 600;',
    '  letter-spacing: 0.24em;',
    '  text-transform: uppercase;',
    '  color: var(--pcc-accent);',
    '}',
    '.se-pcc__heading {',
    '  margin: 0;',
    '  font-family: var(--pcc-font-display);',
    '  font-size: clamp(1.85rem, 4.2vw, 3rem);',
    '  font-weight: 400;',
    '  line-height: 1.18;',
    '  letter-spacing: -0.01em;',
    '  color: var(--pcc-ink);',
    '}',
    '.se-pcc__subheading {',
    '  margin: 0.9rem auto 0;',
    '  max-width: 34rem;',
    '  font-size: 0.9375rem;',
    '  font-weight: 500;',
    '  line-height: 1.65;',
    '  color: var(--pcc-ink-muted);',
    '}',
    '.se-pcc__stage {',
    '  position: relative;',
    '  width: 100%;',
    '  perspective: var(--pcc-perspective);',
    '  perspective-origin: 50% 42%;',
    '  touch-action: pan-y;',
    '  user-select: none;',
    '  -webkit-user-select: none;',
    '}',
    '.se-pcc__stage.is-dragging {',
    '  cursor: grabbing;',
    '}',
    '.se-pcc__stage:not(.is-dragging) {',
    '  cursor: grab;',
    '}',
    '.se-pcc.is-dragging .se-pcc__slide,',
    '.se-pcc.is-instant .se-pcc__slide {',
    '  transition: none;',
    '}',
    '.se-pcc__track {',
    '  position: relative;',
    '  display: flex;',
    '  align-items: center;',
    '  justify-content: center;',
    '  width: 100%;',
    '  min-height: calc(var(--pcc-card-width) * 1.6 + var(--pcc-stage-pad-y) * 2);',
    '  padding-block: var(--pcc-stage-pad-y);',
    '  margin: 0;',
    '  padding-inline: 0;',
    '  list-style: none;',
    '  transform-style: preserve-3d;',
    '  will-change: contents;',
    '}',
    '.se-pcc__slide {',
    '  position: absolute;',
    '  top: 50%;',
    '  left: 50%;',
    '  width: var(--pcc-card-width);',
    '  margin: 0;',
    '  padding: 0;',
    '  list-style: none;',
    '  transform-style: preserve-3d;',
    '  transform-origin: center center;',
    '  transition:',
    '    transform var(--pcc-transition),',
    '    opacity var(--pcc-transition),',
    '    filter var(--pcc-transition),',
    '    visibility var(--pcc-transition);',
    '  will-change: transform, opacity, filter;',
    '  backface-visibility: hidden;',
    '  -webkit-backface-visibility: hidden;',
    '}',
    '.se-pcc__slide.is-hidden {',
    '  visibility: hidden;',
    '  pointer-events: none;',
    '  opacity: 0;',
    '}',
    '.se-pcc__slide.is-active {',
    '  z-index: 10;',
    '}',
    '.se-pcc__slide:not(.is-active) {',
    '  z-index: 1;',
    '}',
    '.se-pcc__slide.is-active .se-pcc-card {',
    '  box-shadow: var(--pcc-shadow-active);',
    '}',
    '.se-pcc__slide:not(.is-active) .se-pcc-card {',
    '  box-shadow: var(--pcc-shadow);',
    '  filter: saturate(0.9) brightness(0.98);',
    '}',
    '.se-pcc__slide:not(.is-active) .se-pcc-card__body {',
    '  opacity: 0.74;',
    '}',
    '.se-pcc__slide.is-active .se-pcc-card__body {',
    '  opacity: 1;',
    '}',
    '.se-pcc.is-animating .se-pcc__slide {',
    '  pointer-events: none;',
    '}',
    '.se-pcc__slide.is-clickable:not(.is-active) {',
    '  cursor: pointer;',
    '}',
    '.se-pcc-card {',
    '  display: flex;',
    '  flex-direction: column;',
    '  width: 100%;',
    '  background: var(--pcc-surface);',
    '  border: 1px solid var(--pcc-line);',
    '  border-radius: var(--pcc-radius);',
    '  overflow: hidden;',
    '  transform: translateZ(0);',
    '  transition:',
    '    box-shadow var(--pcc-transition),',
    '    filter var(--pcc-transition);',
    '}',
    '.se-pcc-card__media {',
    '  position: relative;',
    '  width: 100%;',
    '  aspect-ratio: 4 / 5;',
    '  background: var(--pcc-surface-alt);',
    '  overflow: hidden;',
    '}',
    '.se-pcc-card__media::after {',
    '  content: "";',
    '  position: absolute;',
    '  inset: 0;',
    '  pointer-events: none;',
    '  background: linear-gradient(180deg, transparent 60%, rgba(31, 41, 51, 0.05) 100%);',
    '  opacity: 0;',
    '  transition: opacity var(--pcc-transition);',
    '}',
    '.se-pcc__slide.is-active .se-pcc-card__media::after {',
    '  opacity: 1;',
    '}',
    '.se-pcc-card__image {',
    '  display: block;',
    '  width: 100%;',
    '  height: 100%;',
    '  object-fit: cover;',
    '  object-position: center;',
    '  transform: scale(1.02);',
    '  transition: transform 900ms cubic-bezier(0.22, 1, 0.36, 1), opacity 0.25s ease;',
    '}',
    '.se-pcc__slide.is-active .se-pcc-card__image:not(.se-pcc-card__image--hover) {',
    '  transform: scale(1);',
    '}',
    '.se-pcc-card__image--hover,',
    '.se-pcc-card__media .se-product-card__img--hover {',
    '  position: absolute;',
    '  inset: 0;',
    '  opacity: 0;',
    '  pointer-events: none;',
    '  transform: scale(1);',
    '  z-index: 1;',
    '}',
    '@media (hover: hover) and (pointer: fine) {',
    '  .se-pcc-card--has-hover:hover .se-pcc-card__image--hover,',
    '  .se-pcc-card--has-hover:hover .se-product-card__img--hover,',
    '  .se-product-card--has-hover:hover .se-pcc-card__image--hover,',
    '  .se-product-card--has-hover:hover .se-product-card__img--hover {',
    '    opacity: 1;',
    '  }',
    '}',
    '.se-pcc-card__media .se-product-card__atc.se-product-card__quick-add {',
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
    '  font-family: var(--pcc-font-body);',
    '  font-size: var(--pcc-quick-add-size, 11px);',
    '  font-weight: 700;',
    '  line-height: 1;',
    '  color: #fff;',
    '  background: var(--pcc-quick-add-bg, #170f49);',
    '  opacity: 0;',
    '  pointer-events: none;',
    '  transition: opacity 180ms ease, transform 180ms ease, background-color 180ms ease;',
    '}',
    '.se-pcc-card__media .se-product-card__atc.se-product-card__quick-add .se-product-card__quick-add-icon,',
    '.se-pcc-card__media .se-product-card__atc.se-product-card__quick-add svg {',
    '  display: block;',
    '  width: var(--pcc-quick-add-size, 11px);',
    '  height: var(--pcc-quick-add-size, 11px);',
    '}',
    '@media (hover: hover) and (pointer: fine) {',
    '  .se-pcc-card--quick-add:hover .se-product-card__quick-add,',
    '  .se-product-card--quick-add:hover .se-product-card__quick-add {',
    '    opacity: 1;',
    '    pointer-events: auto;',
    '  }',
    '}',
    '.se-pcc__slide:not(.is-active) .se-pcc-card__media .se-product-card__quick-add {',
    '  pointer-events: none;',
    '}',
    '.se-pcc-card__badge,',
    '.se-pcc-card__media .se-product-card__badge {',
    '  position: absolute;',
    '  top: 0.85rem;',
    '  left: 0.85rem;',
    '  z-index: 2;',
    '  margin: 0;',
    '  padding: 0.35rem 0.6rem;',
    '  font-size: 0.625rem;',
    '  font-weight: 700;',
    '  letter-spacing: 0.12em;',
    '  text-transform: uppercase;',
    '  color: var(--pcc-surface);',
    '  background: var(--pcc-ink);',
    '  border-radius: 2px;',
    '}',
    '.se-pcc-card__badge--sale,',
    '.se-pcc-card__media .se-product-card__badge--sale {',
    '  background: var(--pcc-accent);',
    '}',
    '.se-pcc-card__body {',
    '  display: flex;',
    '  flex-direction: column;',
    '  gap: 0.55rem;',
    '  padding: 1.15rem 1.15rem 1.3rem;',
    '  transition: opacity var(--pcc-transition);',
    '  text-align: center;',
    '}',
    '.se-pcc-card__title {',
    '  margin: 0;',
    '  font-family: var(--pcc-font-display);',
    '  font-size: clamp(0.95rem, 1.9vw, 1.125rem);',
    '  font-weight: 400;',
    '  line-height: 1.35;',
    '  letter-spacing: 0;',
    '  color: var(--pcc-ink);',
    '}',
    '.se-pcc-card__title a {',
    '  color: inherit;',
    '  text-decoration: none;',
    '}',
    '.se-pcc-card__title a:hover,',
    '.se-pcc-card__title a:focus-visible {',
    '  text-decoration: underline;',
    '  text-underline-offset: 0.18em;',
    '}',
    '.se-pcc-card__price {',
    '  display: flex;',
    '  align-items: baseline;',
    '  justify-content: center;',
    '  gap: 0.5rem;',
    '  margin: 0;',
    '  font-size: 0.875rem;',
    '  font-weight: 600;',
    '  letter-spacing: 0.03em;',
    '  color: var(--pcc-ink);',
    '}',
    '.se-pcc-card__amount {',
    '  font-weight: 600;',
    '  color: var(--pcc-ink);',
    '}',
    '.se-pcc-card__compare {',
    '  font-weight: 500;',
    '  color: var(--pcc-ink-soft);',
    '  text-decoration: line-through;',
    '}',
    '.se-pcc-card__actions {',
    '  display: flex;',
    '  flex-direction: row;',
    '  flex-wrap: nowrap;',
    '  align-items: center;',
    '  justify-content: center;',
    '  gap: 0.45rem;',
    '  width: 100%;',
    '  margin-top: 0.35rem;',
    '}',
    '.se-pcc-card__cta,',
    '.se-pcc-card__body .se-product-card__atc:not(.se-product-card__quick-add) {',
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
    '  font-family: var(--pcc-font-body);',
    '  font-size: 0.6875rem;',
    '  font-weight: 700;',
    '  letter-spacing: 0.14em;',
    '  text-transform: uppercase;',
    '  text-decoration: none;',
    '  color: var(--pcc-cta-color, var(--pcc-surface));',
    '  background: var(--pcc-cta-bg, var(--pcc-ink));',
    '  border: 1px solid var(--pcc-cta-border, var(--pcc-ink));',
    '  border-radius: var(--pcc-cta-radius, 2px);',
    '  cursor: pointer;',
    '  white-space: nowrap;',
    '  transition:',
    '    background-color 220ms ease,',
    '    color 220ms ease,',
    '    border-color 220ms ease,',
    '    transform 220ms ease;',
    '}',
    '.se-pcc-card__body .se-product-card__atc:not(.se-product-card__quick-add) {',
    '  color: var(--pcc-atc-color, var(--pcc-cta-color, var(--pcc-surface)));',
    '  background: var(--pcc-atc-bg, var(--pcc-cta-bg, var(--pcc-ink)));',
    '  border-color: var(--pcc-atc-border, var(--pcc-cta-border, var(--pcc-ink)));',
    '}',
    '.se-pcc-card__cta:hover,',
    '.se-pcc-card__cta:focus-visible {',
    '  background: var(--pcc-cta-hover-bg, transparent);',
    '  color: var(--pcc-cta-hover-color, var(--pcc-ink));',
    '  border-color: var(--pcc-cta-border, var(--pcc-ink));',
    '  outline: none;',
    '}',
    '.se-pcc-card__body .se-product-card__atc:not(.se-product-card__quick-add):hover,',
    '.se-pcc-card__body .se-product-card__atc:not(.se-product-card__quick-add):focus-visible {',
    '  background: var(--pcc-atc-hover-bg, var(--pcc-cta-hover-bg, transparent));',
    '  color: var(--pcc-atc-hover-color, var(--pcc-cta-hover-color, var(--pcc-ink)));',
    '  border-color: var(--pcc-atc-border, var(--pcc-cta-border, var(--pcc-ink)));',
    '  outline: none;',
    '}',
    '.se-pcc-card__cta:focus-visible,',
    '.se-pcc-card__body .se-product-card__atc:not(.se-product-card__quick-add):focus-visible {',
    '  outline: 2px solid var(--pcc-accent);',
    '  outline-offset: 3px;',
    '}',
    '.se-pcc__slide:not(.is-active) .se-pcc-card__cta,',
    '.se-pcc__slide:not(.is-active) .se-pcc-card__body .se-product-card__atc:not(.se-product-card__quick-add) {',
    '  pointer-events: none;',
    '}',
    '.se-pcc__controls {',
    '  display: flex;',
    '  flex-direction: column;',
    '  align-items: center;',
    '  gap: 1.25rem;',
    '  margin-top: clamp(0.5rem, 2vw, 1.25rem);',
    '}',
    '.se-pcc__nav {',
    '  display: flex;',
    '  align-items: center;',
    '  justify-content: center;',
    '  gap: 0.75rem;',
    '}',
    '.se-pcc__arrow {',
    '  display: inline-flex;',
    '  align-items: center;',
    '  justify-content: center;',
    '  width: 2.75rem;',
    '  height: 2.75rem;',
    '  padding: 0;',
    '  color: var(--pcc-ink);',
    '  background: rgba(255, 255, 255, 0.75);',
    '  border: 1px solid var(--pcc-line);',
    '  border-radius: 50%;',
    '  cursor: pointer;',
    '  backdrop-filter: blur(8px);',
    '  transition:',
    '    background-color 200ms ease,',
    '    border-color 200ms ease,',
    '    transform 200ms ease,',
    '    opacity 200ms ease;',
    '}',
    '.se-pcc__arrow svg {',
    '  width: 1rem;',
    '  height: 1rem;',
    '  pointer-events: none;',
    '}',
    '.se-pcc__arrow:hover:not(:disabled),',
    '.se-pcc__arrow:focus-visible {',
    '  background: var(--pcc-surface);',
    '  border-color: rgba(31, 41, 51, 0.2);',
    '  outline: none;',
    '}',
    '.se-pcc__arrow:focus-visible {',
    '  outline: 2px solid var(--pcc-accent);',
    '  outline-offset: 3px;',
    '}',
    '.se-pcc__arrow:active:not(:disabled) {',
    '  transform: scale(0.96);',
    '}',
    '.se-pcc__arrow:disabled {',
    '  opacity: 0.35;',
    '  cursor: not-allowed;',
    '}',
    '.se-pcc__pagination {',
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
    '.se-pcc__dot {',
    '  width: 0.45rem;',
    '  height: 0.45rem;',
    '  padding: 0;',
    '  background: rgba(31, 41, 51, 0.22);',
    '  border: 0;',
    '  border-radius: 50%;',
    '  cursor: pointer;',
    '  transition:',
    '    background-color 220ms ease,',
    '    transform 220ms ease,',
    '    width 220ms ease;',
    '}',
    '.se-pcc__dot.is-active {',
    '  width: 1.35rem;',
    '  border-radius: 999px;',
    '  background: var(--pcc-ink);',
    '}',
    '.se-pcc__dot:hover:not(.is-active),',
    '.se-pcc__dot:focus-visible {',
    '  background: rgba(31, 41, 51, 0.45);',
    '  outline: none;',
    '}',
    '.se-pcc__dot:focus-visible {',
    '  outline: 2px solid var(--pcc-accent);',
    '  outline-offset: 3px;',
    '}',
    '.se-pcc__live {',
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
    '  .se-pcc {',
    '    --pcc-card-width: min(52vw, 280px);',
    '    --pcc-perspective: 1150px;',
    '  }',
    '}',
    '@media (max-width: 749px) {',
    '  .se-pcc {',
    '    --pcc-card-width: min(68vw, 260px);',
    '    --pcc-perspective: 900px;',
    '    padding-block: 1.75rem 2.5rem;',
    '  }',
    '  .se-pcc__inner {',
    '    width: min(100% - 1.25rem, 1320px);',
    '  }',
    '  .se-pcc__stage {',
    '    perspective-origin: 50% 48%;',
    '  }',
    '  .se-pcc-card__body {',
    '    padding: 0.95rem 0.9rem 1.1rem;',
    '  }',
    '  .se-pcc-card__actions {',
    '    gap: 0.35rem;',
    '  }',
    '  .se-pcc-card__cta,',
    '  .se-pcc-card__body .se-product-card__atc:not(.se-product-card__quick-add) {',
    '    flex: 0 0 auto;',
    '    width: auto;',
    '    padding: 0.55rem 1rem;',
    '    font-size: 0.625rem;',
    '    letter-spacing: 0.1em;',
    '  }',
    '}',
    '@media (prefers-reduced-motion: reduce) {',
    '  .se-pcc {',
    '    --pcc-transition: 1ms linear;',
    '  }',
    '  .se-pcc__slide,',
    '  .se-pcc-card,',
    '  .se-pcc-card__image,',
    '  .se-pcc-card__body,',
    '  .se-pcc-card__media::after,',
    '  .se-pcc-card__cta,',
    '  .se-pcc-card__body .se-product-card__atc,',
    '  .se-pcc__arrow,',
    '  .se-pcc__dot {',
    '    transition: none !important;',
    '  }',
    '}',
    '.se-pcc:not(.is-ready) .se-pcc__stage {',
    '  min-height: calc(var(--pcc-card-width) * 1.6 + var(--pcc-stage-pad-y) * 2);',
    '  opacity: 0;',
    '  visibility: hidden;',
    '  pointer-events: none;',
    '}',
    '.se-pcc:not(.is-ready) .se-pcc__controls {',
    '  opacity: 0;',
    '  visibility: hidden;',
    '  pointer-events: none;',
    '}',
    '.se-pcc.is-ready .se-pcc__stage,',
    '.se-pcc.is-ready .se-pcc__controls {',
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

  // Accepts the coverflow-era key names so shared settings payloads keep working
  function normalizeConfig(config) {
    if (!config) return {};
    var out = mergeConfig(config, null);
    if (out.transitionDuration === undefined && out.transitionSpeed !== undefined) {
      out.transitionDuration = out.transitionSpeed;
    }
    if (out.spacing === undefined && out.slideSpacing !== undefined) {
      out.spacing = out.slideSpacing;
    }
    return out;
  }

  function parseConfigFromElement(el) {
    var raw = el.getAttribute('data-se-pcc-config');
    if (!raw) return {};
    try {
      return normalizeConfig(JSON.parse(raw));
    } catch (err) {
      console.warn('[SEPremiumCircular] Invalid data-se-pcc-config JSON', err);
      return {};
    }
  }

  function getBreakpointOverrides(config) {
    var width = global.innerWidth || document.documentElement.clientWidth;
    if (width <= 749) {
      return {
        spacing: Math.min(config.spacing, 132),
        depth: Math.min(config.depth, 230),
        rotation: Math.min(config.rotation, 16),
        arcCurvature: Math.min(config.arcCurvature, 14),
        perspective: Math.min(config.perspective, 900),
        visibleSlides: Math.min(config.visibleSlides, 3),
        scale: Math.max(config.scale, 0.9),
      };
    }
    if (width <= 989) {
      return {
        spacing: Math.min(config.spacing, 168),
        depth: Math.min(config.depth, 320),
        arcCurvature: Math.min(config.arcCurvature, 16),
        perspective: Math.min(config.perspective, 1150),
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

  function PremiumCircular(root, userConfig) {
    this.root = root;
    this.userConfig = normalizeConfig(userConfig);
    this.config = mergeConfig(
      DEFAULTS,
      mergeConfig(parseConfigFromElement(root), this.userConfig)
    );
    this.runtime = mergeConfig(this.config, getBreakpointOverrides(this.config));

    this.stage = root.querySelector('[data-se-pcc-stage]');
    this.track = root.querySelector('[data-se-pcc-track]');
    this.liveRegion = root.querySelector('[data-se-pcc-live]');
    this.prevBtn = root.querySelector('[data-se-pcc-prev]');
    this.nextBtn = root.querySelector('[data-se-pcc-next]');
    this.pagination = root.querySelector('[data-se-pcc-pagination]');
    this.nav = root.querySelector('[data-se-pcc-nav]');

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
      console.warn('[SEPremiumCircular] Missing stage/track elements');
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
    // Reveal only after arc transforms are painted — avoids FOUC / back-nav flash
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

  PremiumCircular.prototype._duration = function () {
    var value = Number(this.runtime.transitionDuration);
    return Number.isFinite(value) && value > 0 ? value : DEFAULTS.transitionDuration;
  };

  PremiumCircular.prototype._initialIndex = function () {
    var marked = this.slides.findIndex(function (slide) {
      return slide.classList.contains('is-active') || slide.getAttribute('aria-current') === 'true';
    });
    return marked >= 0 ? marked : 0;
  };

  PremiumCircular.prototype._collectSlides = function () {
    this.slides = Array.prototype.slice.call(
      this.track.querySelectorAll('[data-se-pcc-slide]')
    );
    this.slides.forEach(function (slide, i) {
      slide.setAttribute('role', 'group');
      slide.setAttribute('aria-roledescription', 'slide');
      slide.setAttribute('aria-label', i + 1 + ' of ' + this.slides.length);
      slide.dataset.index = String(i);
    }, this);
  };

  PremiumCircular.prototype._applyChrome = function () {
    if (this.nav) {
      this.nav.hidden = !this.runtime.navigation || this.slides.length < 2;
    }
    if (this.pagination) {
      this.pagination.hidden = !this.runtime.pagination || this.slides.length < 2;
      if (this.runtime.pagination) this._buildPagination();
    }
  };

  PremiumCircular.prototype._buildPagination = function () {
    var self = this;
    this.pagination.innerHTML = '';
    this.slides.forEach(function (_, i) {
      var li = document.createElement('li');
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'se-pcc__dot';
      btn.setAttribute('data-se-pcc-dot', String(i));
      btn.setAttribute('aria-label', 'Go to product ' + (i + 1));
      if (i === self.index) {
        btn.classList.add('is-active');
        btn.setAttribute('aria-current', 'true');
      }
      li.appendChild(btn);
      self.pagination.appendChild(li);
    });
  };

  PremiumCircular.prototype._setTransitionSpeed = function () {
    var speed = prefersReducedMotion() ? 1 : this._duration();
    this.root.style.setProperty('--pcc-transition', speed + 'ms cubic-bezier(0.22, 1, 0.36, 1)');
  };

  PremiumCircular.prototype._setPerspective = function () {
    this.root.style.setProperty('--pcc-perspective', this.runtime.perspective + 'px');
    if (this.stage) {
      this.stage.style.perspective = this.runtime.perspective + 'px';
    }
  };

  PremiumCircular.prototype._bind = function () {
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
      var btn = e.target.closest('[data-se-pcc-dot]');
      if (!btn || !self.pagination.contains(btn)) return;
      var i = Number(btn.getAttribute('data-se-pcc-dot'));
      if (!Number.isNaN(i)) self.goTo(i);
    };
    this.bound.onSlideClick = function (e) {
      if (!self.runtime.clickNeighborToCenter) return;
      if (Math.abs(self.dragDelta) > 8) return;
      var slide = e.target.closest('[data-se-pcc-slide]');
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

  PremiumCircular.prototype._onResize = function () {
    this.runtime = mergeConfig(this.config, getBreakpointOverrides(this.config));
    this._setTransitionSpeed();
    this._setPerspective();
    this._applyChrome();
    this._render({ animate: false });
  };

  PremiumCircular.prototype._onPointerDown = function (e) {
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

  PremiumCircular.prototype._onPointerMove = function (e) {
    if (!this.isDragging) return;
    this.dragDelta = (e.clientX - this.dragStartX) * (this.runtime.dragSensitivity || 1);
    if (!prefersReducedMotion()) {
      this._renderDragPreview(this.dragDelta);
    }
  };

  PremiumCircular.prototype._onPointerUp = function () {
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
    var threshold = this.runtime.swipeThreshold || 44;
    var spacing = this.runtime.spacing || DEFAULTS.spacing;
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

  PremiumCircular.prototype._wrapIndex = function (i) {
    var len = this.slides.length;
    if (!len) return 0;
    if (this.runtime.loop) {
      return ((i % len) + len) % len;
    }
    return clamp(i, 0, len - 1);
  };

  PremiumCircular.prototype._offsetForIndex = function (slideIndex, activeIndex) {
    var len = this.slides.length;
    if (!this.runtime.loop) return slideIndex - activeIndex;

    var half = Math.floor(len / 2);
    var offset = slideIndex - activeIndex;
    if (offset > half) offset -= len;
    if (offset < -half) offset += len;
    return offset;
  };

  PremiumCircular.prototype._sideCount = function () {
    var visible = Math.max(1, this.runtime.visibleSlides || DEFAULTS.visibleSlides);
    return Math.max(1, Math.floor((visible - 1) / 2));
  };

  /**
   * Position cards on a subtle horizontal circle/arc (original CircularCarousel math).
   */
  PremiumCircular.prototype._transformForOffset = function (offset, dragProgress) {
    var cfg = this.runtime;
    var t = offset - (dragProgress || 0);
    var abs = Math.abs(t);
    var dir = t === 0 ? 0 : t > 0 ? 1 : -1;

    var angleDeg = t * cfg.arcCurvature;
    var angleRad = (angleDeg * Math.PI) / 180;
    var radius = cfg.depth;

    var arcX = Math.sin(angleRad) * radius;
    var arcZ = (Math.cos(angleRad) - 1) * radius;

    var linearX = t * cfg.spacing;
    var blend = 0.55;
    var x = linearX * (1 - blend) + arcX * blend;
    var z = arcZ;

    var rotCap = cfg.rotation;
    var rotateY =
      -dir * Math.min(abs * rotCap, rotCap + Math.max(0, abs - 1) * (rotCap * 0.35));
    rotateY = rotateY * 0.55 + -angleDeg * 0.45;

    var scale = 1;
    if (abs < 1) {
      scale = 1 - (1 - cfg.scale) * abs;
    } else {
      scale = Math.max(cfg.scale - cfg.scaleStep * (abs - 1), 0.62);
    }

    var side = this._sideCount();
    var opacity = 1;
    if (abs > side) opacity = 0;
    else if (abs > side - 0.35) opacity = 1 - (abs - (side - 0.35)) / 0.7;

    return {
      x: x,
      z: z,
      rotateY: rotateY,
      scale: scale,
      opacity: Math.min(1, Math.max(0, opacity)),
    };
  };

  PremiumCircular.prototype._applySlideTransform = function (slide, transform) {
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

  PremiumCircular.prototype._updateImageLoading = function (slide, offsetAbs) {
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

  PremiumCircular.prototype._renderDragPreview = function (deltaX) {
    var progress = deltaX / (this.runtime.spacing || DEFAULTS.spacing);
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

  PremiumCircular.prototype._render = function (options) {
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
      }, this._duration() + 40);
    } else {
      this.root.classList.remove('is-animating');
    }
  };

  PremiumCircular.prototype._syncChrome = function () {
    var i;
    if (this.pagination && this.runtime.pagination) {
      var dots = this.pagination.querySelectorAll('[data-se-pcc-dot]');
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

  PremiumCircular.prototype._announce = function () {
    if (!this.liveRegion) return;
    var active = this.slides[this.index];
    if (!active) return;
    var titleEl = active.querySelector('.se-pcc-card__title');
    var title =
      (active.getAttribute('data-product-title') ||
        (titleEl && titleEl.textContent) ||
        'Product ' + (this.index + 1)).trim();
    this.liveRegion.textContent =
      title + ', slide ' + (this.index + 1) + ' of ' + this.slides.length;
  };

  PremiumCircular.prototype.goTo = function (index, options) {
    options = options || {};
    if (!this.slides.length) return;
    var next = this._wrapIndex(index);
    if (!this.runtime.loop) next = clamp(index, 0, this.slides.length - 1);
    this.index = next;
    this._render({ animate: options.animate !== false });
    if (options.announce !== false) this._announce();
    this._restartAutoplay();
  };

  PremiumCircular.prototype.next = function () {
    this.goTo(this.index + 1);
  };

  PremiumCircular.prototype.prev = function () {
    this.goTo(this.index - 1);
  };

  PremiumCircular.prototype._startAutoplay = function () {
    var self = this;
    this._stopAutoplay();
    if (!this.runtime.autoplay || this.slides.length < 2 || prefersReducedMotion()) return;
    if (document.hidden) return;
    this.autoplayTimer = setInterval(function () {
      self.next();
    }, Math.max(1800, this.runtime.autoplayDelay || DEFAULTS.autoplayDelay));
  };

  PremiumCircular.prototype._stopAutoplay = function () {
    if (this.autoplayTimer) {
      clearInterval(this.autoplayTimer);
      this.autoplayTimer = null;
    }
  };

  PremiumCircular.prototype._restartAutoplay = function () {
    if (this.runtime.autoplay) this._startAutoplay();
  };

  PremiumCircular.prototype.updateConfig = function (partial) {
    this.userConfig = mergeConfig(this.userConfig, normalizeConfig(partial));
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

  PremiumCircular.prototype.refresh = function () {
    this._collectSlides();
    this._applyChrome();
    this.index = this._wrapIndex(this.index);
    this._render({ animate: false });
  };

  PremiumCircular.prototype.destroy = function () {
    if (this.destroyed) return;
    this.destroyed = true;
    this._stopAutoplay();
    clearTimeout(this.transitionTimer);

    if (this.prevBtn) this.prevBtn.removeEventListener('click', this.bound.onPrev);
    if (this.nextBtn) this.nextBtn.removeEventListener('click', this.bound.onNext);
    if (this.pagination) this.pagination.removeEventListener('click', this.bound.onPagination);
    if (this.track) this.track.removeEventListener('click', this.bound.onSlideClick);
    if (this.stage) this.stage.removeEventListener('pointerdown', this.bound.onPointerDown);
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

    var instance = new PremiumCircular(root, config);
    INSTANCES.set(root, instance);
    return instance;
  }

  function getInstance(root) {
    return INSTANCES.get(root) || null;
  }

  global.SEPremiumCircular = {
    defaults: DEFAULTS,
    injectStyles: injectStyles,
    ensureFonts: ensureFonts,
    init: init,
    getInstance: getInstance,
  };
})(typeof window !== 'undefined' ? window : this);
