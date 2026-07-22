;(() => {
  const script = document.currentScript
  if (!script) return

  const url = new URL(script.src)
  const sliderId = url.searchParams.get("id")
  const shopFromScript = url.searchParams.get("shop")
  const shopFromShopify =
    (window.Shopify && (window.Shopify.shop || window.Shopify.permanent_domain)) || ""
  const shop = (shopFromScript || shopFromShopify || "").replace(/^https?:\/\//, "").replace(/\/$/, "")
  const uniqueId = `slideease-${sliderId}-${Math.random().toString(36).slice(2, 9)}`
  const apiOrigin = url.origin
  const apiUrl = `${apiOrigin}/api/public/slider/${encodeURIComponent(sliderId)}?shop=${encodeURIComponent(shop)}`

  const CHEVRON_LEFT =
    '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M15 18l-6-6 6-6" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>'
  const CHEVRON_RIGHT =
    '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M9 18l6-6-6-6" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>'

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;")
  }

  function safeUrl(value) {
    if (!value) return ""
    const trimmed = String(value).trim()
    if (trimmed.startsWith("/")) return trimmed
    try {
      const parsed = new URL(trimmed)
      if (parsed.protocol === "http:" || parsed.protocol === "https:") return parsed.toString()
    } catch {
      return ""
    }
    return ""
  }

  function resolveFrameHeight(settings) {
    const effect = settings.effect || settings.transition || "slide"
    const saved = Number(settings.height)
    const preferred = Number.isFinite(saved) && saved > 0 ? saved : 640
    if (effect === "announcement") return Math.min(Math.max(preferred, 36), 120)
    if (effect === "logo-grid") return Math.min(Math.max(preferred, 80), 240)
    if (effect === "testimonials") return Math.min(Math.max(preferred, 240), 520)
    return Math.min(Math.max(preferred, 320), 900)
  }

  function trackEvent(type, slideId) {
    try {
      const body = JSON.stringify({
        shop,
        sliderId: Number(sliderId),
        slideId: slideId != null ? Number(slideId) : null,
        type,
      })
      if (navigator.sendBeacon) {
        const blob = new Blob([body], { type: "application/json" })
        navigator.sendBeacon(`${apiOrigin}/api/public/events`, blob)
        return
      }
      fetch(`${apiOrigin}/api/public/events`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
        keepalive: true,
      }).catch(() => {})
    } catch {
      // ignore analytics failures
    }
  }

  function storeRoot() {
    const root = (window.Shopify && window.Shopify.routes && window.Shopify.routes.root) || "/"
    return String(root).endsWith("/") ? String(root) : `${String(root)}/`
  }

  function cartAddUrl() {
    return `${storeRoot()}cart/add.js`
  }

  function publishCartUpdate(data) {
    try {
      const count = Number(data?.item_count)
      if (Number.isFinite(count)) {
        document.querySelectorAll("[data-cart-count], .cart-count-bubble, .cart-count").forEach((el) => {
          const span = el.matches("span") ? el : el.querySelector("span")
          if (span) span.textContent = String(count)
          else if (el.childElementCount === 0) el.textContent = String(count)
          el.classList.toggle("hidden", count <= 0)
        })
      }
      document.documentElement.dispatchEvent(
        new CustomEvent("cart:updated", { bubbles: true, detail: { source: "slideease", cart: data } }),
      )
      document.dispatchEvent(new CustomEvent("cart:refresh", { bubbles: true }))
      document.dispatchEvent(new CustomEvent("ajaxProduct:added", { bubbles: true, detail: data }))
      if (window.Shopify && typeof window.Shopify.onItemAdded === "function") {
        window.Shopify.onItemAdded(data)
      }
      const drawer = document.querySelector("cart-drawer")
      if (drawer) {
        if (typeof drawer.renderContents === "function" && data) {
          try {
            drawer.renderContents(data)
          } catch {
            /* ignore */
          }
        }
        if (typeof drawer.open === "function") drawer.open()
        else {
          drawer.classList.add("active", "is-open")
          drawer.setAttribute("open", "")
        }
      }
    } catch {
      // theme hooks are optional
    }
  }

  async function fetchCart() {
    const response = await fetch(`${storeRoot()}cart.js`, {
      headers: { Accept: "application/json" },
      credentials: "same-origin",
    })
    if (!response.ok) return null
    return response.json().catch(() => null)
  }

  async function addVariantToCart(variantId, quantity = 1) {
    const id = Number(variantId)
    if (!Number.isFinite(id) || id <= 0) throw new Error("Missing variant")

    const formData = new FormData()
    formData.append("id", String(id))
    formData.append("quantity", String(quantity))

    let response = await fetch(cartAddUrl(), {
      method: "POST",
      headers: { Accept: "application/json" },
      body: formData,
      credentials: "same-origin",
    })

    if (!response.ok) {
      response = await fetch(cartAddUrl(), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ id, quantity }),
        credentials: "same-origin",
      })
    }

    if (!response.ok) {
      const form = new URLSearchParams()
      form.set("id", String(id))
      form.set("quantity", String(quantity))
      response = await fetch(cartAddUrl(), {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Accept: "application/json",
        },
        body: form.toString(),
        credentials: "same-origin",
      })
    }

    const data = await response.json().catch(() => ({}))
    if (!response.ok) {
      const message =
        data.description ||
        data.message ||
        (typeof data.errors === "string" ? data.errors : null) ||
        "Could not add to cart"
      throw new Error(message)
    }

    const cart = (await fetchCart()) || data
    try {
      const sectionsRes = await fetch(`${storeRoot()}?sections=cart-icon-bubble,cart-drawer,cart-notification`, {
        headers: { Accept: "application/json" },
        credentials: "same-origin",
      })
      if (sectionsRes.ok) {
        const sections = await sectionsRes.json()
        Object.entries(sections || {}).forEach(([sectionId, html]) => {
          if (!html) return
          const el = document.getElementById(sectionId) || document.querySelector(`#shopify-section-${sectionId}`)
          if (el) el.innerHTML = html
        })
      }
    } catch {
      // optional
    }
    publishCartUpdate({ ...data, item_count: cart?.item_count ?? data?.item_count })
    return data
  }

  function productHandleFromUrl(url) {
    const match = String(url || "").match(/\/products\/([^/?#]+)/i)
    return match ? decodeURIComponent(match[1]) : ""
  }

  async function resolveVariantId({ variantId, productHandle }) {
    const direct = String(variantId || "").replace(/\D/g, "")
    if (direct) return direct
    const handle = String(productHandle || "").trim()
    if (!handle) throw new Error("Missing product")
    const productUrl = `${storeRoot()}products/${encodeURIComponent(handle)}.js`
    const response = await fetch(productUrl, {
      headers: { Accept: "application/json" },
      credentials: "same-origin",
    })
    if (!response.ok) throw new Error("Product unavailable")
    const product = await response.json()
    const variant =
      (product.variants || []).find((item) => item?.available) ||
      (product.variants || []).find((item) => item?.available !== false) ||
      product.variants?.[0]
    const id = String(variant?.id || "").replace(/\D/g, "")
    if (!id) throw new Error("No variant found")
    return id
  }

  function youtubeEmbed(url) {
    try {
      const u = new URL(url)
      let id = u.searchParams.get("v")
      if (!id && u.hostname.includes("youtu.be")) id = u.pathname.slice(1)
      if (!id && u.pathname.includes("/embed/")) id = u.pathname.split("/embed/")[1]
      return id ? `https://www.youtube.com/embed/${id}?rel=0` : ""
    } catch {
      return ""
    }
  }

  function vimeoEmbed(url) {
    try {
      const match = String(url).match(/vimeo\.com\/(?:video\/)?(\d+)/)
      return match ? `https://player.vimeo.com/video/${match[1]}` : ""
    } catch {
      return ""
    }
  }

  function loadScriptOnce(src) {
    return new Promise((resolve, reject) => {
      const existing = document.querySelector(`script[data-slideease-src="${src}"]`)
      if (existing) {
        if (existing.dataset.loaded === "true") return resolve()
        existing.addEventListener("load", () => resolve())
        existing.addEventListener("error", reject)
        return
      }
      if (src.includes("jquery") && window.jQuery) return resolve()
      if (src.includes("slick") && window.jQuery?.fn?.slick) return resolve()

      const el = document.createElement("script")
      el.src = src
      el.async = true
      el.dataset.slideeaseSrc = src
      el.onload = () => {
        el.dataset.loaded = "true"
        resolve()
      }
      el.onerror = reject
      document.head.appendChild(el)
    })
  }

  function loadCssOnce(href) {
    if (document.querySelector(`link[data-slideease-href="${href}"]`)) return
    const link = document.createElement("link")
    link.rel = "stylesheet"
    link.href = href
    link.dataset.slideeaseHref = href
    document.head.appendChild(link)
  }

  function insertAdjacent(html) {
    script.insertAdjacentHTML("afterend", html)
  }

  function removeNode(id) {
    document.getElementById(id)?.remove()
  }

  function applyFullBleed(el) {
    if (!el) return { sync: () => {}, destroy: () => {} }

    const sync = () => {
      el.style.marginLeft = "0px"
      el.style.width = "100%"
      el.style.maxWidth = "100%"
      void el.offsetWidth

      const left = el.getBoundingClientRect().left
      const vw = document.documentElement.clientWidth
      el.style.marginLeft = `${-Math.round(left)}px`
      el.style.width = `${vw}px`
      el.style.maxWidth = `${vw}px`
    }

    sync()
    requestAnimationFrame(sync)
    window.addEventListener("resize", sync)
    window.addEventListener("orientationchange", sync)
    return {
      sync,
      destroy: () => {
        window.removeEventListener("resize", sync)
        window.removeEventListener("orientationchange", sync)
      },
    }
  }

  function renderLoading() {
    insertAdjacent(`
      <div id="${uniqueId}-loading" class="se-loading" aria-live="polite" aria-busy="true">
        <div class="se-loading__bar"></div>
        <style>
          .se-loading{width:100%;padding:clamp(2.5rem,8vw,4.5rem) 1rem;display:flex;justify-content:center;background:linear-gradient(180deg,#f8fafc,#eef2f7)}
          .se-loading__bar{width:min(220px,50%);height:3px;border-radius:999px;background:linear-gradient(90deg,#cbd5e1,#1a2f4a,#cbd5e1);background-size:200% 100%;animation:seLoad 1.1s ease-in-out infinite}
          @keyframes seLoad{0%{background-position:100% 0}100%{background-position:-100% 0}}
        </style>
      </div>
    `)
  }

  function renderMessage(title, message) {
    insertAdjacent(`
      <div class="se-message" style="width:100%;max-width:640px;margin:1.5rem auto;padding:1.35rem 1.5rem;border:1px solid #e2e8f0;border-radius:14px;font-family:system-ui,-apple-system,sans-serif;background:#fff;box-shadow:0 8px 24px rgba(15,23,42,0.06);">
        <strong style="display:block;margin-bottom:0.35rem;color:#0f172a;font-size:0.95rem;">${escapeHtml(title)}</strong>
        <span style="color:#64748b;font-size:0.9rem;line-height:1.45;">${escapeHtml(message)}</span>
      </div>
    `)
  }

  function buildSlickConfig(settings) {
    const prefersReduced = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches
    const aliases = {
      "multiple-items": "autoplay",
      lazy: "autoplay",
      spotlight: "center",
      "carousel-3d": "coverflow",
    }
    const effect = aliases[settings.effect || settings.transition] || settings.effect || settings.transition || "slide"
    const fadeEffects = [
      "fade",
      "thumbnails",
      "cube",
      "flip",
      "zoom",
      "ken-burns",
      "cards-stack",
      "slide-up",
      "wipe",
      "blur-reveal",
      "split-panel",
      "hero-fullwidth",
      "hero-boxed",
      "hero-video",
      "testimonials",
      "stories",
      "announcement",
    ]
    const centerEffects = ["center", "coverflow", "product-showcase"]
    const productStripEffects = ["product-carousel", "collection-rail"]
    const marqueeEffects = ["marquee", "logo-grid"]
    const mobileShow = Math.max(1, Number(settings.mobile?.slidesToShow) || 1)
    const mobileScroll = Math.max(1, Number(settings.mobile?.slidesToScroll) || 1)

    const config = {
      slidesToShow: Number(settings.slidesToShow) || 1,
      slidesToScroll: Number(settings.slidesToScroll) || 1,
      infinite: settings.infinite !== false,
      dots: settings.dots !== false && !marqueeEffects.includes(effect) && effect !== "announcement" && effect !== "stories",
      arrows: false,
      autoplay: prefersReduced
        ? false
        : Boolean(settings.autoplay) || marqueeEffects.includes(effect) || effect === "ken-burns",
      autoplaySpeed: marqueeEffects.includes(effect) ? 0 : Number(settings.autoplaySpeed) || 3200,
      pauseOnHover: settings.pauseOnHover !== false,
      pauseOnFocus: true,
      speed: prefersReduced ? 0 : marqueeEffects.includes(effect) ? Number(settings.speed) || 9000 : Number(settings.speed) || 650,
      fade: fadeEffects.includes(effect) || Boolean(settings.fade),
      cssEase: marqueeEffects.includes(effect) ? "linear" : "cubic-bezier(0.22, 1, 0.36, 1)",
      adaptiveHeight: false,
      centerMode: centerEffects.includes(effect) || Boolean(settings.centerMode),
      centerPadding: effect === "coverflow" ? "6%" : effect === "product-showcase" ? "10%" : settings.centerPadding || "10%",
      vertical: effect === "vertical" || Boolean(settings.vertical),
      variableWidth: effect === "variable-width" || Boolean(settings.variableWidth),
      lazyLoad: settings.lazyLoad ? "ondemand" : null,
      dotsClass: `slideease-dots slideease-dots-${uniqueId}`,
      customPaging: () => '<button type="button"><span class="se-dot"></span></button>',
      responsive: [
        {
          breakpoint: 900,
          settings: {
            slidesToShow: productStripEffects.includes(effect)
              ? Math.min(Number(settings.slidesToShow) || 4, 3)
              : Math.min(Number(settings.slidesToShow) || 1, 2),
            centerMode: centerEffects.includes(effect),
            centerPadding: "5%",
          },
        },
        {
          breakpoint: 640,
          settings: {
            slidesToShow: mobileShow,
            slidesToScroll: Math.min(mobileScroll, mobileShow),
            centerMode: false,
            vertical: false,
            variableWidth: false,
          },
        },
      ],
    }

    if (fadeEffects.includes(effect)) {
      config.slidesToShow = 1
      config.slidesToScroll = 1
    }
    if (centerEffects.includes(effect)) {
      config.slidesToShow = Math.max(Number(settings.slidesToShow) || 3, 1)
    }
    if (productStripEffects.includes(effect)) {
      config.slidesToShow = Math.max(Number(settings.slidesToShow) || (effect === "collection-rail" ? 5 : 4), 1)
      config.slidesToScroll = 1
    }
    if (marqueeEffects.includes(effect)) {
      config.arrows = false
      config.dots = false
      config.waitForAnimate = false
      config.slidesToShow = Math.max(Number(settings.slidesToShow) || 5, 1)
    }
    return { config, effect }
  }

  function renderMedia(slide, settings) {
    const imageUrl = safeUrl(slide.imageUrl)
    const videoUrl = safeUrl(slide.videoUrl)
    const alt = escapeHtml(slide.imageAlt || slide.heading || slide.title || "Slide media")
    const objectFit = escapeHtml(settings.objectFit || "cover")
    const useLazy = Boolean(settings.lazyLoad)

    if (slide.mediaType === "video" && videoUrl) {
      const yt = youtubeEmbed(videoUrl)
      const vim = vimeoEmbed(videoUrl)
      if (yt || vim) {
        return `<iframe class="se-media" src="${escapeHtml(yt || vim)}" title="${alt}" style="width:100%;height:100%;border:0;" allow="accelerometer;autoplay;clipboard-write;encrypted-media;gyroscope;picture-in-picture" allowfullscreen loading="lazy"></iframe>`
      }
      return `<video class="se-media" src="${escapeHtml(videoUrl)}" poster="${escapeHtml(imageUrl)}" playsinline muted loop autoplay style="width:100%;height:100%;object-fit:${objectFit};display:block;"></video>`
    }

    if (!imageUrl) {
      return `<div class="se-media se-media--empty" aria-hidden="true"></div>`
    }
    const imgAttrs = useLazy
      ? `data-lazy="${escapeHtml(imageUrl)}" src="data:image/gif;base64,R0lGODlhAQABAAAAACw="`
      : `src="${escapeHtml(imageUrl)}"`
    return `<img class="se-media" ${imgAttrs} alt="${alt}" decoding="async" style="width:100%;height:100%;object-fit:${objectFit};object-position:center;display:block;" />`
  }

  function renderSlide(slide, settings, effect) {
    const heading = slide.heading || slide.title || ""
    const subheading = slide.subheading || ""
    const description = slide.description || ""
    const overlayOpacity = Number(slide.overlayOpacity ?? settings.overlayOpacity ?? 0.28)
    const overlayColor = slide.overlayColor || settings.overlayColor || "#0f172a"
    const align = slide.textAlign || "center"
    const justify = align === "left" ? "flex-start" : align === "right" ? "flex-end" : "center"
    const ctaHref = safeUrl(slide.ctaUrl)
    const targetAttrs = slide.ctaOpenInNewTab ? ` target="_blank" rel="noopener noreferrer"` : ""
    const radius =
      effect === "hero-fullwidth" || effect === "hero-video" || effect === "announcement"
        ? 0
        : Number(settings.borderRadius ?? 0)
    const textColor = escapeHtml(slide.textColor || "#ffffff")
    const btnBg = escapeHtml(settings.ctaBackground || slide.buttonBg || "#1a2f4a")
    const btnHoverBg = escapeHtml(settings.ctaHoverBackground || settings.ctaBackground || slide.buttonBg || "#243d5c")
    const btnText = escapeHtml(settings.ctaTextColor || slide.buttonTextColor || "#ffffff")
    const btnBorder = escapeHtml(settings.ctaBorderColor || "#ffffff")
    const btnIconColor = escapeHtml(settings.ctaIconColor || btnText)
    const btnIconBg = escapeHtml(settings.ctaIconBg || "rgba(255,255,255,0.12)")
    const btnIconSize = Math.min(Math.max(Number(settings.ctaIconSize ?? 34), 20), 56)
    const btnIconPad = Math.round(btnIconSize * 0.235)
    const btnBorderWidth = Math.min(Math.max(Number(settings.ctaBorderWidth ?? 1), 0), 6)
    const btnRadius = Math.min(Math.max(Number(settings.ctaBorderRadius ?? 50), 0), 50)
    const btnFontSize = Math.min(Math.max(Number(settings.ctaFontSize ?? 16), 12), 24)
    const btnIcon = ["arrow", "chevron", "none"].includes(settings.ctaIcon) ? settings.ctaIcon : "arrow"
    const btnIconPath = btnIcon === "chevron" ? "M7 4l6 6-6 6" : "M4 10h11m-4-4 4 4-4 4"
    const btnIconMarkup =
      btnIcon === "none"
        ? ""
        : `<svg viewBox="0 0 20 20" aria-hidden="true"><path d="${btnIconPath}" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`
    const ctaStyle = `--se-cta-bg:${btnBg};--se-cta-hover-bg:${btnHoverBg};--se-cta-color:${btnText};--se-cta-border:${btnBorder};--se-cta-border-width:${btnBorderWidth}px;--se-cta-radius:${btnRadius}px;--se-cta-font-size:${btnFontSize}px;--se-cta-icon-color:${btnIconColor};--se-cta-icon-bg:${btnIconBg};--se-cta-icon-size:${btnIconSize}px;--se-cta-icon-pad:${btnIconPad}px;`
    const ctaHtml = slide.ctaText
      ? `<a class="slideease-cta se-cta${btnIcon === "none" ? " se-cta--no-icon" : ""}" data-slide-id="${escapeHtml(slide.id)}" href="${escapeHtml(ctaHref || "#")}"${targetAttrs} style="${ctaStyle}"><span>${escapeHtml(slide.ctaText)}</span>${btnIconMarkup}</a>`
      : ""

    if (["product-carousel", "product-showcase", "collection-rail"].includes(effect)) {
      const imageUrl = escapeHtml(safeUrl(slide.imageUrl) || "")
      const showPrice = settings.showPrice !== false
      const showShopNow = settings.showShopNow !== false
      const showAddToCart = settings.showAddToCart !== false
      const shopLabel = escapeHtml(slide.ctaText || "Shop now")
      const atcLabel = escapeHtml(settings.addToCartText || "Add to cart")
      const variantId = String(slide.variantId || "").replace(/\D/g, "")
      const productHandle =
        productHandleFromUrl(slide.ctaUrl || ctaHref || "") ||
        String(slide.subheading || "").trim()
      const actions = []
      if (showAddToCart && (variantId || productHandle)) {
        actions.push(
          `<button type="button" class="se-product-card__atc" data-variant-id="${escapeHtml(variantId)}" data-product-handle="${escapeHtml(productHandle)}" data-slide-id="${escapeHtml(slide.id)}">${atcLabel}</button>`,
        )
      }
      if (showShopNow) {
        actions.push(
          `<a class="se-product-card__shop slideease-cta" data-slide-id="${escapeHtml(slide.id)}" href="${escapeHtml(ctaHref || "#")}"${targetAttrs}>${shopLabel}</a>`,
        )
      }
      return `
        <div data-slideease-slide-id="${escapeHtml(slide.id)}">
          <div class="se-product-pad">
            <article class="se-product-card se-frame-${escapeHtml(effect)}">
              <div class="se-product-card__link">
                <a class="se-product-card__media-link" href="${escapeHtml(ctaHref || "#")}"${targetAttrs}>
                  <div class="se-product-card__media">${imageUrl ? `<img src="${imageUrl}" alt="${escapeHtml(slide.imageAlt || heading)}" loading="lazy" />` : ""}</div>
                </a>
                <div class="se-product-card__body">
                  <h3 class="se-product-card__title">${escapeHtml(heading || "Product")}</h3>
                  ${showPrice && description ? `<p class="se-product-card__price">${escapeHtml(description)}</p>` : ""}
                  ${actions.length ? `<div class="se-product-card__actions">${actions.join("")}</div>` : ""}
                </div>
              </div>
            </article>
          </div>
        </div>
      `
    }

    if (effect === "testimonials") {
      const avatar = escapeHtml(safeUrl(slide.imageUrl) || "")
      return `
        <div data-slideease-slide-id="${escapeHtml(slide.id)}">
          <article class="se-testimonial se-frame-${escapeHtml(effect)}" style="--se-radius:${radius}px;border-radius:${radius}px;">
            <div class="se-testimonial__quote">“</div>
            <p class="se-testimonial__text">${escapeHtml(heading || "Customer quote")}</p>
            <div class="se-testimonial__author">
              ${avatar ? `<img src="${avatar}" alt="" class="se-testimonial__avatar" loading="lazy" />` : ""}
              <div>
                <strong>${escapeHtml(subheading || "Customer")}</strong>
                ${description ? `<span>${escapeHtml(description)}</span>` : ""}
              </div>
            </div>
          </article>
        </div>
      `
    }

    if (effect === "logo-grid") {
      const logo = escapeHtml(safeUrl(slide.imageUrl) || "")
      return `
        <div data-slideease-slide-id="${escapeHtml(slide.id)}">
          <div class="se-logo-cell se-frame-${escapeHtml(effect)}">
            ${logo ? `<img src="${logo}" alt="${escapeHtml(heading || "Brand")}" loading="lazy" />` : `<span>${escapeHtml(heading || "Brand")}</span>`}
          </div>
        </div>
      `
    }

    if (effect === "stories") {
      return `
        <div data-slideease-slide-id="${escapeHtml(slide.id)}">
          <article class="se-story se-frame-${escapeHtml(effect)}" style="--se-radius:${radius || 18}px;border-radius:${radius || 18}px;">
            <div class="se-story__media">${renderMedia(slide, settings)}</div>
            <div class="se-story__label">${escapeHtml(heading || "Story")}</div>
          </article>
        </div>
      `
    }

    if (effect === "announcement") {
      return `
        <div data-slideease-slide-id="${escapeHtml(slide.id)}">
          <div class="se-announce se-frame-${escapeHtml(effect)}" style="background:${btnBg};color:${textColor || btnText};">
            <span class="se-announce__text">${escapeHtml(heading || "Announcement")}</span>
            ${
              slide.ctaText
                ? `<a class="slideease-cta se-announce__cta" data-slide-id="${escapeHtml(slide.id)}" href="${escapeHtml(ctaHref || "#")}"${targetAttrs}>${escapeHtml(slide.ctaText)}</a>`
                : ""
            }
          </div>
        </div>
      `
    }

    const hasCopy = Boolean(heading || subheading || description || slide.ctaText)
    const multiPad = [
      "center",
      "coverflow",
      "autoplay",
      "variable-width",
      "marquee",
      "product-carousel",
      "product-showcase",
      "collection-rail",
    ].includes(effect)
    const slidePad = multiPad ? "0 12px" : effect === "hero-boxed" ? "0 24px" : "0"
    const splitPanels =
      effect === "split-panel"
        ? `<div class="se-split-panel se-split-panel--left"></div><div class="se-split-panel se-split-panel--right"></div>`
        : ""

    return `
      <div data-slideease-slide-id="${escapeHtml(slide.id)}">
        <div style="padding:${slidePad};">
          <article class="slideease-frame se-frame-${escapeHtml(effect || "fade")}${effect === "hero-boxed" ? " se-frame--boxed" : ""}" style="--se-radius:${radius}px;border-radius:${radius}px;">
            <div class="se-media-wrap">${renderMedia(slide, settings)}</div>
            <div class="se-overlay" aria-hidden="true">
              <span class="se-overlay__tint" style="background:${escapeHtml(overlayColor)};opacity:${overlayOpacity};"></span>
              <span class="se-overlay__grade"></span>
            </div>
            ${
              hasCopy
                ? `<div class="se-rise-content se-copy se-copy--${escapeHtml(align)}" style="align-items:${justify};text-align:${escapeHtml(align)};color:${textColor};">
              <div class="se-copy-plate">
                ${subheading ? `<p class="se-eyebrow">${escapeHtml(subheading)}</p>` : ""}
                ${heading ? `<h3 class="se-heading">${escapeHtml(heading)}</h3>` : ""}
                ${description ? `<p class="se-desc">${escapeHtml(description)}</p>` : ""}
                ${ctaHtml}
              </div>
            </div>`
                : ""
            }
            ${splitPanels}
          </article>
        </div>
      </div>
    `
  }

  /* premium layout CSS injected with root styles */
  function premiumLayoutCss() {
    return `
          .slideease-container-${uniqueId}.se-root--boxed { max-width: 1120px; margin-inline: auto; padding-inline: 1rem; }
          .slideease-container-${uniqueId}.se-root--announce { --se-render-height: var(--se-height); }
          .slideease-container-${uniqueId}.se-root--utility { --se-render-height: var(--se-height); }
          .slideease-container-${uniqueId} .se-product-pad { padding: 0 10px; height: 100%; display: flex; width: 100%; box-sizing: border-box; }
          .slideease-container-${uniqueId} .se-product-card {
            display: flex; flex-direction: column; height: 100%; width: 100%;
            background: #fff; border: 1px solid #e7e7e7; border-radius: 14px; overflow: hidden;
            box-shadow: none;
          }
          .slideease-container-${uniqueId} .se-product-card:hover { box-shadow: none; }
          .slideease-container-${uniqueId} .se-product-card__link { display: flex; flex-direction: column; height: 100%; flex: 1; color: inherit; text-decoration: none; }
          .slideease-container-${uniqueId} .se-product-card__media-link { display: block; color: inherit; text-decoration: none; }
          .slideease-container-${uniqueId} .se-product-card__media { aspect-ratio: 1 / 1.05; background: #f3f4f6; overflow: hidden; flex-shrink: 0; }
          .slideease-container-${uniqueId} .se-product-card__media img { width: 100%; height: 100%; object-fit: cover; display: block; }
          .slideease-container-${uniqueId} .se-product-card__body {
            padding: 0.9rem 1rem 1.1rem; color: #170f49;
            display: flex; flex-direction: column; flex: 1 1 auto;
            gap: var(--se-product-content-gap, 8px);
          }
          .slideease-container-${uniqueId} .se-product-card__body::after {
            content: "";
            flex: 1 1 auto;
            min-height: 0;
          }
          .slideease-container-${uniqueId} .se-product-card__title {
            margin: 0; font-size: var(--se-product-title-size, 16px); font-weight: 650; line-height: 1.3;
            min-height: calc(var(--se-product-title-size, 16px) * 1.3 * 2);
            display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 2; overflow: hidden;
          }
          .slideease-container-${uniqueId} .se-product-card__price {
            margin: 0; color: #5f5a72; font-weight: 600; font-size: var(--se-product-price-size, 14px);
          }
          .slideease-container-${uniqueId} .se-product-card__actions {
            display: flex; flex-wrap: wrap; gap: 0.45rem; align-items: center;
          }
          .slideease-container-${uniqueId} .se-product-card__shop,
          .slideease-container-${uniqueId} .se-product-card__cta {
            display: inline-flex; align-items: center; justify-content: center;
            padding: var(--se-cta-pad, 12px) calc(var(--se-cta-pad, 12px) * 1.75);
            border-radius: var(--se-cta-radius, 50px);
            border: var(--se-cta-border-width, 0px) solid var(--se-product-cta-border, transparent);
            background: var(--se-product-cta-bg, #170f49); color: var(--se-product-cta-color, #fff);
            font-size: var(--se-cta-font-size, 16px); font-weight: 650;
            line-height: 1; transition: background 0.2s ease, color 0.2s ease, border-color 0.2s ease;
            text-decoration: none; cursor: pointer; font-family: inherit;
          }
          .slideease-container-${uniqueId} .se-product-card__atc {
            display: inline-flex; align-items: center; justify-content: center;
            padding: var(--se-atc-pad, 10px) calc(var(--se-atc-pad, 10px) * 1.75);
            border-radius: var(--se-atc-radius, 50px);
            border: var(--se-atc-border-width, 1px) solid var(--se-atc-border, #170f49);
            background: var(--se-atc-bg, #fff); color: var(--se-atc-color, #170f49);
            font-size: var(--se-atc-font-size, 14px); font-weight: 650;
            line-height: 1; transition: background 0.2s ease, color 0.2s ease, border-color 0.2s ease, opacity 0.2s ease;
            text-decoration: none; cursor: pointer; font-family: inherit;
          }
          .slideease-container-${uniqueId} .se-product-card__atc:hover:not(:disabled) {
            background: var(--se-atc-hover-bg, #170f49);
            color: var(--se-atc-hover-color, #fff);
            border-color: var(--se-atc-hover-bg, #170f49);
          }
          .slideease-container-${uniqueId} .se-product-card__atc:disabled {
            opacity: 0.65;
            cursor: wait;
          }
          .slideease-container-${uniqueId} .se-product-card__shop:hover,
          .slideease-container-${uniqueId} .se-product-card__cta:hover {
            background: var(--se-product-cta-hover-bg, var(--se-product-cta-bg, #170f49));
            color: var(--se-product-cta-hover-color, var(--se-product-cta-color, #fff));
          }
          .slideease-container-${uniqueId} .se-section-heading {
            margin: 0 0 var(--se-section-heading-gap, 16px); text-align: center; color: #170f49;
            font-size: var(--se-section-heading-size, 28px);
            font-weight: 700; letter-spacing: -0.02em;
          }
          .slideease-container-${uniqueId}.se-root--products {
            overflow: visible;
            padding-bottom: 0.25rem;
          }
          .slideease-container-${uniqueId}.se-root--products .se-slider {
            height: auto !important;
          }
          .slideease-container-${uniqueId}.se-root--products .slick-list {
            height: auto !important;
          }
          .slideease-container-${uniqueId}.se-root--products .slick-track {
            display: flex !important;
            align-items: stretch !important;
            height: auto !important;
          }
          .slideease-container-${uniqueId}.se-root--products .slick-slide {
            height: auto !important;
            float: none !important;
            display: flex !important;
          }
          .slideease-container-${uniqueId}.se-root--products .slick-slide > div {
            height: auto !important;
            min-height: 100%;
            width: 100%;
            display: flex;
          }
          .slideease-container-${uniqueId}.se-root--products .slick-slide > div > div {
            display: flex;
            width: 100%;
            min-height: 100%;
          }
          .slideease-container-${uniqueId}.se-root--products .slideease-dots-${uniqueId} {
            position: static !important;
            left: auto !important;
            bottom: auto !important;
            transform: none !important;
            width: fit-content;
            margin: var(--se-pagination-gap, 16px) auto 5px !important;
            background: #f3f4f6;
            border: 1px solid #e7e7e7;
            backdrop-filter: none;
            -webkit-backdrop-filter: none;
          }
          .slideease-container-${uniqueId}.se-root--products .se-dot {
            background: rgba(23, 15, 73, 0.22);
          }
          .slideease-container-${uniqueId}.se-root--products .slideease-dots-${uniqueId} li.slick-active .se-dot {
            background: #170f49;
          }
          .slideease-container-${uniqueId}.se-root--products .se-progress { display: none !important; }
          .slideease-container-${uniqueId}[data-effect="product-carousel"] .se-product-card,
          .slideease-container-${uniqueId}[data-effect="product-showcase"] .se-product-card,
          .slideease-container-${uniqueId}[data-effect="collection-rail"] .se-product-card {
            transform: none !important;
            animation: none !important;
          }
          .slideease-container-${uniqueId}[data-effect="product-showcase"] .slick-center .se-product-card {
            box-shadow: none;
          }
          .slideease-container-${uniqueId}[data-effect="hero-fullwidth"] .se-copy,
          .slideease-container-${uniqueId}[data-effect="hero-video"] .se-copy,
          .slideease-container-${uniqueId}[data-effect="hero-boxed"] .se-copy {
            justify-content: flex-end;
            padding: clamp(1.5rem, 5vw, 3.5rem);
          }
          .slideease-container-${uniqueId}[data-effect="hero-fullwidth"] .se-overlay__tint,
          .slideease-container-${uniqueId}[data-effect="hero-video"] .se-overlay__tint,
          .slideease-container-${uniqueId}[data-effect="hero-boxed"] .se-overlay__tint {
            opacity: 1 !important;
            background:
              linear-gradient(90deg, rgba(11,13,18,0.72) 0%, rgba(11,13,18,0.35) 48%, rgba(11,13,18,0.18) 100%),
              linear-gradient(180deg, rgba(11,13,18,0.12) 0%, rgba(11,13,18,0.55) 100%) !important;
          }
          .slideease-container-${uniqueId}[data-effect="hero-fullwidth"] .se-eyebrow,
          .slideease-container-${uniqueId}[data-effect="hero-video"] .se-eyebrow,
          .slideease-container-${uniqueId}[data-effect="hero-boxed"] .se-eyebrow {
            display: inline-flex; width: fit-content; padding: 0.28rem 0.7rem; border-radius: 999px;
            border: 1px solid rgba(255,255,255,0.35); background: rgba(255,255,255,0.08);
            letter-spacing: 0.08em; text-transform: uppercase; font-size: 0.72rem;
          }
          .slideease-container-${uniqueId}[data-effect="hero-fullwidth"] .se-cta,
          .slideease-container-${uniqueId}[data-effect="hero-video"] .se-cta,
          .slideease-container-${uniqueId}[data-effect="hero-boxed"] .se-cta {
            --se-cta-bg: #ffffff;
            --se-cta-hover-bg: #f3f4f6;
            --se-cta-color: #170f49;
            --se-cta-border: transparent;
            --se-cta-border-width: 0px;
          }
          .slideease-container-${uniqueId}[data-effect="hero-boxed"] .slideease-frame {
            box-shadow: 0 18px 48px rgba(23,15,73,0.1);
          }
          .slideease-container-${uniqueId} .se-testimonial {
            min-height: var(--se-height); display: flex; flex-direction: column; align-items: center; justify-content: center;
            gap: 0.85rem; text-align: center; padding: 2rem 1.5rem; background: #fff; border: 1px solid #170f49; color: #170f49;
          }
          .slideease-container-${uniqueId} .se-testimonial__quote { font-size: 2.5rem; line-height: 1; color: #ed8104; font-weight: 700; }
          .slideease-container-${uniqueId} .se-testimonial__text { margin: 0; max-width: 36rem; font-size: clamp(1.05rem, 2.4vw, 1.4rem); line-height: 1.45; font-weight: 550; }
          .slideease-container-${uniqueId} .se-testimonial__author { display: flex; align-items: center; gap: 0.7rem; margin-top: 0.35rem; text-align: left; }
          .slideease-container-${uniqueId} .se-testimonial__author span { display: block; color: #5f5a72; font-size: 0.82rem; }
          .slideease-container-${uniqueId} .se-testimonial__avatar { width: 46px; height: 46px; border-radius: 50%; object-fit: cover; border: 2px solid #e7e7e7; }
          .slideease-container-${uniqueId} .se-logo-cell {
            height: var(--se-height); display: flex; align-items: center; justify-content: center; padding: 0.75rem 1rem;
            filter: grayscale(1); opacity: 0.78;
          }
          .slideease-container-${uniqueId} .se-logo-cell img { max-width: 140px; max-height: 64px; object-fit: contain; }
          .slideease-container-${uniqueId} .se-logo-cell span { font-weight: 700; color: #170f49; }
          .slideease-container-${uniqueId} .se-story { position: relative; overflow: hidden; height: var(--se-render-height); background: #111; }
          .slideease-container-${uniqueId} .se-story__media { position: absolute; inset: 0; }
          .slideease-container-${uniqueId} .se-story__media .se-media { width: 100%; height: 100%; object-fit: cover; }
          .slideease-container-${uniqueId} .se-story__label {
            position: absolute; left: 1rem; bottom: 1rem; z-index: 2; color: #fff; font-weight: 700;
            text-shadow: 0 8px 24px rgba(0,0,0,0.45); font-size: 1.05rem;
          }
          .slideease-container-${uniqueId} .se-announce {
            min-height: var(--se-height); display: flex; align-items: center; justify-content: center; gap: 0.85rem;
            padding: 0.65rem 1rem; flex-wrap: wrap; text-align: center;
          }
          .slideease-container-${uniqueId} .se-announce__text { font-weight: 600; font-size: 0.95rem; }
          .slideease-container-${uniqueId} .se-announce__cta {
            display: inline-flex; padding: 0.28rem 0.7rem; border-radius: 999px; border: 1px solid rgba(255,255,255,0.45);
            color: inherit; text-decoration: none; font-size: 0.78rem; font-weight: 700;
          }
          .slideease-container-${uniqueId} .se-frame--boxed { max-width: 100%; margin-inline: auto; }
    `
  }

  function renderSlider(data) {
    const settings = data.settings || {}
    const slides = (data.slides || []).filter((s) => s && s.isVisible !== false)
    if (!slides.length) {
      renderMessage("No slides available", "This slider does not have any visible slides yet.")
      return
    }

    trackEvent("view", slides[0]?.id)
    const { config: slickConfig, effect } = buildSlickConfig(settings)
    const frameHeight = resolveFrameHeight(settings)
    const isProductLayout = ["product-carousel", "product-showcase", "collection-rail"].includes(effect)
    const showArrows =
      settings.arrows !== false &&
      !["marquee", "logo-grid", "announcement"].includes(effect)
    const showProgress =
      Boolean(settings.autoplay) &&
      !["marquee", "logo-grid", "announcement"].includes(effect) &&
      !isProductLayout &&
      slides.length > 1
    const arrowBg = escapeHtml(settings.arrowBg || "rgba(15,23,42,0.55)")
    const arrowColor = escapeHtml(settings.arrowColor || "#ffffff")
    const dotColor = escapeHtml(settings.dotColor || "#1a2f4a")
    const autoplayMs = Number(settings.autoplaySpeed) || 3200
    const sectionHeadingSize = Number(settings.sectionHeadingFontSize) || 28
    const sectionHeadingGap = Math.max(0, Number(settings.sectionHeadingGap ?? 16))
    const productTitleSize = Number(settings.productTitleFontSize) || 16
    const productPriceSize = Number(settings.productPriceFontSize) || 14
    const productContentGap = Math.max(0, Number(settings.productContentGap ?? 8))
    const paginationGap = Math.max(0, Number(settings.paginationGap) || 16)
    const productCtaBg = escapeHtml(settings.ctaBackground || "#170f49")
    const productCtaColor = escapeHtml(settings.ctaTextColor || "#ffffff")
    const productCtaHover = escapeHtml(settings.ctaHoverBackground || settings.ctaBackground || "#170f49")
    const productCtaHoverColor = escapeHtml(settings.ctaHoverTextColor || settings.ctaTextColor || "#ffffff")
    const productCtaBorder = escapeHtml(settings.ctaBorderColor || "transparent")
    const ctaPad = Math.max(
      4,
      Number(
        settings.ctaPadding ??
          settings.ctaPaddingY ??
          settings.productCtaPaddingY ??
          12,
      ),
    )
    const ctaFontSize = Math.min(Math.max(Number(settings.ctaFontSize ?? settings.productCtaFontSize ?? 16), 10), 24)
    const ctaRadius = Math.min(Math.max(Number(settings.ctaBorderRadius ?? 50), 0), 50)
    const ctaBorderWidth = Math.min(Math.max(Number(settings.ctaBorderWidth ?? 1), 0), 6)
    const atcPad = Math.max(4, Number(settings.atcPadding ?? settings.ctaPadding ?? 10))
    const atcFontSize = Math.min(Math.max(Number(settings.atcFontSize ?? 14), 10), 24)
    const atcRadius = Math.min(Math.max(Number(settings.atcBorderRadius ?? 50), 0), 50)
    const atcBorderWidth = Math.min(Math.max(Number(settings.atcBorderWidth ?? 1), 0), 6)
    const atcBg = escapeHtml(settings.atcBackground || "#ffffff")
    const atcColor = escapeHtml(settings.atcTextColor || "#170f49")
    const atcBorder = escapeHtml(settings.atcBorderColor || "#170f49")
    const atcHoverBg = escapeHtml(settings.atcHoverBackground || "#170f49")
    const atcHoverColor = escapeHtml(settings.atcHoverTextColor || "#ffffff")
    const productStyleVars = isProductLayout
      ? `--se-section-heading-size:${sectionHeadingSize}px;--se-section-heading-gap:${sectionHeadingGap}px;--se-product-title-size:${productTitleSize}px;--se-product-price-size:${productPriceSize}px;--se-product-content-gap:${productContentGap}px;--se-pagination-gap:${paginationGap}px;--se-product-cta-bg:${productCtaBg};--se-product-cta-color:${productCtaColor};--se-product-cta-hover-bg:${productCtaHover};--se-product-cta-hover-color:${productCtaHoverColor};--se-product-cta-border:${productCtaBorder};--se-atc-bg:${atcBg};--se-atc-color:${atcColor};--se-atc-border:${atcBorder};--se-atc-hover-bg:${atcHoverBg};--se-atc-hover-color:${atcHoverColor};--se-atc-pad:${atcPad}px;--se-atc-font-size:${atcFontSize}px;--se-atc-radius:${atcRadius}px;--se-atc-border-width:${atcBorderWidth}px;`
      : ""
    const ctaStyleVars = `--se-cta-pad:${ctaPad}px;--se-cta-font-size:${ctaFontSize}px;--se-cta-radius:${ctaRadius}px;--se-cta-border-width:${ctaBorderWidth}px;`
    const isMulti =
      [
        "center",
        "coverflow",
        "autoplay",
        "variable-width",
        "marquee",
        "product-carousel",
        "product-showcase",
        "collection-rail",
        "logo-grid",
      ].includes(effect) || Number(settings.slidesToShow) > 1
    const isUtilityCompact = ["announcement", "logo-grid", "testimonials"].includes(effect)

    const thumbs = settings.thumbnails
      ? `<div class="slideease-thumbs-${uniqueId} se-thumbs" aria-label="Slide thumbnails">${slides
          .map(
            (slide) => `
            <div class="se-thumb">
              <button type="button" class="se-thumb__btn" tabindex="-1">
                <img src="${escapeHtml(safeUrl(slide.imageUrl))}" alt="" loading="lazy" />
              </button>
            </div>`,
          )
          .join("")}</div>`
      : ""

    insertAdjacent(`
      <section class="slideease-container-${uniqueId} se-root${isMulti ? " se-root--multi" : " se-root--hero"}${isUtilityCompact ? " se-root--utility" : ""}${isProductLayout ? " se-root--products" : ""}${effect === "hero-boxed" ? " se-root--boxed" : ""}${effect === "announcement" ? " se-root--announce" : ""}" data-effect="${escapeHtml(effect)}" style="--se-height:${frameHeight}px;--se-dot:${dotColor};--se-arrow-bg:${arrowBg};--se-arrow-color:${arrowColor};--se-autoplay:${autoplayMs}ms;${ctaStyleVars}${productStyleVars}" aria-roledescription="carousel">
        ${
          ["product-carousel", "product-showcase", "collection-rail"].includes(effect) && settings.sectionHeading
            ? `<h2 class="se-section-heading">${escapeHtml(settings.sectionHeading)}</h2>`
            : ""
        }
        ${
          showArrows
            ? `
          <button type="button" class="slideease-prev-${uniqueId} se-nav se-nav--prev" aria-label="Previous slide">${CHEVRON_LEFT}</button>
          <button type="button" class="slideease-next-${uniqueId} se-nav se-nav--next" aria-label="Next slide">${CHEVRON_RIGHT}</button>
        `
            : ""
        }
        <div id="${uniqueId}" class="slideease-slider-${uniqueId} se-slider">
          ${slides.map((slide) => renderSlide(slide, settings, effect)).join("")}
        </div>
        ${showProgress ? `<div class="se-progress" aria-hidden="true"><span class="se-progress__bar"></span></div>` : ""}
        ${thumbs}
        <style>
          ${premiumLayoutCss()}
          .slideease-container-${uniqueId}.se-root {
            --se-ease: cubic-bezier(0.22, 1, 0.36, 1);
            --se-render-height: clamp(420px, 58vw, var(--se-height));
            position: relative;
            width: 100%;
            max-width: 100%;
            margin: 0;
            padding: 0;
            font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            color: #0f172a;
            isolation: isolate;
          }
          .slideease-container-${uniqueId}.se-root--hero {
            width: 100%;
            max-width: 100%;
            margin-left: 0;
            margin-right: 0;
            overflow: hidden;
          }
          .slideease-container-${uniqueId},
          .slideease-container-${uniqueId} * { box-sizing: border-box; }
          .slideease-container-${uniqueId} .se-slider,
          .slideease-container-${uniqueId} .slick-list {
            width: 100% !important;
            max-width: 100%;
          }
          .slideease-container-${uniqueId} .slick-list { overflow: hidden; }
          .slideease-container-${uniqueId} .slick-track {
            max-width: none;
          }
          .slideease-container-${uniqueId} .slick-slide > div { height: 100%; }
          .slideease-container-${uniqueId} .slick-prev,
          .slideease-container-${uniqueId} .slick-next { display: none !important; }
          .slideease-container-${uniqueId}.se-root--hero .se-slider,
          .slideease-container-${uniqueId}.se-root--hero .slick-list,
          .slideease-container-${uniqueId}.se-root--hero .slick-track,
          .slideease-container-${uniqueId}.se-root--hero .slick-slide,
          .slideease-container-${uniqueId}.se-root--hero .slick-slide > div,
          .slideease-container-${uniqueId}.se-root--hero [data-slideease-slide-id],
          .slideease-container-${uniqueId}.se-root--hero [data-slideease-slide-id] > div {
            height: var(--se-render-height) !important;
            min-height: var(--se-render-height) !important;
          }

          .slideease-container-${uniqueId} .slideease-frame {
            position: relative;
            width: 100%;
            height: var(--se-render-height);
            min-height: var(--se-render-height);
            overflow: hidden;
            background: #111827;
          }
          .slideease-container-${uniqueId}.se-root--multi .slideease-frame {
            height: clamp(320px, 42vw, calc(var(--se-height) * 0.85));
            min-height: 300px;
            box-shadow: 0 24px 60px rgba(15, 23, 42, 0.16);
          }
          .slideease-container-${uniqueId}.se-root--multi .se-copy {
            padding: clamp(0.9rem, 2vw, 1.5rem);
            padding-bottom: clamp(1.5rem, 3vw, 2.25rem);
          }
          .slideease-container-${uniqueId}.se-root--multi .se-eyebrow {
            font-size: clamp(0.62rem, 0.9vw, 0.7rem);
            padding: 0.32rem 0.58rem;
            letter-spacing: 0.12em;
          }
          .slideease-container-${uniqueId}.se-root--multi .se-heading {
            max-width: 100%;
            font-size: clamp(1.35rem, 2.4vw, 2.1rem);
            letter-spacing: -0.03em;
          }
          .slideease-container-${uniqueId}.se-root--multi .se-desc {
            font-size: clamp(0.85rem, 1.3vw, 1rem);
            -webkit-line-clamp: 2;
          }
          .slideease-container-${uniqueId}.se-root--multi .se-copy-plate {
            gap: 0.4rem;
            max-width: 100%;
          }
          .slideease-container-${uniqueId} .se-media-wrap {
            position: absolute;
            inset: 0;
            z-index: 0;
          }
          .slideease-container-${uniqueId} .se-media {
            width: 100%;
            height: 100%;
            display: block;
            transform: scale(1.025);
            transition: transform 7s var(--se-ease), filter 0.7s ease;
          }
          .slideease-container-${uniqueId} .slick-current .se-media {
            transform: scale(1);
          }
          .slideease-container-${uniqueId} .se-media--empty {
            background: linear-gradient(135deg, #1a2f4a, #0f172a);
          }

          .slideease-container-${uniqueId} .se-overlay {
            position: absolute;
            inset: 0;
            z-index: 1;
            pointer-events: none;
          }
          .slideease-container-${uniqueId} .se-overlay__tint {
            position: absolute;
            inset: 0;
          }
          .slideease-container-${uniqueId} .se-overlay__grade {
            position: absolute;
            inset: 0;
            background:
              linear-gradient(180deg, rgba(5,8,15,0.1) 0%, transparent 34%, rgba(5,8,15,0.1) 58%, rgba(5,8,15,0.72) 100%),
              linear-gradient(90deg, rgba(5,8,15,0.28) 0%, transparent 48%, rgba(5,8,15,0.08) 100%);
          }

          .slideease-container-${uniqueId} .se-copy {
            position: absolute;
            inset: 0;
            z-index: 2;
            display: flex;
            flex-direction: column;
            justify-content: flex-end;
            gap: 0;
            padding: clamp(1.25rem, 3.5vw, 3rem);
            padding-bottom: clamp(3rem, 6vw, 4.5rem);
            max-width: 100%;
            pointer-events: none;
            overflow: hidden;
          }
          .slideease-container-${uniqueId} .se-copy--left { justify-content: flex-end; }
          .slideease-container-${uniqueId} .se-copy--right { justify-content: flex-end; }
          .slideease-container-${uniqueId} .se-copy--center {
            justify-content: center;
            padding-top: clamp(2rem, 5vw, 4rem);
            padding-bottom: clamp(2.5rem, 6vw, 4.5rem);
          }
          .slideease-container-${uniqueId} .se-copy-plate {
            pointer-events: auto;
            display: flex;
            flex-direction: column;
            gap: clamp(0.4rem, 1vw, 0.75rem);
            max-width: min(46rem, 100%);
            max-height: 100%;
            min-height: 0;
            padding: 0;
            background: transparent;
            filter: drop-shadow(0 3px 18px rgba(0,0,0,0.32));
            overflow: hidden;
          }
          .slideease-container-${uniqueId} .se-copy--center .se-copy-plate { margin: 0 auto; text-align: center; align-items: center; }
          .slideease-container-${uniqueId} .se-copy--left .se-copy-plate { margin-right: auto; align-items: flex-start; }
          .slideease-container-${uniqueId} .se-copy--right .se-copy-plate { margin-left: auto; align-items: flex-end; }

          .slideease-container-${uniqueId} .se-eyebrow {
            margin: 0;
            width: fit-content;
            max-width: 100%;
            padding: 0.42rem 0.72rem;
            border: 1px solid rgba(255,255,255,0.36);
            border-radius: 999px;
            background: rgba(255,255,255,0.12);
            backdrop-filter: blur(8px);
            -webkit-backdrop-filter: blur(8px);
            font-size: clamp(0.68rem, 1vw, 0.76rem);
            font-weight: 700;
            letter-spacing: 0.16em;
            text-transform: uppercase;
            line-height: 1.2;
            flex-shrink: 0;
          }
          .slideease-container-${uniqueId} .se-heading {
            margin: 0;
            max-width: 18ch;
            color: inherit;
            font-size: clamp(2.6rem, 5.6vw, 5rem);
            font-weight: 780;
            letter-spacing: -0.045em;
            line-height: 1.05;
            text-wrap: balance;
            text-shadow: 0 2px 24px rgba(0,0,0,0.28);
            flex-shrink: 1;
            min-height: 0;
          }
          .slideease-container-${uniqueId} .se-desc {
            margin: 0;
            max-width: 38rem;
            color: inherit;
            font-size: clamp(1.1rem, 1.8vw, 1.35rem);
            line-height: 1.5;
            opacity: 0.92;
            display: -webkit-box;
            overflow: hidden;
            -webkit-line-clamp: 3;
            -webkit-box-orient: vertical;
            flex-shrink: 1;
            min-height: 0;
          }
          .slideease-container-${uniqueId} .se-cta {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            min-height: 0;
            margin-top: 0.35rem;
            padding: var(--se-cta-pad, 12px) calc(var(--se-cta-pad, 12px) * 1.75);
            border: var(--se-cta-border-width) solid var(--se-cta-border);
            border-radius: var(--se-cta-radius);
            background: var(--se-cta-bg);
            color: var(--se-cta-color);
            text-decoration: none;
            font-size: var(--se-cta-font-size);
            font-weight: 750;
            line-height: 1;
            letter-spacing: 0.01em;
            flex-shrink: 0;
            box-shadow:
              inset 0 1px 0 rgba(255,255,255,0.2),
              0 14px 34px rgba(5,8,15,0.32);
            transition:
              transform 0.25s var(--se-ease),
              box-shadow 0.25s ease,
              background 0.25s ease,
              filter 0.25s ease;
          }
          .slideease-container-${uniqueId} .se-cta span { padding-inline: 0.1rem 0.55rem; }
          .slideease-container-${uniqueId} .se-cta--no-icon { padding-inline: calc(var(--se-cta-pad, 12px) * 1.75); }
          .slideease-container-${uniqueId} .se-cta--no-icon span { padding-inline: 0; }
          .slideease-container-${uniqueId} .se-cta svg {
            width: var(--se-cta-icon-size, 34px);
            height: var(--se-cta-icon-size, 34px);
            padding: var(--se-cta-icon-pad, 8px);
            border-radius: 50%;
            box-sizing: border-box;
            color: var(--se-cta-icon-color);
            background: var(--se-cta-icon-bg);
            transition: transform 0.25s var(--se-ease), filter 0.25s ease;
          }
          .slideease-container-${uniqueId} .se-cta:hover {
            background: var(--se-cta-hover-bg, var(--se-cta-bg));
            transform: translateY(-3px);
            filter: brightness(1.08);
            box-shadow:
              inset 0 1px 0 rgba(255,255,255,0.24),
              0 18px 42px rgba(5,8,15,0.38);
          }
          .slideease-container-${uniqueId} .se-cta:hover svg {
            transform: translateX(3px);
            filter: brightness(1.12);
          }
          .slideease-container-${uniqueId} .se-cta:active {
            transform: translateY(-1px) scale(0.98);
          }
          .slideease-container-${uniqueId} .se-cta:focus-visible {
            outline: 2px solid #fff;
            outline-offset: 3px;
          }

          .slideease-container-${uniqueId} .se-nav {
            position: absolute;
            top: 50%;
            transform: translateY(-50%);
            z-index: 8;
            width: 50px;
            height: 50px;
            border: 1px solid rgba(255,255,255,0.32);
            border-radius: 999px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            color: var(--se-arrow-color);
            background: var(--se-arrow-bg);
            background: color-mix(in srgb, var(--se-arrow-bg), transparent 18%);
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
            box-shadow: 0 12px 32px rgba(5,8,15,0.2);
            opacity: 0.82;
            transition: opacity 0.25s ease, transform 0.25s var(--se-ease), background 0.2s ease;
          }
          .slideease-container-${uniqueId}:hover .se-nav,
          .slideease-container-${uniqueId}:focus-within .se-nav { opacity: 1; }
          .slideease-container-${uniqueId} .se-nav--prev { left: clamp(14px, 2.4vw, 36px); }
          .slideease-container-${uniqueId} .se-nav--next { right: clamp(14px, 2.4vw, 36px); }
          .slideease-container-${uniqueId} .se-nav:hover { transform: translateY(-50%) scale(1.06); }
          .slideease-container-${uniqueId} .se-nav:focus-visible {
            opacity: 1;
            outline: 2px solid #fff;
            outline-offset: 2px;
          }

          .slideease-container-${uniqueId} .slideease-dots-${uniqueId} {
            position: absolute;
            left: 50%;
            bottom: 18px;
            transform: translateX(-50%);
            z-index: 7;
            display: flex !important;
            align-items: center;
            gap: 6px;
            margin: 0;
            padding: 7px 9px;
            list-style: none;
            border-radius: 999px;
            background: rgba(5, 8, 15, 0.28);
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
            border: 1px solid rgba(255,255,255,0.14);
          }
          .slideease-container-${uniqueId} .slideease-dots-${uniqueId} li {
            margin: 0;
            width: auto;
            height: auto;
          }
          .slideease-container-${uniqueId} .slideease-dots-${uniqueId} li button {
            display: block;
            width: auto;
            height: auto;
            padding: 0;
            border: 0;
            background: transparent;
            cursor: pointer;
          }
          .slideease-container-${uniqueId} .slideease-dots-${uniqueId} li button:before { display: none; content: none; }
          .slideease-container-${uniqueId} .se-dot {
            display: block;
            width: 18px;
            height: 3px;
            border-radius: 999px;
            background: rgba(255,255,255,0.42);
            transition: width 0.3s var(--se-ease), background 0.25s ease;
          }
          .slideease-container-${uniqueId} .slideease-dots-${uniqueId} li.slick-active .se-dot {
            width: 38px;
            background: #fff;
          }

          .slideease-container-${uniqueId} .se-progress {
            position: absolute;
            left: 0;
            right: 0;
            bottom: 0;
            height: 3px;
            z-index: 9;
            background: rgba(255,255,255,0.16);
            overflow: hidden;
          }
          .slideease-container-${uniqueId} .se-progress__bar {
            display: block;
            height: 100%;
            width: 0%;
            background: linear-gradient(90deg, #fff, #94a3b8);
          }
          .slideease-container-${uniqueId}.se-progress-run .se-progress__bar {
            animation: seProgress var(--se-autoplay) linear forwards;
          }
          @keyframes seProgress { from { width: 0%; } to { width: 100%; } }

          .slideease-container-${uniqueId} .se-thumbs {
            margin-top: 16px;
            padding: 0 clamp(12px, 3vw, 28px);
            max-width: 1100px;
            margin-left: auto;
            margin-right: auto;
          }
          .slideease-container-${uniqueId} .se-thumb { padding: 0 5px; }
          .slideease-container-${uniqueId} .se-thumb__btn {
            display: block;
            width: 100%;
            padding: 0;
            border: 2px solid transparent;
            border-radius: 12px;
            overflow: hidden;
            background: #0f172a;
            cursor: pointer;
            opacity: 0.7;
            transition: opacity 0.2s ease, border-color 0.2s ease, transform 0.2s ease;
          }
          .slideease-container-${uniqueId} .se-thumbs .slick-current .se-thumb__btn {
            opacity: 1;
            border-color: #fff;
            transform: translateY(-2px);
          }
          .slideease-container-${uniqueId} .se-thumb__btn img {
            width: 100%;
            height: 72px;
            object-fit: cover;
            display: block;
          }

          /* Motion presets */
          @keyframes seCdnFade { from { opacity: 0.12; } to { opacity: 1; } }
          @keyframes seCdnSlide { from { opacity: 0.4; transform: translateX(36px); } to { opacity: 1; transform: translateX(0); } }
          @keyframes seCdnZoom { from { opacity: 0.2; transform: scale(1.14); } to { opacity: 1; transform: scale(1); } }
          @keyframes seCdnFlip { from { opacity: 0; transform: perspective(1200px) rotateY(82deg); } to { opacity: 1; transform: perspective(1200px) rotateY(0); } }
          @keyframes seCdnCube { from { opacity: 0.2; transform: perspective(1200px) rotateX(68deg); } to { opacity: 1; transform: perspective(1200px) rotateX(0); } }
          @keyframes seCdnRise { from { opacity: 0; transform: translateY(26px); } to { opacity: 1; transform: translateY(0); } }
          @keyframes seCdnKen { from { transform: scale(1); } to { transform: scale(1.14) translate(-1.2%, -0.8%); } }
          @keyframes seCdnBlur { from { filter: blur(16px) saturate(0.7); opacity: 0.4; transform: scale(1.04); } to { filter: blur(0) saturate(1); opacity: 1; transform: scale(1); } }
          @keyframes seCdnWipe { from { clip-path: polygon(0 0, 0 0, -20% 100%, 0 100%); } to { clip-path: polygon(0 0, 120% 0, 100% 100%, 0 100%); } }
          @keyframes seCdnSplitL { from { transform: translateX(0); } to { transform: translateX(-102%); } }
          @keyframes seCdnSplitR { from { transform: translateX(0); } to { transform: translateX(102%); } }
          @keyframes seCdnParallax { from { transform: scale(1.16) translateX(-3%); } to { transform: scale(1.06) translateX(1%); } }
          @keyframes seCopyIn { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }

          .slideease-container-${uniqueId} .slick-current .se-frame-fade { animation: seCdnFade 0.75s var(--se-ease); }
          .slideease-container-${uniqueId} .slick-current .se-frame-slide { animation: seCdnSlide 0.65s var(--se-ease); }
          .slideease-container-${uniqueId} .slick-current .se-frame-zoom { animation: seCdnZoom 0.8s var(--se-ease); }
          .slideease-container-${uniqueId} .slick-current .se-frame-flip { animation: seCdnFlip 0.85s var(--se-ease); }
          .slideease-container-${uniqueId} .slick-current .se-frame-cube { animation: seCdnCube 0.9s var(--se-ease); }
          .slideease-container-${uniqueId} .slick-current .se-frame-blur-reveal { animation: seCdnBlur 0.95s var(--se-ease); }
          .slideease-container-${uniqueId} .slick-current .se-frame-wipe { animation: seCdnWipe 0.95s cubic-bezier(0.65,0,0.35,1); }
          .slideease-container-${uniqueId} .slick-current .se-frame-ken-burns .se-media { animation: seCdnKen 5.5s ease-out forwards; }
          .slideease-container-${uniqueId} .slick-current .se-frame-parallax .se-media { animation: seCdnParallax 0.95s var(--se-ease) forwards; }
          .slideease-container-${uniqueId} .slick-current .se-copy-plate > * { animation: seCopyIn 0.7s var(--se-ease) both; }
          .slideease-container-${uniqueId} .slick-current .se-copy-plate > *:nth-child(2) { animation-delay: 0.08s; }
          .slideease-container-${uniqueId} .slick-current .se-copy-plate > *:nth-child(3) { animation-delay: 0.15s; }
          .slideease-container-${uniqueId} .slick-current .se-copy-plate > *:nth-child(4) { animation-delay: 0.22s; }
          .slideease-container-${uniqueId} .slick-current .se-frame-slide-up .se-copy-plate > * { animation-name: seCdnRise; }

          .slideease-container-${uniqueId} .se-split-panel {
            position: absolute; top: 0; bottom: 0; width: 52%; z-index: 4; pointer-events: none;
            background: linear-gradient(135deg, #0b1220, #1a2f4a);
          }
          .slideease-container-${uniqueId} .se-split-panel--left { left: 0; transform: translateX(-102%); }
          .slideease-container-${uniqueId} .se-split-panel--right { right: 0; transform: translateX(102%); }
          .slideease-container-${uniqueId} .slick-current .se-split-panel--left { animation: seCdnSplitL 0.85s cubic-bezier(0.65,0,0.35,1) both; }
          .slideease-container-${uniqueId} .slick-current .se-split-panel--right { animation: seCdnSplitR 0.85s cubic-bezier(0.65,0,0.35,1) both; }

          .slideease-container-${uniqueId}[data-effect="coverflow"] {
            perspective: 1400px;
          }
          .slideease-container-${uniqueId}[data-effect="coverflow"] .slick-slide:not(.slick-center) .slideease-frame {
            transform: scale(0.88) rotateY(16deg);
            opacity: 0.68;
            transition: transform 0.55s var(--se-ease), opacity 0.4s ease;
          }
          .slideease-container-${uniqueId}[data-effect="coverflow"] .slick-center .slideease-frame,
          .slideease-container-${uniqueId}[data-effect="center"] .slick-center .slideease-frame {
            transform: scale(1.04);
            transition: transform 0.55s var(--se-ease);
            z-index: 2;
          }
          .slideease-container-${uniqueId}[data-effect="center"] .slick-slide:not(.slick-center) .slideease-frame {
            opacity: 0.55;
            transform: scale(0.92);
            transition: transform 0.5s var(--se-ease), opacity 0.4s ease;
          }
          .slideease-container-${uniqueId}[data-effect="autoplay"] .slideease-frame,
          .slideease-container-${uniqueId}[data-effect="variable-width"] .slideease-frame {
            border-radius: 14px;
          }
          .slideease-container-${uniqueId}[data-effect="cards-stack"] .slideease-frame {
            box-shadow: 0 24px 60px rgba(15,23,42,0.28);
          }
          .slideease-container-${uniqueId}[data-effect="marquee"] .slideease-frame {
            border-radius: 12px;
          }
          .slideease-container-${uniqueId}[data-effect="vertical"] .slick-list {
            height: var(--se-render-height) !important;
          }

          @media (max-width: 768px) {
            .slideease-container-${uniqueId}.se-root {
              --se-render-height: clamp(380px, 72vw, var(--se-height));
            }
            .slideease-container-${uniqueId} .slideease-frame {
              height: var(--se-render-height);
              min-height: var(--se-render-height);
            }
            .slideease-container-${uniqueId}.se-root--multi .slideease-frame {
              height: clamp(280px, 68vw, 420px);
              min-height: 260px;
            }
            .slideease-container-${uniqueId} .se-nav { opacity: 0.9; width: 42px; height: 42px; }
            .slideease-container-${uniqueId} .se-heading { max-width: 100%; font-size: clamp(2.15rem, 9vw, 3.4rem); }
            .slideease-container-${uniqueId} .se-copy {
              padding: 1.25rem;
              padding-bottom: 3.5rem;
            }
            .slideease-container-${uniqueId} .se-copy--center {
              padding-top: 2.25rem;
              padding-bottom: 3.25rem;
            }
            .slideease-container-${uniqueId} .se-copy-plate { gap: 0.45rem; }
            .slideease-container-${uniqueId} .se-desc {
              display: -webkit-box;
              overflow: hidden;
              -webkit-line-clamp: 2;
              -webkit-box-orient: vertical;
            }
            .slideease-container-${uniqueId} .slideease-dots-${uniqueId} { bottom: 12px; }
            .slideease-container-${uniqueId}.se-root--products .slideease-dots-${uniqueId} {
              position: static !important;
              bottom: auto !important;
              margin: var(--se-pagination-gap, 16px) auto 5px !important;
            }
          }
          @media (prefers-reduced-motion: reduce) {
            .slideease-container-${uniqueId} *,
            .slideease-container-${uniqueId} .se-progress__bar { animation: none !important; transition: none !important; }
          }
        </style>
      </section>
    `)

    const root = document.querySelector(`.slideease-container-${uniqueId}`)
    const allowFullBleed =
      !isMulti && !["hero-boxed", "testimonials", "stories"].includes(effect)
    const fullBleed = allowFullBleed ? applyFullBleed(root) : { sync: () => {}, destroy: () => {} }

    document.querySelectorAll(`.slideease-container-${uniqueId} .slideease-cta`).forEach((el) => {
      el.addEventListener("click", () => {
        trackEvent("cta_click", el.getAttribute("data-slide-id"))
      })
    })

    if (root) {
      root.addEventListener(
        "click",
        async (event) => {
          const btn = event.target?.closest?.(".se-product-card__atc")
          if (!btn || !root.contains(btn)) return
          event.preventDefault()
          event.stopPropagation()
          if (btn.disabled || btn.dataset.seBusy === "1") return
          const original = btn.textContent
          btn.dataset.seBusy = "1"
          btn.disabled = true
          btn.textContent = "Adding…"
          try {
            const variantId = await resolveVariantId({
              variantId: btn.getAttribute("data-variant-id"),
              productHandle: btn.getAttribute("data-product-handle"),
            })
            await addVariantToCart(variantId, 1)
            trackEvent("add_to_cart", btn.getAttribute("data-slide-id"))
            btn.textContent = "Added"
            setTimeout(() => {
              btn.textContent = original
              btn.disabled = false
              btn.dataset.seBusy = "0"
            }, 1200)
          } catch (error) {
            btn.textContent = "Unavailable"
            setTimeout(() => {
              btn.textContent = original
              btn.disabled = false
              btn.dataset.seBusy = "0"
            }, 1800)
            console.warn("SlideEase add to cart failed:", error?.message || error)
          }
        },
        true,
      )
    }

    const restartProgress = () => {
      if (!root || !showProgress) return
      root.classList.remove("se-progress-run")
      void root.offsetWidth
      root.classList.add("se-progress-run")
    }

    Promise.resolve()
      .then(() => loadScriptOnce("https://code.jquery.com/jquery-3.6.0.min.js"))
      .then(() => {
        loadCssOnce("https://cdn.jsdelivr.net/npm/slick-carousel@1.8.1/slick/slick.css")
        loadCssOnce("https://cdn.jsdelivr.net/npm/slick-carousel@1.8.1/slick/slick-theme.css")
        return loadScriptOnce("https://cdn.jsdelivr.net/npm/slick-carousel@1.8.1/slick/slick.min.js")
      })
      .then(() => {
        const $slider = window.jQuery(`#${uniqueId}`)
        $slider.attr("data-effect", effect)
        $slider.slick(slickConfig)
        fullBleed.sync()

        if (settings.thumbnails) {
          window.jQuery(`.slideease-thumbs-${uniqueId}`).slick({
            slidesToShow: Math.min(6, slides.length),
            slidesToScroll: 1,
            asNavFor: `#${uniqueId}`,
            dots: false,
            centerMode: slides.length > 4,
            focusOnSelect: true,
            arrows: false,
          })
        }

        document.querySelector(`.slideease-prev-${uniqueId}`)?.addEventListener("click", () => $slider.slick("slickPrev"))
        document.querySelector(`.slideease-next-${uniqueId}`)?.addEventListener("click", () => $slider.slick("slickNext"))

        restartProgress()
        $slider.on("beforeChange", () => {
          if (root) root.classList.remove("se-progress-run")
        })
        $slider.on("afterChange", (_e, _slick, current) => {
          const slide = slides[current]
          if (slide?.id) trackEvent("view", slide.id)
          restartProgress()
        })

        document.addEventListener("shopify:section:unload", () => {
          fullBleed.destroy()
          if ($slider.hasClass("slick-initialized")) $slider.slick("unslick")
        })
      })
      .catch(() => {
        renderMessage("Slider unavailable", "Could not load slider dependencies.")
      })
  }

  if (!sliderId) {
    renderMessage("Slider misconfigured", "Missing slider id.")
    return
  }

  if (!shop) {
    renderMessage("Slider misconfigured", "Missing shop domain.")
    return
  }

  renderLoading()

  fetch(apiUrl)
    .then((response) => {
      if (!response.ok) throw new Error("Slider not found")
      return response.json()
    })
    .then((data) => {
      removeNode(`${uniqueId}-loading`)
      if (data.error) {
        renderMessage("Slider unavailable", data.error)
        return
      }
      renderSlider(data)
    })
    .catch(() => {
      removeNode(`${uniqueId}-loading`)
      renderMessage("Slider unavailable", "Unable to load this slider.")
    })
})()
