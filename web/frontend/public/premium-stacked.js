/**
 * SlideEase Premium Stacked Cards
 * Self-contained IIFE — exposes window.SEPremiumStacked
 * Compatibility alias: window.StackedCarousel
 */
(function (global) {
  'use strict';

  var STYLE_ID = 'se-premium-stacked-styles';
  var FONT_ID = 'se-premium-stacked-fonts';
  var FONT_HREF =
    'https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600&family=Sora:wght@500;600;700&display=swap';

  var CSS = [
    '/**',
    ' * 3D Stacked Cards Product Carousel',
    ' * Premium Shopify-ready styles — HTML / CSS / JS only',
    ' */',
    '',
    '.stacked-carousel {',
    '  --sc-bg-a: #efece7;',
    '  --sc-bg-b: #ddd8d0;',
    '  --sc-surface: #faf8f5;',
    '  --sc-ink: #1c1a17;',
    '  --sc-ink-muted: #6a645c;',
    '  --sc-ink-soft: #9a9288;',
    '  --sc-line: rgba(28, 26, 23, 0.08);',
    '  --sc-accent: #3d5a4c;',
    '  --sc-shadow: 0 14px 32px rgba(28, 26, 23, 0.12);',
    '  --sc-shadow-active: 0 28px 56px rgba(28, 26, 23, 0.2);',
    '  --sc-radius: 4px;',
    '  --sc-font-display: "Fraunces", "Times New Roman", serif;',
    '  --sc-font-body: "Sora", "Helvetica Neue", sans-serif;',
    '  --sc-transition: 680ms cubic-bezier(0.34, 1.3, 0.64, 1);',
    '  --sc-card-width: min(78vw, 360px);',
    '  --sc-perspective: 1200px;',
    '  --sc-stage-min-h: calc(var(--sc-card-width) * 1.55 + 5rem);',
    '',
    '  position: relative;',
    '  isolation: isolate;',
    '  width: 100vw;',
    '  max-width: 100vw;',
    '  margin-left: calc(50% - 50vw);',
    '  margin-right: calc(50% - 50vw);',
    '  padding: clamp(2rem, 5vw, 4rem) 0 clamp(2.25rem, 5vw, 4rem);',
    '  font-family: var(--sc-font-body);',
    '  color: var(--sc-ink);',
    '  --sc-section-bg: radial-gradient(95% 75% at 50% 10%, rgba(255, 255, 255, 0.55) 0%, transparent 55%), linear-gradient(165deg, var(--sc-bg-a) 0%, var(--sc-bg-b) 100%);',
    '  background: var(--sc-section-bg);',
    '  overflow: hidden;',
    '  -webkit-font-smoothing: antialiased;',
    '  -moz-osx-font-smoothing: grayscale;',
    '}',
    '',
    '.stacked-carousel *,',
    '.stacked-carousel *::before,',
    '.stacked-carousel *::after {',
    '  box-sizing: border-box;',
    '}',
    '',
    '.stacked-carousel__inner {',
    '  width: min(100% - 2.5rem, 1100px);',
    '  margin-inline: auto;',
    '}',
    '',
    '/* Header */',
    '.stacked-carousel__header {',
    '  text-align: center;',
    '  margin-bottom: clamp(1.5rem, 4vw, 2.75rem);',
    '}',
    '',
    '.stacked-carousel__eyebrow {',
    '  display: block;',
    '  margin: 0 0 0.55rem;',
    '  font-size: 0.6875rem;',
    '  font-weight: 600;',
    '  letter-spacing: 0.22em;',
    '  text-transform: uppercase;',
    '  color: var(--sc-accent);',
    '}',
    '',
    '.stacked-carousel__heading {',
    '  margin: 0;',
    '  font-family: var(--sc-font-display);',
    '  font-size: clamp(2rem, 4.5vw, 3.25rem);',
    '  font-weight: 500;',
    '  line-height: 1.1;',
    '  letter-spacing: -0.02em;',
    '  color: var(--sc-ink);',
    '}',
    '',
    '.stacked-carousel__subheading {',
    '  margin: 0.75rem auto 0;',
    '  max-width: 28rem;',
    '  font-size: 0.9rem;',
    '  line-height: 1.6;',
    '  color: var(--sc-ink-muted);',
    '}',
    '',
    '/* Stage */',
    '.stacked-carousel__stage {',
    '  position: relative;',
    '  width: 100%;',
    '  min-height: var(--sc-stage-min-h);',
    '  perspective: var(--sc-perspective);',
    '  perspective-origin: 50% 40%;',
    '  touch-action: pan-y;',
    '  overscroll-behavior-x: none;',
    '  user-select: none;',
    '  -webkit-user-select: none;',
    '  cursor: grab;',
    '}',
    '',
    '.stacked-carousel__stage.is-dragging {',
    '  cursor: grabbing;',
    '}',
    '',
    '.stacked-carousel.is-dragging .stacked-carousel__slide,',
    '.stacked-carousel.is-instant .stacked-carousel__slide {',
    '  transition: none;',
    '}',
    '',
    '.stacked-carousel__track {',
    '  position: relative;',
    '  width: 100%;',
    '  min-height: var(--sc-stage-min-h);',
    '  transform-style: preserve-3d;',
    '}',
    '',
    '/* Slides */',
    '.stacked-carousel__slide {',
    '  position: absolute;',
    '  top: 50%;',
    '  left: 50%;',
    '  width: var(--sc-card-width);',
    '  margin: 0;',
    '  padding: 0;',
    '  list-style: none;',
    '  transform-style: preserve-3d;',
    '  transform-origin: center center;',
    '  transition:',
    '    transform var(--sc-transition),',
    '    opacity var(--sc-transition),',
    '    filter var(--sc-transition),',
    '    visibility var(--sc-transition);',
    '  will-change: transform, opacity;',
    '  backface-visibility: hidden;',
    '  -webkit-backface-visibility: hidden;',
    '}',
    '',
    '.stacked-carousel__slide.is-hidden {',
    '  visibility: hidden;',
    '  pointer-events: none;',
    '  opacity: 0;',
    '}',
    '',
    '.stacked-carousel__slide.is-active {',
    '  z-index: 30;',
    '  pointer-events: auto;',
    '}',
    '',
    '.stacked-carousel__slide.is-exiting {',
    '  z-index: 40;',
    '  pointer-events: none;',
    '}',
    '',
    '.stacked-carousel.is-animating .stacked-carousel__slide:not(.is-exiting) {',
    '  pointer-events: none;',
    '}',
    '',
    '.stacked-carousel__slide.is-active .stacked-card {',
    '  box-shadow: var(--sc-shadow-active);',
    '}',
    '',
    '.stacked-carousel__slide:not(.is-active) .stacked-card {',
    '  box-shadow: var(--sc-shadow);',
    '}',
    '',
    '/* Card */',
    '.stacked-card {',
    '  display: flex;',
    '  flex-direction: column;',
    '  width: 100%;',
    '  background: var(--sc-surface);',
    '  border: 1px solid var(--sc-line);',
    '  border-radius: var(--sc-radius);',
    '  overflow: hidden;',
    '  transform: translateZ(0);',
    '}',
    '',
    '.stacked-card__media {',
    '  position: relative;',
    '  width: 100%;',
    '  aspect-ratio: 4 / 5;',
    '  background: #e4dfd7;',
    '  overflow: hidden;',
    '}',
    '',
    '.stacked-card__image {',
    '  display: block;',
    '  width: 100%;',
    '  height: 100%;',
    '  object-fit: cover;',
    '  object-position: center;',
    '  transform: scale(1.02);',
    '  transition: transform 900ms cubic-bezier(0.22, 1, 0.36, 1), opacity 0.25s ease;',
    '}',
    '',
    '.stacked-carousel__slide.is-active .stacked-card__image:not(.stacked-card__image--hover) {',
    '  transform: scale(1);',
    '}',
    '',
    '.stacked-card__image--hover,',
    '.stacked-card__media .se-product-card__img--hover {',
    '  position: absolute;',
    '  inset: 0;',
    '  opacity: 0;',
    '  pointer-events: none;',
    '  transform: scale(1);',
    '  z-index: 1;',
    '}',
    '',
    '@media (hover: hover) and (pointer: fine) {',
    '  .stacked-carousel__slide.is-active .stacked-card--has-hover:hover .stacked-card__image--hover,',
    '  .stacked-carousel__slide.is-active .stacked-card--has-hover:hover .se-product-card__img--hover,',
    '  .stacked-carousel__slide.is-active .se-product-card--has-hover:hover .stacked-card__image--hover,',
    '  .stacked-carousel__slide.is-active .se-product-card--has-hover:hover .se-product-card__img--hover {',
    '    opacity: 1;',
    '  }',
    '}',
    '',
    '.stacked-card__badge {',
    '  position: absolute;',
    '  top: 0.85rem;',
    '  left: 0.85rem;',
    '  z-index: 2;',
    '  margin: 0;',
    '  padding: var(--sc-sales-badge-pad, 8px);',
    '  font-size: 0.625rem;',
    '  font-weight: 700;',
    '  letter-spacing: 0.14em;',
    '  text-transform: uppercase;',
    '  color: var(--sc-surface);',
    '  background: var(--sc-sales-badge-bg, #170f49);',
    '  border-radius: 1px;',
    '}',
    '',
    '.stacked-card__badge--sale {',
    '  background: var(--sc-sales-badge-bg, #170f49);',
    '}',
    '',
    '.stacked-card__media .se-product-card__atc.se-product-card__quick-add {',
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
    '  font-family: var(--sc-font-body);',
    '  font-size: var(--sc-quick-add-size, 11px);',
    '  font-weight: 700;',
    '  line-height: 1;',
    '  color: #fff;',
    '  background: var(--sc-quick-add-bg, #170f49);',
    '  opacity: 0;',
    '  pointer-events: none;',
    '  cursor: pointer;',
    '  transition: opacity 180ms ease, transform 180ms ease, background-color 180ms ease;',
    '}',
    '',
    '.stacked-card__media .se-product-card__atc.se-product-card__quick-add .se-product-card__quick-add-icon,',
    '.stacked-card__media .se-product-card__atc.se-product-card__quick-add svg {',
    '  display: block;',
    '  width: var(--sc-quick-add-size, 11px);',
    '  height: var(--sc-quick-add-size, 11px);',
    '}',
    '',
    '@media (hover: hover) and (pointer: fine) {',
    '  .stacked-carousel__slide.is-active .stacked-card--quick-add:hover .se-product-card__quick-add,',
    '  .stacked-carousel__slide.is-active .se-product-card--quick-add:hover .se-product-card__quick-add {',
    '    opacity: 1;',
    '    pointer-events: auto;',
    '  }',
    '}',
    '',
    '@media (hover: none), (pointer: coarse) {',
    '  .stacked-carousel__slide.is-active .stacked-card__media .se-product-card__quick-add {',
    '    opacity: 1;',
    '    pointer-events: auto;',
    '  }',
    '}',
    '',
    '.stacked-carousel__slide:not(.is-active) .stacked-card__media .se-product-card__quick-add {',
    '  opacity: 0;',
    '  pointer-events: none;',
    '}',
    '',
    '.stacked-card__body {',
    '  display: flex;',
    '  flex-direction: column;',
    '  gap: 0.5rem;',
    '  padding: 1.15rem 1.2rem 1.3rem;',
    '  text-align: center;',
    '}',
    '',
    '.stacked-card__title {',
    '  margin: 0;',
    '  font-family: var(--sc-font-display);',
    '  font-size: clamp(1.2rem, 2.4vw, 1.5rem);',
    '  font-weight: 500;',
    '  line-height: 1.25;',
    '  color: var(--sc-ink);',
    '}',
    '',
    '.stacked-card__title a {',
    '  color: inherit;',
    '  text-decoration: none;',
    '}',
    '',
    '.stacked-card__title a:hover,',
    '.stacked-card__title a:focus-visible {',
    '  text-decoration: underline;',
    '  text-underline-offset: 0.16em;',
    '}',
    '',
    '.stacked-card__price {',
    '  display: flex;',
    '  align-items: baseline;',
    '  justify-content: center;',
    '  gap: 0.45rem;',
    '  margin: 0;',
    '  font-size: 0.8125rem;',
    '  font-weight: 600;',
    '  letter-spacing: 0.03em;',
    '  color: var(--sc-ink);',
    '}',
    '',
    '.stacked-card__compare {',
    '  font-weight: 500;',
    '  color: var(--sc-ink-soft);',
    '  text-decoration: line-through;',
    '}',
    '',
    '.stacked-card__actions {',
    '  display: flex;',
    '  flex-wrap: wrap;',
    '  align-items: center;',
    '  justify-content: center;',
    '  gap: 0.45rem;',
    '  margin-top: 0.35rem;',
    '}',
    '',
    '.stacked-card__body .se-product-card__atc:not(.se-product-card__quick-add) {',
    '  display: inline-flex;',
    '  align-items: center;',
    '  justify-content: center;',
    '  min-height: 2.5rem;',
    '  padding: 0.65rem 1.4rem;',
    '  font-family: var(--sc-font-body);',
    '  font-size: 0.6875rem;',
    '  font-weight: 700;',
    '  letter-spacing: 0.14em;',
    '  text-transform: uppercase;',
    '  text-decoration: none;',
    '  color: var(--sc-surface);',
    '  background: var(--sc-ink);',
    '  border: 1px solid var(--sc-ink);',
    '  border-radius: 1px;',
    '  cursor: pointer;',
    '  transition:',
    '    background-color 200ms ease,',
    '    color 200ms ease;',
    '}',
    '',
    '.stacked-card__body .se-product-card__atc:not(.se-product-card__quick-add):hover,',
    '.stacked-card__body .se-product-card__atc:not(.se-product-card__quick-add):focus-visible {',
    '  background: transparent;',
    '  color: var(--sc-ink);',
    '  outline: none;',
    '}',
    '',
    '.stacked-card__body .se-product-card__atc--soldout,',
    '.stacked-card__body .se-product-card__atc--soldout:disabled {',
    '  background: #ebe7e1;',
    '  color: #8a837a;',
    '  border-color: #ebe7e1;',
    '  cursor: not-allowed;',
    '}',
    '',
    '.stacked-card__cta {',
    '  display: inline-flex;',
    '  align-items: center;',
    '  justify-content: center;',
    '  align-self: center;',
    '  margin-top: 0;',
    '  min-height: 2.5rem;',
    '  padding: 0.65rem 1.4rem;',
    '  font-family: var(--sc-font-body);',
    '  font-size: 0.6875rem;',
    '  font-weight: 700;',
    '  letter-spacing: 0.14em;',
    '  text-transform: uppercase;',
    '  text-decoration: none;',
    '  color: var(--sc-surface);',
    '  background: var(--sc-ink);',
    '  border: 1px solid var(--sc-ink);',
    '  border-radius: 1px;',
    '  cursor: pointer;',
    '  transition:',
    '    background-color 200ms ease,',
    '    color 200ms ease;',
    '}',
    '',
    '.stacked-card__cta:hover,',
    '.stacked-card__cta:focus-visible {',
    '  background: transparent;',
    '  color: var(--sc-ink);',
    '  outline: none;',
    '}',
    '',
    '.stacked-card__cta:focus-visible {',
    '  outline: 2px solid var(--sc-accent);',
    '  outline-offset: 3px;',
    '}',
    '',
    '.stacked-carousel__slide:not(.is-active) .stacked-card__cta,',
    '.stacked-carousel__slide:not(.is-active) .stacked-card__title a,',
    '.stacked-carousel__slide:not(.is-active) .stacked-card__body .se-product-card__atc:not(.se-product-card__quick-add) {',
    '  pointer-events: none;',
    '}',
    '',
    '/* Hint: only front card content fully emphasized */',
    '.stacked-carousel__slide:not(.is-active) .stacked-card__body {',
    '  opacity: 0.92;',
    '}',
    '',
    '/* Controls */',
    '.stacked-carousel__controls {',
    '  display: flex;',
    '  flex-direction: column;',
    '  align-items: center;',
    '  gap: 1.15rem;',
    '  margin-top: clamp(0.5rem, 2vw, 1.25rem);',
    '}',
    '',
    '.stacked-carousel__nav {',
    '  display: flex;',
    '  align-items: center;',
    '  justify-content: center;',
    '  gap: 0.7rem;',
    '}',
    '',
    '.stacked-carousel__arrow {',
    '  display: inline-flex;',
    '  align-items: center;',
    '  justify-content: center;',
    '  width: 2.7rem;',
    '  height: 2.7rem;',
    '  padding: 0;',
    '  color: var(--sc-ink);',
    '  background: rgba(250, 248, 245, 0.8);',
    '  border: 1px solid var(--sc-line);',
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
    '.stacked-carousel__arrow svg {',
    '  width: 0.95rem;',
    '  height: 0.95rem;',
    '  pointer-events: none;',
    '}',
    '',
    '.stacked-carousel__arrow:hover:not(:disabled),',
    '.stacked-carousel__arrow:focus-visible {',
    '  background: var(--sc-surface);',
    '  border-color: rgba(28, 26, 23, 0.2);',
    '  outline: none;',
    '}',
    '',
    '.stacked-carousel__arrow:focus-visible {',
    '  outline: 2px solid var(--sc-accent);',
    '  outline-offset: 3px;',
    '}',
    '',
    '.stacked-carousel__arrow:active:not(:disabled) {',
    '  transform: scale(0.96);',
    '}',
    '',
    '.stacked-carousel__arrow:disabled {',
    '  opacity: 0.35;',
    '  cursor: not-allowed;',
    '}',
    '',
    '.stacked-carousel__pagination {',
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
    '.stacked-carousel__dot {',
    '  width: 0.4rem;',
    '  height: 0.4rem;',
    '  padding: 0;',
    '  background: rgba(28, 26, 23, 0.2);',
    '  border: 0;',
    '  border-radius: 50%;',
    '  cursor: pointer;',
    '  transition:',
    '    background-color 200ms ease,',
    '    width 200ms ease;',
    '}',
    '',
    '.stacked-carousel__dot.is-active {',
    '  width: 1.25rem;',
    '  border-radius: 999px;',
    '  background: var(--sc-ink);',
    '}',
    '',
    '.stacked-carousel__dot:hover:not(.is-active),',
    '.stacked-carousel__dot:focus-visible {',
    '  background: rgba(28, 26, 23, 0.42);',
    '  outline: none;',
    '}',
    '',
    '.stacked-carousel__dot:focus-visible {',
    '  outline: 2px solid var(--sc-accent);',
    '  outline-offset: 3px;',
    '}',
    '',
    '.stacked-carousel__live {',
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
    '/* Responsive */',
    '@media (max-width: 989px) {',
    '  .stacked-carousel {',
    '    --sc-card-width: min(72vw, 340px);',
    '  }',
    '}',
    '',
    '@media (max-width: 749px) {',
    '  .stacked-carousel {',
    '    --sc-card-width: min(84vw, 320px);',
    '    padding-block: 1.6rem 2.25rem;',
    '  }',
    '',
    '  .stacked-carousel__inner {',
    '    width: min(100% - 1.15rem, 1100px);',
    '  }',
    '',
    '  .stacked-card__cta {',
    '    width: 100%;',
    '  }',
    '}',
    '',
    '@media (max-width: 479px) {',
    '  .stacked-carousel {',
    '    --sc-card-width: min(88vw, 300px);',
    '  }',
    '}',
    '',
    '@media (prefers-reduced-motion: reduce) {',
    '  .stacked-carousel {',
    '    --sc-transition: 1ms linear;',
    '  }',
    '',
    '  .stacked-carousel__slide,',
    '  .stacked-card__image,',
    '  .stacked-card__cta,',
    '  .stacked-carousel__arrow,',
    '  .stacked-carousel__dot {',
    '    transition: none !important;',
    '  }',
    '}',
    '',
    '/* No-JS fallback */',
    '.stacked-carousel:not(.is-ready) .stacked-carousel__track {',
    '  display: flex;',
    '  gap: 1rem;',
    '  overflow-x: auto;',
    '  scroll-snap-type: x mandatory;',
    '  padding: 1rem;',
    '  min-height: 0;',
    '  -webkit-overflow-scrolling: touch;',
    '}',
    '',
    '.stacked-carousel:not(.is-ready) .stacked-carousel__slide {',
    '  position: relative;',
    '  top: auto;',
    '  left: auto;',
    '  flex: 0 0 var(--sc-card-width);',
    '  scroll-snap-align: center;',
    '  transform: none !important;',
    '  opacity: 1 !important;',
    '  visibility: visible !important;',
    '}',
    '',
    '.stacked-carousel:not(.is-ready) .stacked-carousel__nav,',
    '.stacked-carousel:not(.is-ready) .stacked-carousel__pagination {',
    '  display: none;',
    '}'
  ].join('\n');

  var DEFAULTS = {
    /** How many cards visible in the stack (including the front card) */
    stackDepth: 4,
    /** px offset to the right per stack level */
    horizontalOffset: 42,
    /** px offset upward per stack level */
    verticalOffset: 22,
    /** Scale of the card one level behind (front is 1) */
    scaleDifference: 0.07,
    /** Subtle rotateZ degrees per stack level */
    rotation: 2,
    /** translateZ step (px) — negative pushes back */
    depthStep: 56,
    perspective: 1200,
    animationDuration: 680,
    autoplay: false,
    autoplayDelay: 4400,
    navigation: true,
    pagination: true,
    loop: true,
    /** Drag distance (px) required to commit a change */
    swipeSensitivity: 90,
    /** Extra multiply on pointer delta while dragging */
    dragSensitivity: 1,
    /** Exit throw distance when advancing */
    exitDistance: 420,
    exitRotate: 12,
  };

  var INSTANCES = new WeakMap();
  var stylesInjected = false;
  var fontsLoaded = false;



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
    var raw = el.getAttribute('data-stacked-config');
    if (!raw) return {};
    try {
      return JSON.parse(raw);
    } catch (err) {
      console.warn('[SEPremiumStacked] Invalid data-stacked-config JSON', err);
      return {};
    }
  }

  function getBreakpointOverrides(config) {
    var width = global.innerWidth || document.documentElement.clientWidth;
    if (width <= 749) {
      return {
        stackDepth: Math.min(config.stackDepth, 3),
        horizontalOffset: Math.min(config.horizontalOffset, 28),
        verticalOffset: Math.min(config.verticalOffset, 16),
        scaleDifference: Math.min(config.scaleDifference, 0.06),
        depthStep: Math.min(config.depthStep, 44),
        exitDistance: Math.min(config.exitDistance, 280),
      };
    }
    if (width <= 989) {
      return {
        stackDepth: Math.min(config.stackDepth, 4),
        horizontalOffset: Math.min(config.horizontalOffset, 36),
      };
    }
    return {};
  }

  function StackedCarousel(root, userConfig) {
    this.root = root;
    this.userConfig = userConfig || {};
    this.config = mergeConfig(
      DEFAULTS,
      mergeConfig(parseConfigFromElement(root), this.userConfig)
    );
    this.runtime = mergeConfig(this.config, getBreakpointOverrides(this.config));

    this.stage = root.querySelector('[data-stacked-stage]');
    this.track = root.querySelector('[data-stacked-track]');
    this.liveRegion = root.querySelector('[data-stacked-live]');
    this.prevBtn = root.querySelector('[data-stacked-prev]');
    this.nextBtn = root.querySelector('[data-stacked-next]');
    this.pagination = root.querySelector('[data-stacked-pagination]');
    this.nav = root.querySelector('[data-stacked-nav]');

    this.slides = [];
    this.index = 0;
    this.isDragging = false;
    this.dragStartX = 0;
    this.dragStartY = 0;
    this.dragDeltaX = 0;
    this.dragDeltaY = 0;
    this.pointerId = null;
    this.lockAxis = null;
    this.autoplayTimer = null;
    this.transitionTimer = null;
    this.isAnimating = false;
    this.bound = {};
    this.destroyed = false;

    if (!this.stage || !this.track) {
      console.warn('[SEPremiumStacked] Missing stage/track elements');
      return;
    }

    this._collectSlides();
    if (!this.slides.length) return;

    this._applyChrome();
    this._bind();
    this._setTransition();
    this._setPerspective();
    this._syncCardWidth();
    this.goTo(this._initialIndex(), { animate: false, announce: false });
    this.root.classList.add('is-ready');
    this._startAutoplay();
  }

  StackedCarousel.prototype._initialIndex = function () {
    var marked = this.slides.findIndex(function (slide) {
      return slide.classList.contains('is-active') || slide.getAttribute('aria-current') === 'true';
    });
    return marked >= 0 ? marked : 0;
  };

  StackedCarousel.prototype._collectSlides = function () {
    this.slides = Array.prototype.slice.call(
      this.track.querySelectorAll('[data-stacked-slide]')
    );
    this.slides.forEach(function (slide, i) {
      slide.setAttribute('role', 'group');
      slide.setAttribute('aria-roledescription', 'slide');
      slide.setAttribute('aria-label', i + 1 + ' of ' + this.slides.length);
      slide.dataset.index = String(i);
    }, this);
  };

  StackedCarousel.prototype._applyChrome = function () {
    if (this.nav) {
      this.nav.hidden = !this.runtime.navigation || this.slides.length < 2;
    }
    if (this.pagination) {
      this.pagination.hidden = !this.runtime.pagination || this.slides.length < 2;
      if (this.runtime.pagination) this._buildPagination();
    }
  };

  StackedCarousel.prototype._buildPagination = function () {
    var self = this;
    this.pagination.innerHTML = '';
    this.slides.forEach(function (_, i) {
      var li = document.createElement('li');
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'stacked-carousel__dot';
      btn.setAttribute('data-stacked-dot', String(i));
      btn.setAttribute('aria-label', 'Go to product ' + (i + 1));
      if (i === self.index) {
        btn.classList.add('is-active');
        btn.setAttribute('aria-current', 'true');
      }
      li.appendChild(btn);
      self.pagination.appendChild(li);
    });
  };

  StackedCarousel.prototype._setTransition = function () {
    var speed = prefersReducedMotion() ? 1 : this.runtime.animationDuration;
    this.root.style.setProperty(
      '--sc-transition',
      speed + 'ms cubic-bezier(0.34, 1.3, 0.64, 1)'
    );
  };

  StackedCarousel.prototype._setPerspective = function () {
    this.root.style.setProperty('--sc-perspective', this.runtime.perspective + 'px');
    this.stage.style.perspective = this.runtime.perspective + 'px';
  };

  StackedCarousel.prototype._syncCardWidth = function () {
    var container = this.root.querySelector('.stacked-carousel__inner') || this.root;
    var width = container.clientWidth || global.innerWidth;
    var card = clamp(Math.round(width * 0.42), 240, 360);
    if (width < 750) card = clamp(Math.round(width * 0.84), 220, 320);
    else if (width < 990) card = clamp(Math.round(width * 0.48), 260, 340);
    this.root.style.setProperty('--sc-card-width', card + 'px');
  };

  StackedCarousel.prototype._bind = function () {
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
      var btn = e.target.closest('[data-stacked-dot]');
      if (!btn || !self.pagination.contains(btn)) return;
      var i = Number(btn.getAttribute('data-stacked-dot'));
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
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        self.prev();
      } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
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
      if (!self.isDragging || self.lockAxis !== 'x') return;
      if (e.cancelable) e.preventDefault();
    };

    if (this.prevBtn) this.prevBtn.addEventListener('click', this.bound.onPrev);
    if (this.nextBtn) this.nextBtn.addEventListener('click', this.bound.onNext);
    if (this.pagination) this.pagination.addEventListener('click', this.bound.onPagination);
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

  StackedCarousel.prototype._onResize = function () {
    this.runtime = mergeConfig(this.config, getBreakpointOverrides(this.config));
    this._setTransition();
    this._setPerspective();
    this._syncCardWidth();
    this._applyChrome();
    this._render({ animate: false });
  };

  StackedCarousel.prototype._onPointerDown = function (e) {
    if (e.button !== undefined && e.button !== 0) return;
    if (e.target.closest('a, button')) return;
    if (this.isAnimating) return;

    this.isDragging = true;
    this.pointerId = e.pointerId;
    this.dragStartX = e.clientX;
    this.dragStartY = e.clientY;
    this.dragDeltaX = 0;
    this.dragDeltaY = 0;
    this.lockAxis = null;
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

  StackedCarousel.prototype._onPointerMove = function (e) {
    if (!this.isDragging) return;

    var dx = (e.clientX - this.dragStartX) * (this.runtime.dragSensitivity || 1);
    var dy = e.clientY - this.dragStartY;

    if (!this.lockAxis) {
      if (Math.abs(dx) < 6 && Math.abs(dy) < 6) return;
      this.lockAxis = Math.abs(dx) >= Math.abs(dy) ? 'x' : 'y';
      if (this.lockAxis === 'y') {
        this._cancelDrag();
        return;
      }
    }

    if (this.lockAxis !== 'x') return;

    this.dragDeltaX = dx;
    this.dragDeltaY = dy * 0.15;
    if (!prefersReducedMotion()) this._renderDragPreview(this.dragDeltaX, this.dragDeltaY);
  };

  StackedCarousel.prototype._cancelDrag = function () {
    this.isDragging = false;
    this.lockAxis = null;
    this.dragDeltaX = 0;
    this.dragDeltaY = 0;
    this.stage.classList.remove('is-dragging');
    this.root.classList.remove('is-dragging');
    this.stage.removeEventListener('pointermove', this.bound.onPointerMove);
    this.stage.removeEventListener('pointerup', this.bound.onPointerUp);
    this.stage.removeEventListener('pointercancel', this.bound.onPointerUp);
    try {
      if (this.pointerId !== null) this.stage.releasePointerCapture(this.pointerId);
    } catch (_) { /* noop */ }
    this.pointerId = null;
    this._render({ animate: true });
    this._startAutoplay();
  };

  StackedCarousel.prototype._onPointerUp = function () {
    if (!this.isDragging) return;

    var dx = this.dragDeltaX;
    var threshold = this.runtime.swipeSensitivity || 90;

    this.isDragging = false;
    this.lockAxis = null;
    this.stage.classList.remove('is-dragging');
    this.root.classList.remove('is-dragging');
    this.stage.removeEventListener('pointermove', this.bound.onPointerMove);
    this.stage.removeEventListener('pointerup', this.bound.onPointerUp);
    this.stage.removeEventListener('pointercancel', this.bound.onPointerUp);
    try {
      if (this.pointerId !== null) this.stage.releasePointerCapture(this.pointerId);
    } catch (_) { /* noop */ }
    this.pointerId = null;
    this.dragDeltaX = 0;
    this.dragDeltaY = 0;

    if (Math.abs(dx) >= threshold) {
      // Swipe left → next, swipe right → previous
      if (dx < 0) this.next({ fromDrag: true, throwX: dx });
      else this.prev({ fromDrag: true, throwX: dx });
    } else {
      this._render({ animate: true });
    }

    this._startAutoplay();
  };

  StackedCarousel.prototype._wrapIndex = function (i) {
    var len = this.slides.length;
    if (!len) return 0;
    if (this.runtime.loop) return ((i % len) + len) % len;
    return clamp(i, 0, len - 1);
  };

  /**
   * Stack level for a slide relative to the active index.
   * 0 = front, 1 = first behind, ... depth-1 = furthest visible.
   * Returns -1 if not in the visible stack window.
   */
  StackedCarousel.prototype._stackLevel = function (slideIndex, activeIndex) {
    var len = this.slides.length;
    var depth = Math.max(1, this.runtime.stackDepth || 4);
    var offset;

    if (this.runtime.loop) {
      offset = (slideIndex - activeIndex + len) % len;
    } else {
      offset = slideIndex - activeIndex;
      if (offset < 0) return -1;
    }

    if (offset >= depth) return -1;
    return offset;
  };

  StackedCarousel.prototype._transformForLevel = function (level, dragX, dragY) {
    var cfg = this.runtime;
    var x = level * cfg.horizontalOffset;
    var y = -level * cfg.verticalOffset;
    var z = -level * cfg.depthStep;
    var scale = Math.max(1 - level * cfg.scaleDifference, 0.72);
    var rotZ = level * cfg.rotation;
    var opacity = level === 0 ? 1 : Math.max(0.55, 1 - level * 0.12);

    // Front card follows the drag; stack gently peeks forward
    if (level === 0 && (dragX || dragY)) {
      x += dragX;
      y += dragY;
      rotZ += (dragX / 40) * cfg.exitRotate * 0.15;
      opacity = clamp(1 - Math.abs(dragX) / (cfg.exitDistance * 1.4), 0.35, 1);
    } else if (level > 0 && dragX) {
      var progress = clamp(Math.abs(dragX) / (cfg.swipeSensitivity || 90), 0, 1);
      var advance = progress * 0.55;
      x = (level - advance) * cfg.horizontalOffset;
      y = -(level - advance) * cfg.verticalOffset;
      z = -(level - advance) * cfg.depthStep;
      scale = Math.max(1 - (level - advance) * cfg.scaleDifference, 0.72);
      opacity = Math.min(1, opacity + progress * 0.2);
    }

    return { x: x, y: y, z: z, scale: scale, rotateZ: rotZ, opacity: opacity };
  };

  StackedCarousel.prototype._exitTransform = function (direction, throwX) {
    var cfg = this.runtime;
    var dist = cfg.exitDistance;
    var x = throwX !== undefined ? throwX * 1.35 : direction * -dist;
    if (Math.abs(x) < dist * 0.6) x = direction * -dist;
    return {
      x: x,
      y: -20,
      z: 40,
      scale: 0.96,
      rotateZ: direction * -cfg.exitRotate,
      opacity: 0,
    };
  };

  StackedCarousel.prototype._applyTransform = function (slide, t) {
    slide.style.transform =
      'translate(-50%, -50%) translateX(' +
      t.x +
      'px) translateY(' +
      t.y +
      'px) translateZ(' +
      t.z +
      'px) rotateZ(' +
      t.rotateZ +
      'deg) scale(' +
      t.scale +
      ')';
    slide.style.opacity = String(t.opacity);
  };

  StackedCarousel.prototype._updateImageLoading = function (slide, level) {
    var img = slide.querySelector('img');
    if (!img) return;
    if (level === 0) {
      img.loading = 'eager';
      img.setAttribute('fetchpriority', 'high');
    } else if (level > 0 && level < this.runtime.stackDepth) {
      img.loading = 'lazy';
      img.removeAttribute('fetchpriority');
    } else {
      img.loading = 'lazy';
      img.removeAttribute('fetchpriority');
    }
  };

  StackedCarousel.prototype._renderDragPreview = function (dragX, dragY) {
    var self = this;
    this.slides.forEach(function (slide, i) {
      var level = self._stackLevel(i, self.index);
      if (level < 0) {
        slide.classList.add('is-hidden');
        return;
      }
      slide.classList.remove('is-hidden');
      var t = self._transformForLevel(level, dragX, dragY);
      self._applyTransform(slide, t);
    });
  };

  StackedCarousel.prototype._render = function (options) {
    options = options || {};
    var animate = options.animate !== false && !prefersReducedMotion();
    var self = this;
    var exiting = options.exitingSlide || null;
    var exitDir = options.exitDirection || 0;
    var throwX = options.throwX;

    if (!animate) this.root.classList.add('is-instant');
    this.root.classList.toggle('is-animating', animate);
    this.isAnimating = animate;

    this.slides.forEach(function (slide, i) {
      var level = self._stackLevel(i, self.index);
      var isActive = level === 0;

      slide.classList.toggle('is-active', isActive);
      slide.classList.toggle('is-exiting', slide === exiting);
      slide.setAttribute('aria-hidden', isActive ? 'false' : 'true');
      slide.tabIndex = isActive ? 0 : -1;

      if (slide === exiting) {
        slide.classList.remove('is-hidden');
        slide.style.zIndex = '50';
        self._applyTransform(slide, self._exitTransform(exitDir, throwX));
        return;
      }

      if (level < 0) {
        slide.classList.add('is-hidden');
        slide.style.zIndex = '0';
        return;
      }

      slide.classList.remove('is-hidden');
      slide.style.zIndex = String(40 - level);
      self._applyTransform(slide, self._transformForLevel(level, 0, 0));
      self._updateImageLoading(slide, level);
    });

    this._syncChrome();

    if (!animate) {
      void this.track.offsetHeight;
      this.root.classList.remove('is-instant');
      this.isAnimating = false;
    }

    clearTimeout(this.transitionTimer);
    if (animate) {
      this.transitionTimer = setTimeout(function () {
        if (exiting) {
          exiting.classList.remove('is-exiting');
          // Re-place exited card into the stack if it loops back into view
          self._render({ animate: false });
        }
        self.root.classList.remove('is-animating');
        self.isAnimating = false;
      }, this.runtime.animationDuration + 40);
    } else {
      this.root.classList.remove('is-animating');
    }
  };

  StackedCarousel.prototype._syncChrome = function () {
    var i;
    if (this.pagination && this.runtime.pagination) {
      var dots = this.pagination.querySelectorAll('[data-stacked-dot]');
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

  StackedCarousel.prototype._announce = function () {
    if (!this.liveRegion) return;
    var active = this.slides[this.index];
    if (!active) return;
    var titleEl = active.querySelector('.stacked-card__title');
    var title = (
      active.getAttribute('data-product-title') ||
      (titleEl && titleEl.textContent) ||
      'Product ' + (this.index + 1)
    ).trim();
    this.liveRegion.textContent =
      title + ', slide ' + (this.index + 1) + ' of ' + this.slides.length;
  };

  StackedCarousel.prototype.goTo = function (index, options) {
    options = options || {};
    if (!this.slides.length || this.isAnimating) return;

    var next = this._wrapIndex(index);
    if (!this.runtime.loop) next = clamp(index, 0, this.slides.length - 1);
    if (next === this.index && options.animate !== false && !options.force) {
      this._render({ animate: true });
      return;
    }

    var prevIndex = this.index;
    var exiting = null;
    var exitDir = 0;

    if (options.animate !== false && options.fromDrag && prevIndex !== next) {
      exiting = this.slides[prevIndex];
      // next: exit left (-1), prev: exit right (+1)
      exitDir = next === this._wrapIndex(prevIndex + 1) ||
        (!this.runtime.loop && next > prevIndex)
        ? -1
        : 1;
    } else if (options.animate !== false && prevIndex !== next && !prefersReducedMotion()) {
      exiting = this.slides[prevIndex];
      var forward = this.runtime.loop
        ? (next - prevIndex + this.slides.length) % this.slides.length <=
          Math.floor(this.slides.length / 2)
        : next > prevIndex;
      // When going forward (next), front exits to the left
      exitDir = forward ? -1 : 1;
      // Special case: wrapping prev from 0 to last
      if (this.runtime.loop && prevIndex === 0 && next === this.slides.length - 1) {
        exitDir = 1;
        forward = false;
      }
      if (this.runtime.loop && prevIndex === this.slides.length - 1 && next === 0) {
        exitDir = -1;
        forward = true;
      }
    }

    this.index = next;
    this._render({
      animate: options.animate !== false,
      exitingSlide: exiting,
      exitDirection: exitDir,
      throwX: options.throwX,
    });
    if (options.announce !== false) this._announce();
    this._restartAutoplay();
  };

  StackedCarousel.prototype.next = function (options) {
    options = options || {};
    this.goTo(this.index + 1, options);
  };

  StackedCarousel.prototype.prev = function (options) {
    options = options || {};
    this.goTo(this.index - 1, options);
  };

  StackedCarousel.prototype._startAutoplay = function () {
    var self = this;
    this._stopAutoplay();
    if (!this.runtime.autoplay || this.slides.length < 2 || prefersReducedMotion()) return;
    if (document.hidden) return;
    this.autoplayTimer = setInterval(function () {
      self.next();
    }, Math.max(1800, this.runtime.autoplayDelay || 4400));
  };

  StackedCarousel.prototype._stopAutoplay = function () {
    if (this.autoplayTimer) {
      clearInterval(this.autoplayTimer);
      this.autoplayTimer = null;
    }
  };

  StackedCarousel.prototype._restartAutoplay = function () {
    if (this.runtime.autoplay) this._startAutoplay();
  };

  StackedCarousel.prototype.updateConfig = function (partial) {
    this.userConfig = mergeConfig(this.userConfig, partial || {});
    this.config = mergeConfig(
      DEFAULTS,
      mergeConfig(parseConfigFromElement(this.root), this.userConfig)
    );
    this.runtime = mergeConfig(this.config, getBreakpointOverrides(this.config));
    this._setTransition();
    this._setPerspective();
    this._syncCardWidth();
    this._applyChrome();
    this._render({ animate: false });
    this._restartAutoplay();
  };

  StackedCarousel.prototype.refresh = function () {
    this._collectSlides();
    this._applyChrome();
    this.index = this._wrapIndex(this.index);
    this._render({ animate: false });
  };

  StackedCarousel.prototype.destroy = function () {
    if (this.destroyed) return;
    this.destroyed = true;
    this._stopAutoplay();
    clearTimeout(this.transitionTimer);

    if (this.prevBtn) this.prevBtn.removeEventListener('click', this.bound.onPrev);
    if (this.nextBtn) this.nextBtn.removeEventListener('click', this.bound.onNext);
    if (this.pagination) this.pagination.removeEventListener('click', this.bound.onPagination);
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
      slide.classList.remove('is-active', 'is-hidden', 'is-exiting');
    });
    this.root.classList.remove('is-ready', 'is-animating', 'is-dragging', 'is-instant');
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
    if (existing) {
      existing.destroy();
    }

    var instance = new StackedCarousel(root, config);
    INSTANCES.set(root, instance);
    return instance;
  }

  function getInstance(root) {
    return INSTANCES.get(root) || null;
  }

  function initAll(selector, config) {
    var nodes = document.querySelectorAll(selector || '[data-stacked]');
    var instances = [];
    Array.prototype.forEach.call(nodes, function (node) {
      instances.push(init(node, config));
    });
    return instances;
  }

  global.SEPremiumStacked = {
    defaults: DEFAULTS,
    injectStyles: injectStyles,
    ensureFonts: ensureFonts,
    init: init,
    initAll: initAll,
    getInstance: getInstance,
  };

  // Compatibility alias
  global.StackedCarousel = global.SEPremiumStacked;
})(typeof window !== 'undefined' ? window : this);
