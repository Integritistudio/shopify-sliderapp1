;(() => {
  const script = document.currentScript
  if (!script) return

  const url = new URL(script.src)
  const sliderId = url.searchParams.get("id")
  const shopFromScript = url.searchParams.get("shop")
  const pageTypeFromScript = url.searchParams.get("pageType") || ""
  const shopFromShopify =
    (window.Shopify && (window.Shopify.shop || window.Shopify.permanent_domain)) || ""
  const shop = (shopFromScript || shopFromShopify || "").replace(/^https?:\/\//, "").replace(/\/$/, "")
  const uniqueId = `slideease-${sliderId}-${Math.random().toString(36).slice(2, 9)}`
  const apiOrigin = url.origin

  function resolvePageType() {
    if (pageTypeFromScript) return String(pageTypeFromScript).trim().toLowerCase()
    try {
      const analyticsType =
        window.Shopify?.analytics?.meta?.page?.pageType ||
        window.Shopify?.analytics?.meta?.page?.page_type ||
        ""
      if (analyticsType) return String(analyticsType).trim().toLowerCase()
    } catch {
      // ignore
    }
    return ""
  }

  function isHomepageContext(pageType) {
    if (pageType === "index") return true
    // Fallback when Liquid/theme did not pass pageType
    try {
      const path = (window.location.pathname || "/").replace(/\/+$/, "") || "/"
      const root = storeRoot().replace(/\/+$/, "") || ""
      if (path === "/" || path === root) return true
    } catch {
      // ignore
    }
    return false
  }

  const pageType = resolvePageType()
  const apiUrl = `${apiOrigin}/api/public/slider/${encodeURIComponent(sliderId)}?shop=${encodeURIComponent(shop)}&pageType=${encodeURIComponent(pageType)}`

  const CHEVRON_LEFT =
    '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M15 18l-6-6 6-6" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>'
  const CHEVRON_RIGHT =
    '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M9 18l6-6-6-6" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>'
  const QUICK_ADD_CART_ICON =
    '<svg class="se-product-card__quick-add-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M3 5h2l1.2 9.2a2 2 0 0 0 2 1.8h8.6a2 2 0 0 0 2-1.7L20 8H7" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/><circle cx="10" cy="20" r="1.4" fill="currentColor"/><circle cx="17" cy="20" r="1.4" fill="currentColor"/></svg>'
  const QUICK_ADD_CHECK_ICON =
    '<svg class="se-product-card__quick-add-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 13l4 4L19 7" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>'

  function buildQuickAddContent(settings = {}) {
    const text = String(settings.quickAddText || "").trim()
    if (text) return escapeHtml(text)
    const iconUrl = safeUrl(settings.quickAddIconUrl)
    if (iconUrl) {
      return `<img class="se-product-card__quick-add-icon" src="${escapeHtml(iconUrl)}" alt="" />`
    }
    return QUICK_ADD_CART_ICON
  }

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
    if (/^data:image\/[a-zA-Z0-9.+-]+(;|,)/i.test(trimmed)) return trimmed
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
    if (effect === "testimonials") return Math.min(Math.max(preferred, 160), 520)
    if (effect === "stories") return Math.min(Math.max(preferred, 280), 420)
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

  function getThemeCartUi() {
    return (
      document.querySelector("cart-drawer") ||
      document.querySelector("cart-notification") ||
      null
    )
  }

  function getCartSectionsToRequest(cartUi) {
    try {
      if (cartUi && typeof cartUi.getSectionsToRender === "function") {
        const ids = cartUi
          .getSectionsToRender()
          .map((section) => section.id)
          .filter(Boolean)
        if (ids.length) return ids
      }
    } catch {
      // fall through to defaults
    }
    return ["cart-drawer", "cart-icon-bubble", "cart-notification"]
  }

  function updateCartCountBubbles(count) {
    if (!Number.isFinite(count)) return
    document.querySelectorAll("[data-cart-count], .cart-count-bubble, .cart-count").forEach((el) => {
      const span = el.matches("span") ? el : el.querySelector("span")
      if (span) span.textContent = String(count)
      else if (el.childElementCount === 0) el.textContent = String(count)
      el.classList.toggle("hidden", count <= 0)
    })
  }

  function publishCartUpdate(parsedState) {
    try {
      const cartUi = getThemeCartUi()
      const count = Number(parsedState?.item_count)
      if (Number.isFinite(count)) updateCartCountBubbles(count)

      document.documentElement.dispatchEvent(
        new CustomEvent("cart:updated", { bubbles: true, detail: { source: "slideease", cart: parsedState } }),
      )
      document.dispatchEvent(new CustomEvent("cart:refresh", { bubbles: true, detail: parsedState }))
      document.dispatchEvent(new CustomEvent("ajaxProduct:added", { bubbles: true, detail: parsedState }))
      if (window.Shopify && typeof window.Shopify.onItemAdded === "function") {
        window.Shopify.onItemAdded(parsedState)
      }

      // PubSub used by Dawn / Horizon / Refresh
      try {
        if (typeof window.publish === "function" && window.PUB_SUB_EVENTS?.cartUpdate) {
          window.publish(window.PUB_SUB_EVENTS.cartUpdate, {
            source: "slideease",
            cartData: parsedState,
            productVariantId: parsedState?.variant_id || parsedState?.id,
          })
        }
      } catch {
        // optional
      }

      if (cartUi) {
        cartUi.classList.remove("is-empty")
        if (typeof cartUi.renderContents === "function" && parsedState?.sections) {
          cartUi.renderContents(parsedState)
          return
        }
        if (typeof cartUi.open === "function") cartUi.open()
        else {
          cartUi.classList.add("active", "is-open")
          cartUi.setAttribute("open", "")
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

    const cartUi = getThemeCartUi()
    const sections = getCartSectionsToRequest(cartUi)
    const sectionsUrl = window.location.pathname || storeRoot()

    const formData = new FormData()
    formData.append("id", String(id))
    formData.append("quantity", String(quantity))
    formData.append("sections", sections.join(","))
    formData.append("sections_url", sectionsUrl)

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
        body: JSON.stringify({
          id,
          quantity,
          sections,
          sections_url: sectionsUrl,
        }),
        credentials: "same-origin",
      })
    }

    if (!response.ok) {
      const form = new URLSearchParams()
      form.set("id", String(id))
      form.set("quantity", String(quantity))
      form.set("sections", sections.join(","))
      form.set("sections_url", sectionsUrl)
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
    if (!response.ok || data.status) {
      const message =
        data.description ||
        data.message ||
        (typeof data.errors === "string" ? data.errors : null) ||
        "Could not add to cart"
      throw new Error(message)
    }

    // If sections weren't returned (older themes), fetch them separately and attach
    if (!data.sections || !Object.keys(data.sections).length) {
      try {
        const sectionsRes = await fetch(
          `${storeRoot()}?sections=${encodeURIComponent(sections.join(","))}`,
          { headers: { Accept: "application/json" }, credentials: "same-origin" },
        )
        if (sectionsRes.ok) {
          data.sections = await sectionsRes.json()
        }
      } catch {
        // optional
      }
    }

    const cart = await fetchCart()
    if (cart && Number.isFinite(Number(cart.item_count))) {
      data.item_count = cart.item_count
    }

    publishCartUpdate(data)
    return data
  }

  function productHandleFromUrl(url) {
    const match = String(url || "").match(/\/products\/([^/?#]+)/i)
    return match ? decodeURIComponent(match[1]) : ""
  }

  async function resolveVariantId({ variantId, productHandle }) {
    const handle = String(productHandle || "").trim()
    if (handle) {
      const productUrl = `${storeRoot()}products/${encodeURIComponent(handle)}.js`
      const response = await fetch(productUrl, {
        headers: { Accept: "application/json" },
        credentials: "same-origin",
      })
      if (!response.ok) throw new Error("Product unavailable")
      const product = await response.json()
      const variants = product.variants || []
      const availableVariant =
        variants.find((item) => item?.available) ||
        (product.available ? variants[0] : null)
      if (!product.available || !availableVariant?.available) {
        throw new Error("Sold out")
      }
      const id = String(availableVariant.id || "").replace(/\D/g, "")
      if (!id) throw new Error("No variant found")
      return id
    }

    const direct = String(variantId || "").replace(/\D/g, "")
    if (direct) return direct
    throw new Error("Missing product")
  }

  function markAtcSoldOut(btn, label = "Sold out") {
    if (!btn) return
    if (btn.classList.contains("se-product-card__quick-add")) {
      btn.remove()
      return
    }
    btn.textContent = label
    btn.disabled = true
    btn.setAttribute("aria-disabled", "true")
    btn.dataset.soldOut = "1"
    btn.dataset.seBusy = "0"
    btn.classList.add("se-product-card__atc--soldout")
    btn.removeAttribute("data-variant-id")
  }

  function normalizeSalesBadgeMode(mode) {
    const value = String(mode || "").trim().toLowerCase()
    if (value === "off") return "off"
    return "automatic"
  }

  function calculateSaleDiscountPercent(price, compareAtPrice) {
    const priceAmount = Number(price)
    const compareAmount = Number(compareAtPrice)
    if (
      !Number.isFinite(priceAmount) ||
      !Number.isFinite(compareAmount) ||
      compareAmount <= 0 ||
      compareAmount <= priceAmount
    ) {
      return null
    }
    const discountPercentage = Math.round(((compareAmount - priceAmount) / compareAmount) * 100)
    return discountPercentage > 0 ? discountPercentage : null
  }

  function saleDiscountFromStorefrontVariant(variant) {
    if (!variant) return null
    // Ajax product.js prices are in cents.
    return calculateSaleDiscountPercent(
      Number(variant.price) / 100,
      Number(variant.compare_at_price) / 100,
    )
  }

  function normalizeSalesBadgeFormat(format) {
    const value = String(format || "").trim().toLowerCase()
    if (
      value === "percent-off" ||
      value === "percent" ||
      value === "save-percent" ||
      value === "custom"
    ) {
      return value
    }
    return "percent-off"
  }

  function formatSaleBadgeLabel(discountPercent, options = {}) {
    const percent = Number(discountPercent)
    if (!Number.isFinite(percent) || percent <= 0) return ""
    const n = Math.round(percent)
    const format = normalizeSalesBadgeFormat(options.format)
    const text = String(options.text == null ? "OFF" : options.text).trim()
    switch (format) {
      case "percent":
        return `${n}%`
      case "save-percent":
        return `Save ${n}%`
      case "custom": {
        const template = text || "{percent}% OFF"
        return template.replace(/\{percent\}/gi, String(n))
      }
      case "percent-off":
      default:
        return `${n}% ${text || "OFF"}`
    }
  }

  function getSalesBadgeLabelOptions(root) {
    return {
      format: root?.getAttribute("data-sales-badge-format") || "percent-off",
      text: root?.getAttribute("data-sales-badge-text") ?? "OFF",
    }
  }

  function updateProductSalesBadge(card, discountPercent, options = {}) {
    if (!card) return
    const media = card.querySelector(".se-product-card__media")
    if (!media) return
    let badge = media.querySelector(".se-product-card__badge")
    const label = formatSaleBadgeLabel(discountPercent, options)
    if (!label) {
      badge?.remove()
      return
    }
    if (!badge) {
      badge = document.createElement("span")
      badge.className = "se-product-card__badge"
      badge.setAttribute("aria-hidden", "true")
      media.appendChild(badge)
    }
    badge.textContent = label
  }

  function pickStorefrontVariant(product, preferredVariantId = "") {
    const variants = product?.variants || []
    if (!variants.length) return null
    const preferredId = String(preferredVariantId || "").replace(/\D/g, "")
    if (preferredId) {
      const matched = variants.find(
        (item) => String(item?.id || "").replace(/\D/g, "") === preferredId,
      )
      if (matched) return matched
    }
    return (
      variants.find((item) => item?.available) ||
      (product?.available ? variants[0] : null) ||
      variants[0] ||
      null
    )
  }

  async function refreshSalesBadges(root) {
    if (!root || normalizeSalesBadgeMode(root.getAttribute("data-sales-badge-mode")) !== "automatic") {
      return
    }
    const cards = [...root.querySelectorAll(".se-product-card[data-product-handle]")]
    await Promise.all(
      cards.map(async (card) => {
        const handle = String(card.getAttribute("data-product-handle") || "").trim()
        if (!handle) return
        try {
          const response = await fetch(`${storeRoot()}products/${encodeURIComponent(handle)}.js`, {
            headers: { Accept: "application/json" },
            credentials: "same-origin",
          })
          if (!response.ok) return
          const product = await response.json()
          const preferredVariantId =
            card.getAttribute("data-variant-id") ||
            card.querySelector(".se-product-card__atc")?.getAttribute("data-variant-id") ||
            ""
          const selected = pickStorefrontVariant(product, preferredVariantId)
          if (selected?.id) {
            card.setAttribute("data-variant-id", String(selected.id).replace(/\D/g, ""))
          }
          updateProductSalesBadge(card, saleDiscountFromStorefrontVariant(selected), getSalesBadgeLabelOptions(root))
        } catch {
          // Keep synced snapshot badge
        }
      }),
    )
  }

  async function refreshAtcAvailability(root, { soldOutLabel = "Sold out", showSoldOut = true } = {}) {
    if (!root) return
    const buttons = [...root.querySelectorAll(".se-product-card__atc:not([data-sold-out='1'])")]
    await Promise.all(
      buttons.map(async (btn) => {
        const handle = String(btn.getAttribute("data-product-handle") || "").trim()
        if (!handle) return
        try {
          const response = await fetch(`${storeRoot()}products/${encodeURIComponent(handle)}.js`, {
            headers: { Accept: "application/json" },
            credentials: "same-origin",
          })
          if (!response.ok) return
          const product = await response.json()
          const variants = product.variants || []
          const availableVariant = variants.find((item) => item?.available)
          const available = Boolean(product.available) && Boolean(availableVariant)
          if (!available) {
            if (btn.classList.contains("se-product-card__quick-add")) {
              btn.remove()
              return
            }
            if (showSoldOut) markAtcSoldOut(btn, soldOutLabel)
            else btn.remove()
            return
          }
          const id = String(availableVariant.id || "").replace(/\D/g, "")
          if (id) {
            btn.setAttribute("data-variant-id", id)
            const card = btn.closest(".se-product-card")
            if (card) {
              card.setAttribute("data-variant-id", id)
              card.querySelectorAll(".se-product-card__atc:not([data-sold-out='1'])").forEach((el) => {
                el.setAttribute("data-variant-id", id)
              })
            }
          }
        } catch {
          // keep synced state
        }
      }),
    )
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

  function renderPlacementLocked(plan) {
    const pricingUrl = safeUrl(plan?.pricingUrl) || ""
    const planName = escapeHtml(plan?.name || "Free")
    const allowed = escapeHtml(plan?.placementAllowedSummary || "Homepage")
    const blocked = escapeHtml(
      plan?.placementBlockedSummary || "Product, Collection, Blog, and other pages",
    )
    const upgradeLink = pricingUrl
      ? `<a href="${escapeHtml(pricingUrl)}" target="_blank" rel="noopener noreferrer" style="display:inline-block;margin-top:0.85rem;padding:0.55rem 1rem;border-radius:10px;background:#1a2f4a;color:#fff;font-size:0.875rem;font-weight:600;text-decoration:none;">Upgrade for any-page placement</a>`
      : ""
    insertAdjacent(`
      <div class="se-message se-placement-locked" style="width:100%;max-width:640px;margin:1.5rem auto;padding:1.35rem 1.5rem;border:1px solid #fde68a;border-radius:14px;font-family:system-ui,-apple-system,sans-serif;background:#fffbeb;box-shadow:0 8px 24px rgba(15,23,42,0.06);">
        <strong style="display:block;margin-bottom:0.35rem;color:#92400e;font-size:0.95rem;">${planName} plan: ${allowed} only</strong>
        <span style="color:#a16207;font-size:0.9rem;line-height:1.45;">This slider cannot show here. On ${planName}, sliders are allowed on <strong>${allowed}</strong> and blocked on <strong>${blocked}</strong>. Upgrade to Standard or Pro to place sliders on Product, Collection, Blog, or any other page.</span>
        ${upgradeLink}
      </div>
    `)
  }

  function isPlacementAllowed(plan) {
    // Standard / Pro — any page
    if (plan?.placementAnyPage) return true
    if (plan?.allowedPageTypes == null && plan?.planId && plan.planId !== "free") return true
    // Free — homepage only (index), with path fallback when pageType missing
    if (pageType === "index" || (!pageType && isHomepageContext(""))) return true
    if (Array.isArray(plan?.allowedPageTypes) && plan.allowedPageTypes.includes(pageType)) {
      return true
    }
    return false
  }

  function resolveEffect(settings = {}) {
    const aliases = {
      "multiple-items": "autoplay",
      lazy: "autoplay",
      spotlight: "center",
      "carousel-3d": "coverflow",
    }
    return aliases[settings.effect || settings.transition] || settings.effect || settings.transition || "slide"
  }

  function buildSlickConfig(settings) {
    const prefersReduced = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches
    const effect = resolveEffect(settings)
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
      centerPadding: effect === "coverflow" ? "6%" : effect === "product-showcase" ? "0px" : settings.centerPadding || "10%",
      vertical: effect === "vertical" || Boolean(settings.vertical),
      variableWidth: effect === "variable-width" || Boolean(settings.variableWidth),
      lazyLoad: settings.lazyLoad ? "ondemand" : null,
      dotsClass: `slideease-dots slideease-dots-${uniqueId}`,
      customPaging: () => '<button type="button"><span class="se-dot"></span></button>',
      responsive: [
        {
          breakpoint: 900,
          settings: {
            slidesToShow: effect === "stories" || fadeEffects.includes(effect)
              ? 1
              : effect === "product-showcase"
                ? 3
                : productStripEffects.includes(effect)
                  ? Math.min(Number(settings.slidesToShow) || 4, 3)
                  : effect === "testimonials"
                    ? Math.min(Number(settings.slidesToShow) || 3, 2)
                    : Math.min(Number(settings.slidesToShow) || 1, 2),
            ...(effect === "testimonials"
              ? { slidesToScroll: Math.min(Number(settings.slidesToShow) || 3, 2) }
              : effect === "product-showcase"
                ? { slidesToScroll: 1 }
                : effect === "stories" || fadeEffects.includes(effect)
                  ? { slidesToScroll: 1, fade: true }
                  : {}),
            centerMode: centerEffects.includes(effect),
            centerPadding: effect === "product-showcase" ? "0px" : "5%",
          },
        },
        {
          breakpoint: 640,
          settings:
            effect === "stories" || fadeEffects.includes(effect)
              ? {
                  slidesToShow: 1,
                  slidesToScroll: 1,
                  fade: true,
                  centerMode: false,
                  vertical: false,
                  variableWidth: false,
                }
              : {
                  slidesToShow: mobileShow,
                  slidesToScroll: Math.min(mobileScroll, mobileShow),
                  centerMode: false,
                  vertical: false,
                  variableWidth: false,
                },
        },
      ],
    }

    if (fadeEffects.includes(effect) || effect === "stories") {
      config.slidesToShow = 1
      config.slidesToScroll = 1
    }
    if (effect === "testimonials") {
      const show = Math.min(Math.max(Number(settings.slidesToShow) || 3, 1), 3)
      config.fade = false
      config.slidesToShow = show
      config.slidesToScroll = show
    }
    if (centerEffects.includes(effect)) {
      // Product Showcase always mirrors the live preview: 3 cards, center featured.
      config.slidesToShow = effect === "product-showcase" ? 3 : Math.max(Number(settings.slidesToShow) || 3, 1)
      if (effect === "product-showcase") config.slidesToScroll = 1
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
      if (effect === "logo-grid") {
        const desktopLogos = Math.min(Math.max(Number(settings.slidesToShow) || 5, 2), 8)
        const tabletLogos = Math.min(desktopLogos, 3)
        // Mobile phones can't fit 3+ logo cards; saved "3" caused overflow + clone doubles.
        const mobileLogos = Math.min(Math.max(Number(settings.mobile?.slidesToShow) || 2, 1), 2)
        config.slidesToShow = desktopLogos
        config.slidesToScroll = 1
        config.responsive = [
          {
            breakpoint: 900,
            settings: {
              slidesToShow: tabletLogos,
              slidesToScroll: 1,
              arrows: false,
              dots: false,
              centerMode: false,
              variableWidth: false,
            },
          },
          {
            breakpoint: 640,
            settings: {
              slidesToShow: mobileLogos,
              slidesToScroll: 1,
              arrows: false,
              dots: false,
              centerMode: false,
              variableWidth: false,
            },
          },
        ]
      }
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
    const placementPositions = ["middle", "bottom-center", "bottom-left", "bottom-right"]
    const placement = (() => {
      if (placementPositions.includes(slide.contentPosition)) return slide.contentPosition
      if (placementPositions.includes(slide.textAlign)) return slide.textAlign
      if (slide.textAlign === "left") return "bottom-left"
      if (slide.textAlign === "right") return "bottom-right"
      if (placementPositions.includes(settings.contentPosition)) return settings.contentPosition
      return "bottom-center"
    })()
    const align = placement.includes("left") ? "left" : placement.includes("right") ? "right" : "center"
    const alignItems = placement.includes("left") ? "flex-start" : placement.includes("right") ? "flex-end" : "center"
    const justifyContent = placement === "middle" ? "center" : "flex-end"
    const ctaHref = safeUrl(slide.ctaUrl)
    const cta2Href = safeUrl(slide.cta2Url)
    const targetAttrs = slide.ctaOpenInNewTab ? ` target="_blank" rel="noopener noreferrer"` : ""
    const target2Attrs = slide.cta2OpenInNewTab ? ` target="_blank" rel="noopener noreferrer"` : ""
    const heroAnimEarly =
      settings.heroAnimation && settings.heroAnimation !== "none" ? String(settings.heroAnimation) : ""
    const radius =
      effect === "hero-fullwidth" ||
      effect === "hero-video" ||
      effect === "announcement" ||
      heroAnimEarly === "hero-video"
        ? 0
        : Number(settings.borderRadius ?? 0)
    const textColor = escapeHtml(slide.textColor || "#ffffff")
    const btnBg = escapeHtml(settings.ctaBackground || slide.buttonBg || "#1a2f4a")
    const btnHoverBg = escapeHtml(settings.ctaHoverBackground || settings.ctaBackground || slide.buttonBg || "#243d5c")
    const btnText = escapeHtml(settings.ctaTextColor || slide.buttonTextColor || "#ffffff")
    const btnBorder = escapeHtml(settings.ctaBorderColor || "#ffffff")
    const btnIconColor = escapeHtml(settings.ctaIconColor || btnText)
    const btnIconBg = escapeHtml(settings.ctaIconBg || "rgba(255,255,255,0.12)")
    const btn2Bg = escapeHtml(settings.cta2Background ?? "transparent")
    const btn2HoverBg = escapeHtml(settings.cta2HoverBackground || "rgba(255,255,255,0.14)")
    const btn2Text = escapeHtml(settings.cta2TextColor || settings.ctaTextColor || "#ffffff")
    const btn2HoverText = escapeHtml(settings.cta2HoverTextColor || settings.cta2TextColor || btn2Text)
    const btn2Border = escapeHtml(settings.cta2BorderColor || settings.ctaBorderColor || "#ffffff")
    const btn2IconColor = escapeHtml(settings.cta2IconColor || btn2Text)
    const btn2IconBg = escapeHtml(settings.cta2IconBg || "rgba(255,255,255,0.12)")
    const btnIconSize = Math.min(Math.max(Number(settings.ctaIconSize ?? 34), 20), 56)
    const btnIconPad = Math.round(btnIconSize * 0.235)
    const btnBorderWidth = Math.min(Math.max(Number(settings.ctaBorderWidth ?? 1), 0), 6)
    const btnRadius = Math.min(Math.max(Number(settings.ctaBorderRadius ?? 50), 0), 50)
    const btnFontSize = Math.min(Math.max(Number(settings.ctaFontSize ?? 16), 12), 24)
    const btnIcon = ["arrow", "chevron", "none"].includes(settings.ctaIcon) ? settings.ctaIcon : "arrow"
    const btn2Icon = ["arrow", "chevron", "none"].includes(settings.cta2Icon) ? settings.cta2Icon : "none"
    const btnIconPath = btnIcon === "chevron" ? "M7 4l6 6-6 6" : "M4 10h11m-4-4 4 4-4 4"
    const btn2IconPath = btn2Icon === "chevron" ? "M7 4l6 6-6 6" : "M4 10h11m-4-4 4 4-4 4"
    const btnIconMarkup =
      btnIcon === "none"
        ? ""
        : `<svg viewBox="0 0 20 20" aria-hidden="true"><path d="${btnIconPath}" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`
    const btn2IconMarkup =
      btn2Icon === "none"
        ? ""
        : `<svg viewBox="0 0 20 20" aria-hidden="true"><path d="${btn2IconPath}" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`
    const ctaStyle = `--se-cta-bg:${btnBg};--se-cta-hover-bg:${btnHoverBg};--se-cta-color:${btnText};--se-cta-border:${btnBorder};--se-cta-border-width:${btnBorderWidth}px;--se-cta-radius:${btnRadius}px;--se-cta-font-size:${btnFontSize}px;--se-cta-icon-color:${btnIconColor};--se-cta-icon-bg:${btnIconBg};--se-cta-icon-size:${btnIconSize}px;--se-cta-icon-pad:${btnIconPad}px;`
    const cta2Style = `${ctaStyle}--se-cta2-bg:${btn2Bg};--se-cta2-hover-bg:${btn2HoverBg};--se-cta2-color:${btn2Text};--se-cta2-hover-color:${btn2HoverText};--se-cta2-border:${btn2Border};--se-cta2-icon-color:${btn2IconColor};--se-cta2-icon-bg:${btn2IconBg};`
    const primaryCta = slide.ctaText
      ? `<a class="slideease-cta se-cta${btnIcon === "none" ? " se-cta--no-icon" : ""}" data-slide-id="${escapeHtml(slide.id)}" href="${escapeHtml(ctaHref || "#")}"${targetAttrs} style="${ctaStyle}"><span>${escapeHtml(slide.ctaText)}</span>${btnIconMarkup}</a>`
      : ""
    const secondaryCta = slide.cta2Text
      ? `<a class="slideease-cta se-cta se-cta--secondary${btn2Icon === "none" ? " se-cta--no-icon" : ""}" data-slide-id="${escapeHtml(slide.id)}" href="${escapeHtml(cta2Href || "#")}"${target2Attrs} style="${cta2Style}"><span>${escapeHtml(slide.cta2Text)}</span>${btn2IconMarkup}</a>`
      : ""
    const ctaHtml =
      primaryCta || secondaryCta ? `<div class="se-cta-row">${primaryCta}${secondaryCta}</div>` : ""

    if (["product-carousel", "product-showcase", "collection-rail"].includes(effect)) {
      const imageUrl = escapeHtml(safeUrl(slide.imageUrl) || "")
      const hoverImageUrl = escapeHtml(safeUrl(slide.hoverImageUrl) || "")
      const showPrice = settings.showPrice !== false
      const showShopNow = settings.showShopNow !== false
      const showAddToCart = settings.showAddToCart !== false
      const showSoldOut = settings.showSoldOut !== false
      const salesBadgeMode = normalizeSalesBadgeMode(settings.salesBadgeMode)
      const salesBadgeFormat = normalizeSalesBadgeFormat(settings.salesBadgeFormat)
      const salesBadgeText =
        settings.salesBadgeText == null
          ? salesBadgeFormat === "custom"
            ? "{percent}% OFF"
            : "OFF"
          : String(settings.salesBadgeText)
      const shopLabel = escapeHtml(slide.ctaText || "Shop now")
      const soldOutLabel = escapeHtml(settings.soldOutText || "Sold out")
      const atcLabel = escapeHtml(settings.addToCartText || "Add to cart")
      const variantId = String(slide.variantId || "").replace(/\D/g, "")
      const productHandle =
        productHandleFromUrl(slide.ctaUrl || ctaHref || "") ||
        String(slide.subheading || "").trim()
      const isSoldOut = slide.availableForSale === false
      const saleDiscountPercent = Number(slide.saleDiscountPercent)
      const saleBadgeLabel =
        salesBadgeMode === "automatic" && Number.isFinite(saleDiscountPercent) && saleDiscountPercent > 0
          ? formatSaleBadgeLabel(saleDiscountPercent, {
              format: salesBadgeFormat,
              text: salesBadgeText,
            })
          : ""
      const actions = []
      if (showAddToCart && (variantId || productHandle || isSoldOut)) {
        if (isSoldOut) {
          if (showSoldOut) {
            actions.push(
              `<button type="button" class="se-product-card__atc se-product-card__atc--soldout" disabled aria-disabled="true" data-sold-out="1" data-slide-id="${escapeHtml(slide.id)}">${soldOutLabel}</button>`,
            )
          }
        } else {
          actions.push(
            `<button type="button" class="se-product-card__atc" data-variant-id="${escapeHtml(variantId)}" data-product-handle="${escapeHtml(productHandle)}" data-slide-id="${escapeHtml(slide.id)}" data-show-sold-out="${showSoldOut ? "1" : "0"}">${atcLabel}</button>`,
          )
        }
      }
      if (showShopNow) {
        actions.push(
          `<a class="se-product-card__shop slideease-cta" data-slide-id="${escapeHtml(slide.id)}" href="${escapeHtml(ctaHref || "#")}"${targetAttrs}>${shopLabel}</a>`,
        )
      }
      const badgeHtml = saleBadgeLabel
        ? `<span class="se-product-card__badge" aria-hidden="true">${escapeHtml(saleBadgeLabel)}</span>`
        : ""
      const canQuickAdd = !isSoldOut && Boolean(variantId || productHandle)
      const quickAddContent = buildQuickAddContent(settings)
      const quickAddHtml = canQuickAdd
        ? `<button type="button" class="se-product-card__atc se-product-card__quick-add" data-variant-id="${escapeHtml(variantId)}" data-product-handle="${escapeHtml(productHandle)}" data-slide-id="${escapeHtml(slide.id)}" data-show-sold-out="${showSoldOut ? "1" : "0"}" aria-label="Quick Add">${quickAddContent}</button>`
        : ""
      const mediaInner = imageUrl
        ? `<img class="se-product-card__img se-product-card__img--primary" src="${imageUrl}" alt="${escapeHtml(slide.imageAlt || heading)}" loading="lazy" />${
            hoverImageUrl
              ? `<img class="se-product-card__img se-product-card__img--hover" src="${hoverImageUrl}" alt="" aria-hidden="true" loading="lazy" />`
              : ""
          }${badgeHtml}`
        : badgeHtml
      return `
        <div data-slideease-slide-id="${escapeHtml(slide.id)}">
          <div class="se-product-pad">
            <article class="se-product-card se-frame-${escapeHtml(effect)}${hoverImageUrl ? " se-product-card--has-hover" : ""}${canQuickAdd ? " se-product-card--quick-add" : ""}" data-product-handle="${escapeHtml(productHandle)}" data-variant-id="${escapeHtml(variantId)}">
              <div class="se-product-card__link">
                <div class="se-product-card__media">
                  <a class="se-product-card__media-link" href="${escapeHtml(ctaHref || "#")}"${targetAttrs}>${mediaInner}</a>
                  ${quickAddHtml}
                </div>
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
          <div class="se-testimonial-pad">
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
        </div>
      `
    }

    if (effect === "logo-grid") {
      const logo = escapeHtml(safeUrl(slide.imageUrl) || "")
      return `
        <div data-slideease-slide-id="${escapeHtml(slide.id)}">
          <div class="se-logo-cell se-frame-${escapeHtml(effect)}">
            <div class="se-logo-card">
              ${logo ? `<img src="${logo}" alt="" loading="lazy" />` : `<span class="se-logo-fallback" aria-hidden="true"></span>`}
            </div>
          </div>
        </div>
      `
    }

    if (effect === "stories") {
      const storyRadius = Number(settings.borderRadius ?? 18) || 18
      const hasStoryCopy = Boolean(heading || subheading || description || slide.ctaText || slide.cta2Text)
      return `
        <div data-slideease-slide-id="${escapeHtml(slide.id)}">
          <article class="slideease-frame se-story-focus se-frame-stories" style="--se-radius:${storyRadius}px;border-radius:${storyRadius}px;">
            <div class="se-media-wrap">${renderMedia(slide, settings)}</div>
            <div class="se-overlay" aria-hidden="true">
              <span class="se-overlay__tint" style="background:${escapeHtml(overlayColor)};opacity:${overlayOpacity};"></span>
            </div>
            ${
              hasStoryCopy
                ? `<div class="se-copy se-copy--middle se-story-focus__copy" style="justify-content:center;align-items:center;text-align:center;color:${textColor};">
              <div class="se-copy-plate">
                ${subheading ? `<p class="se-eyebrow">${escapeHtml(subheading)}</p>` : ""}
                ${heading ? `<h3 class="se-heading">${escapeHtml(heading)}</h3>` : ""}
                ${description ? `<p class="se-desc">${escapeHtml(description)}</p>` : ""}
                ${ctaHtml}
              </div>
            </div>`
                : ""
            }
          </article>
        </div>
      `
    }

    if (effect === "announcement") {
      const announceRadius = Math.min(Math.max(Number(settings.borderRadius ?? 0), 0), 40)
      const announceHeight = Math.min(Math.max(Number(settings.height) || 48, 36), 120)
      return `
        <div data-slideease-slide-id="${escapeHtml(slide.id)}">
          <div class="se-announce se-frame-${escapeHtml(effect)}" style="background:${btnBg};color:${textColor || btnText};border-radius:${announceRadius}px;height:${announceHeight}px;min-height:${announceHeight}px;">
            <span class="se-announce__text">${escapeHtml(heading || "Announcement")}</span>
            ${
              slide.ctaText || slide.cta2Text
                ? `<span class="se-announce__ctas">${
                    slide.ctaText
                      ? `<a class="slideease-cta se-announce__cta" data-slide-id="${escapeHtml(slide.id)}" href="${escapeHtml(ctaHref || "#")}"${targetAttrs}>${escapeHtml(slide.ctaText)}</a>`
                      : ""
                  }${
                    slide.cta2Text
                      ? `<a class="slideease-cta se-announce__cta se-announce__cta--secondary" data-slide-id="${escapeHtml(slide.id)}" href="${escapeHtml(cta2Href || "#")}"${target2Attrs}>${escapeHtml(slide.cta2Text)}</a>`
                      : ""
                  }</span>`
                : ""
            }
          </div>
        </div>
      `
    }

    const hasCopy = Boolean(heading || subheading || description || slide.ctaText || slide.cta2Text)
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
    const heroTypes = ["hero-fullwidth", "hero-boxed", "autoplay", "center", "hero-video", "slide", "thumbnails"]
    const heroAnimation =
      heroTypes.includes(effect) && settings.heroAnimation && settings.heroAnimation !== "none"
        ? String(settings.heroAnimation)
        : ""
    const animClass =
      heroAnimation && heroAnimation !== "thumbnails" && heroAnimation !== "hero-video"
        ? ` se-frame-${escapeHtml(heroAnimation)}`
        : heroAnimation === "hero-video"
          ? " se-frame-hero-video"
          : ""
    const splitPanels =
      effect === "split-panel" || heroAnimation === "split-panel"
        ? `<div class="se-split-panel se-split-panel--left"></div><div class="se-split-panel se-split-panel--right"></div>`
        : ""

    return `
      <div data-slideease-slide-id="${escapeHtml(slide.id)}">
        <div style="padding:${slidePad};">
          <article class="slideease-frame se-frame-${escapeHtml(effect || "fade")}${animClass}${effect === "hero-boxed" ? " se-frame--boxed" : ""}${heroAnimation === "slide-up" ? " se-frame-slide-up" : ""}" style="--se-radius:${radius}px;border-radius:${radius}px;">
            <div class="se-media-wrap">${renderMedia(slide, settings)}</div>
            <div class="se-overlay" aria-hidden="true">
              <span class="se-overlay__tint" style="background:${escapeHtml(overlayColor)};opacity:${overlayOpacity};"></span>
              <span class="se-overlay__grade" style="opacity:${overlayOpacity};"></span>
            </div>
            ${
              hasCopy
                ? `<div class="se-rise-content se-copy se-copy--${escapeHtml(placement)}" style="justify-content:${justifyContent};align-items:${alignItems};text-align:${escapeHtml(align)};color:${textColor};">
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
          .slideease-container-${uniqueId}.se-root--testimonials {
            max-width: min(100%, var(--se-width, 1100px));
            margin-inline: auto;
            padding-inline: clamp(2.75rem, 5vw, 3.5rem);
            padding-block: 0.35rem 0.5rem;
            width: 100%;
            box-sizing: border-box;
            overflow: visible;
          }
          .slideease-container-${uniqueId}.se-root--testimonials .se-slider {
            height: auto !important;
          }
          .slideease-container-${uniqueId}.se-root--testimonials .slick-list {
            height: auto !important;
            overflow: hidden;
            margin: 0 -12px;
          }
          .slideease-container-${uniqueId}.se-root--testimonials .slick-track {
            display: flex !important;
            align-items: stretch !important;
            height: auto !important;
          }
          .slideease-container-${uniqueId}.se-root--testimonials .slick-slide {
            height: auto !important;
            float: none !important;
            display: flex !important;
            min-height: var(--se-height);
          }
          .slideease-container-${uniqueId}.se-root--testimonials .slick-slide > div {
            height: auto !important;
            min-height: var(--se-height);
            width: 100%;
            display: flex;
          }
          .slideease-container-${uniqueId}.se-root--testimonials .se-nav--prev { left: 0; }
          .slideease-container-${uniqueId}.se-root--testimonials .se-nav--next { right: 0; }
          .slideease-container-${uniqueId}.se-root--testimonials .se-nav {
            border: 1px solid #e7e7e7;
            background: #fff;
            color: #170f49;
            box-shadow: 0 8px 24px rgba(23, 15, 73, 0.08);
            backdrop-filter: none;
            -webkit-backdrop-filter: none;
            opacity: 1;
          }
          .slideease-container-${uniqueId}.se-root--testimonials .slideease-dots-${uniqueId} {
            position: static !important;
            left: auto !important;
            bottom: auto !important;
            transform: none !important;
            width: fit-content;
            margin: 1.15rem auto 0.15rem !important;
            background: transparent;
            border: none;
            backdrop-filter: none;
            -webkit-backdrop-filter: none;
            gap: 8px;
            padding: 0;
          }
          .slideease-container-${uniqueId}.se-root--testimonials .se-dot {
            background: rgba(23, 15, 73, 0.18);
          }
          .slideease-container-${uniqueId}.se-root--testimonials .slideease-dots-${uniqueId} li.slick-active .se-dot {
            background: #170f49;
          }
          .slideease-container-${uniqueId}.se-root--testimonials .se-progress { display: none !important; }
          .slideease-container-${uniqueId}.se-root--announce { --se-render-height: var(--se-height); }
          .slideease-container-${uniqueId}.se-root--utility { --se-render-height: var(--se-height); }
          .slideease-container-${uniqueId} .se-product-pad { padding: 0 10px; height: 100%; display: flex; width: 100%; box-sizing: border-box; }
          .slideease-container-${uniqueId} .se-product-card {
            display: flex; flex-direction: column; height: 100%; width: 100%;
            background: var(--se-product-card-bg, #fff); border: var(--se-product-card-border, 1px solid #e7e7e7); border-radius: 14px; overflow: hidden;
            box-shadow: none;
          }
          .slideease-container-${uniqueId} .se-product-card:hover { box-shadow: none; }
          .slideease-container-${uniqueId} .se-product-card__link { display: flex; flex-direction: column; height: 100%; flex: 1; color: inherit; text-decoration: none; }
          .slideease-container-${uniqueId} .se-product-card__media-link { display: block; height: 100%; color: inherit; text-decoration: none; position: relative; z-index: 1; }
          .slideease-container-${uniqueId} .se-product-card__media { position: relative; aspect-ratio: 1 / 1.05; background: #f3f4f6; overflow: hidden; flex-shrink: 0; }
          .slideease-container-${uniqueId} .se-product-card__media img,
          .slideease-container-${uniqueId} .se-product-card__img { width: 100%; height: 100%; object-fit: cover; display: block; }
          .slideease-container-${uniqueId} .se-product-card__img--hover {
            position: absolute; inset: 0; opacity: 0; pointer-events: none;
            transition: opacity 0.25s ease;
          }
          @media (hover: hover) and (pointer: fine) {
            .slideease-container-${uniqueId} .se-product-card--has-hover:hover .se-product-card__img--hover { opacity: 1; }
          }
          .slideease-container-${uniqueId} .se-product-card__badge {
            position: absolute; top: 10px; left: 10px; z-index: 2; pointer-events: none;
            display: inline-flex; align-items: center; justify-content: center;
            padding: var(--se-sales-badge-pad, 8px); border-radius: 4px;
            background: var(--se-sales-badge-bg, #170f49); color: #fff;
            font-size: 11px; font-weight: 700; letter-spacing: 0.02em; line-height: 1.2;
            text-transform: uppercase;
          }
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
            padding: var(--se-cta-pad, 12px) calc(var(--se-cta-pad, 12px) * 1.75);
            border-radius: var(--se-cta-radius, 50px);
            border: var(--se-atc-border-width, 1px) solid var(--se-atc-border, #170f49);
            background: var(--se-atc-bg, #fff); color: var(--se-atc-color, #170f49);
            font-size: var(--se-cta-font-size, 16px); font-weight: 650;
            line-height: 1; transition: background 0.2s ease, color 0.2s ease, border-color 0.2s ease, opacity 0.2s ease;
            text-decoration: none; cursor: pointer; font-family: inherit;
          }
          /* Must follow ATC rules so Quick Add matches sales badge sizing (not CTA button sizing). */
          .slideease-container-${uniqueId} .se-product-card__atc.se-product-card__quick-add {
            position: absolute; right: 10px; bottom: 10px; z-index: 3;
            width: auto; min-width: 0; height: auto; margin: 0;
            display: inline-flex; align-items: center; justify-content: center;
            padding: var(--se-sales-badge-pad, 8px);
            border-radius: 4px;
            border: none;
            background: var(--se-quick-add-bg, var(--se-sales-badge-bg, #170f49));
            color: #fff;
            box-shadow: none;
            font-size: var(--se-quick-add-size, 11px); font-weight: 700; letter-spacing: 0.02em; line-height: 1;
            text-transform: uppercase; white-space: nowrap;
            opacity: 0; transform: translateY(8px);
            pointer-events: none;
            transition: opacity 0.2s ease, transform 0.2s ease, background 0.2s ease, color 0.2s ease;
          }
          .slideease-container-${uniqueId} .se-product-card__atc.se-product-card__quick-add .se-product-card__quick-add-icon,
          .slideease-container-${uniqueId} .se-product-card__atc.se-product-card__quick-add svg {
            display: block; width: var(--se-quick-add-size, 11px); height: var(--se-quick-add-size, 11px);
            object-fit: contain;
          }
          .slideease-container-${uniqueId} .se-product-card__atc.se-product-card__quick-add:hover:not(:disabled) {
            background: var(--se-quick-add-bg, var(--se-sales-badge-bg, #170f49));
            color: #fff;
            border: none;
          }
          .slideease-container-${uniqueId} .se-product-card__atc.se-product-card__quick-add:disabled {
            opacity: 0.85; cursor: wait;
          }
          @media (hover: hover) and (pointer: fine) {
            .slideease-container-${uniqueId} .se-product-card--quick-add:hover .se-product-card__atc.se-product-card__quick-add {
              opacity: 1; transform: translateY(0); pointer-events: auto;
            }
          }
          @media (hover: none), (pointer: coarse) {
            .slideease-container-${uniqueId} .se-product-card__atc.se-product-card__quick-add {
              opacity: 1; transform: none; pointer-events: auto;
            }
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
          .slideease-container-${uniqueId} .se-product-card__atc--soldout,
          .slideease-container-${uniqueId} .se-product-card__atc--soldout:disabled {
            opacity: 0.72;
            cursor: not-allowed;
            background: #f3f4f6;
            color: #6b7280;
            border-color: #d1d5db;
          }
          .slideease-container-${uniqueId} .se-product-card__atc--soldout:hover:disabled {
            background: #f3f4f6;
            color: #6b7280;
            border-color: #d1d5db;
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
          .slideease-container-${uniqueId}[data-effect="collection-rail"] .se-product-card {
            transform: none !important;
            animation: none !important;
          }
          /* Product Showcase only — match live preview: larger center, softer side peeks */
          .slideease-container-${uniqueId}[data-effect="product-showcase"] .slick-track {
            align-items: center !important;
          }
          .slideease-container-${uniqueId}[data-effect="product-showcase"] .se-product-card {
            transform-origin: center center;
            transition: transform 0.45s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.35s ease;
            animation: none !important;
          }
          /* Don't reserve 2-line title height — short titles left a fake gap above the price */
          .slideease-container-${uniqueId}[data-effect="product-showcase"] .se-product-card__title,
          .slideease-container-${uniqueId}[data-effect="product-carousel"] .se-product-card__title,
          .slideease-container-${uniqueId}[data-effect="collection-rail"] .se-product-card__title {
            min-height: 0;
          }
          @media (min-width: 641px) {
            .slideease-container-${uniqueId}[data-effect="product-showcase"] .slick-slide:not(.slick-center) .se-product-card {
              transform: scale(0.82);
              opacity: 0.72;
            }
            .slideease-container-${uniqueId}[data-effect="product-showcase"] .slick-slide:not(.slick-center) .se-product-card__body {
              padding: 0.7rem 0.75rem 0.85rem;
            }
            .slideease-container-${uniqueId}[data-effect="product-showcase"] .slick-center .se-product-card {
              transform: scale(1);
              opacity: 1;
              z-index: 2;
              position: relative;
            }
            .slideease-container-${uniqueId}[data-effect="product-showcase"] .slick-center .se-product-card__title {
              font-size: calc(var(--se-product-title-size, 16px) + 1px);
            }
          }
          .slideease-container-${uniqueId}[data-effect="hero-fullwidth"] .se-copy,
          .slideease-container-${uniqueId}[data-effect="hero-video"] .se-copy,
          .slideease-container-${uniqueId}[data-hero-anim="hero-video"] .se-copy,
          .slideease-container-${uniqueId}[data-effect="hero-boxed"] .se-copy {
            padding: clamp(1.5rem, 5vw, 3.5rem);
            padding-bottom: calc(2.75rem + var(--se-pagination-offset, 16px));
          }
          .slideease-container-${uniqueId}[data-effect="hero-fullwidth"] .se-copy--middle,
          .slideease-container-${uniqueId}[data-effect="hero-video"] .se-copy--middle,
          .slideease-container-${uniqueId}[data-hero-anim="hero-video"] .se-copy--middle,
          .slideease-container-${uniqueId}[data-effect="hero-boxed"] .se-copy--middle,
          .slideease-container-${uniqueId}[data-effect="hero-fullwidth"] .se-copy--center,
          .slideease-container-${uniqueId}[data-effect="hero-video"] .se-copy--center,
          .slideease-container-${uniqueId}[data-hero-anim="hero-video"] .se-copy--center,
          .slideease-container-${uniqueId}[data-effect="hero-boxed"] .se-copy--center {
            justify-content: center;
          }
          .slideease-container-${uniqueId}[data-effect="hero-fullwidth"] .se-copy--bottom-center,
          .slideease-container-${uniqueId}[data-effect="hero-video"] .se-copy--bottom-center,
          .slideease-container-${uniqueId}[data-hero-anim="hero-video"] .se-copy--bottom-center,
          .slideease-container-${uniqueId}[data-effect="hero-boxed"] .se-copy--bottom-center,
          .slideease-container-${uniqueId}[data-effect="hero-fullwidth"] .se-copy--bottom-left,
          .slideease-container-${uniqueId}[data-effect="hero-video"] .se-copy--bottom-left,
          .slideease-container-${uniqueId}[data-hero-anim="hero-video"] .se-copy--bottom-left,
          .slideease-container-${uniqueId}[data-effect="hero-boxed"] .se-copy--bottom-left,
          .slideease-container-${uniqueId}[data-effect="hero-fullwidth"] .se-copy--bottom-right,
          .slideease-container-${uniqueId}[data-effect="hero-video"] .se-copy--bottom-right,
          .slideease-container-${uniqueId}[data-hero-anim="hero-video"] .se-copy--bottom-right,
          .slideease-container-${uniqueId}[data-effect="hero-boxed"] .se-copy--bottom-right,
          .slideease-container-${uniqueId}[data-effect="hero-fullwidth"] .se-copy--left,
          .slideease-container-${uniqueId}[data-effect="hero-video"] .se-copy--left,
          .slideease-container-${uniqueId}[data-hero-anim="hero-video"] .se-copy--left,
          .slideease-container-${uniqueId}[data-effect="hero-boxed"] .se-copy--left,
          .slideease-container-${uniqueId}[data-effect="hero-fullwidth"] .se-copy--right,
          .slideease-container-${uniqueId}[data-effect="hero-video"] .se-copy--right,
          .slideease-container-${uniqueId}[data-hero-anim="hero-video"] .se-copy--right,
          .slideease-container-${uniqueId}[data-effect="hero-boxed"] .se-copy--right {
            justify-content: flex-end;
          }
          /* Hero overlays use slide overlayColor + overlayOpacity (inline on .se-overlay__tint / __grade) */
          .slideease-container-${uniqueId}[data-effect="hero-fullwidth"] .se-eyebrow,
          .slideease-container-${uniqueId}[data-effect="hero-video"] .se-eyebrow,
          .slideease-container-${uniqueId}[data-hero-anim="hero-video"] .se-eyebrow,
          .slideease-container-${uniqueId}[data-effect="hero-boxed"] .se-eyebrow {
            display: inline-flex; width: fit-content; padding: 0.28rem 0.7rem; border-radius: 999px;
            border: 1px solid rgba(255,255,255,0.35); background: rgba(255,255,255,0.08);
            letter-spacing: 0.08em; text-transform: uppercase; font-size: 0.72rem;
          }
          .slideease-container-${uniqueId}[data-effect="hero-fullwidth"] .se-cta,
          .slideease-container-${uniqueId}[data-effect="hero-video"] .se-cta,
          .slideease-container-${uniqueId}[data-hero-anim="hero-video"] .se-cta,
          .slideease-container-${uniqueId}[data-effect="hero-boxed"] .se-cta {
            /* keep merchant CTA colors from settings */
          }
          .slideease-container-${uniqueId}[data-effect="hero-boxed"] .slideease-frame {
            box-shadow: 0 18px 48px rgba(23,15,73,0.1);
          }
          .slideease-container-${uniqueId} .se-testimonial-pad {
            padding: 0 12px; height: 100%; min-height: var(--se-height); box-sizing: border-box; display: flex; width: 100%;
          }
          .slideease-container-${uniqueId} .se-testimonial {
            height: var(--se-height); min-height: var(--se-height); max-height: var(--se-height);
            display: flex; flex-direction: column; align-items: center; justify-content: center;
            gap: 0.85rem; text-align: center; padding: 1.5rem 1.35rem; background: #fff;
            border: 1px solid #e8e8ef; color: #170f49;
            box-shadow: 0 10px 28px rgba(23, 15, 73, 0.055);
            width: 100%; box-sizing: border-box; flex: 1;
            transition: box-shadow 0.28s var(--se-ease, ease), border-color 0.28s ease, transform 0.28s var(--se-ease, ease);
          }
          .slideease-container-${uniqueId} .se-testimonial:hover {
            border-color: #dddde8;
            box-shadow: 0 16px 40px rgba(23, 15, 73, 0.09);
            transform: translateY(-2px);
          }
          .slideease-container-${uniqueId} .se-testimonial__quote {
            font-size: 2rem; line-height: 1; color: #ed8104; font-weight: 700; flex-shrink: 0;
          }
          .slideease-container-${uniqueId} .se-testimonial__text {
            margin: 0; flex: 0 1 auto; max-width: 22rem; width: 100%;
            font-size: clamp(0.95rem, 1.15vw, 1.08rem); line-height: 1.55; font-weight: 500;
            color: #170f49; text-align: center;
          }
          .slideease-container-${uniqueId} .se-testimonial__author {
            display: flex; align-items: center; justify-content: center; gap: 0.75rem;
            margin-top: 0.35rem; text-align: left; flex-shrink: 0;
          }
          .slideease-container-${uniqueId} .se-testimonial__author strong { display: block; font-size: 0.9rem; font-weight: 650; color: #170f49; }
          .slideease-container-${uniqueId} .se-testimonial__author span { display: block; color: #5f5a72; font-size: 0.8rem; margin-top: 0.12rem; }
          .slideease-container-${uniqueId} .se-testimonial__avatar { width: 44px; height: 44px; border-radius: 50%; object-fit: cover; border: 2px solid #f0f0f4; flex-shrink: 0; }
          @media (max-width: 640px) {
            .slideease-container-${uniqueId}.se-root--testimonials { padding-inline: 2.6rem; }
            .slideease-container-${uniqueId} .se-testimonial { padding: 1.25rem 1.1rem; }
            .slideease-container-${uniqueId} .se-testimonial-pad { padding: 0 8px; }
          }
          .slideease-container-${uniqueId}[data-effect="logo-grid"] {
            border-radius: 16px;
            border: var(--se-logo-grid-border, 1px solid #ebe4f5);
            background: var(--se-logo-grid-bg, linear-gradient(120deg, #fff8f0 0%, #f7f2ff 48%, #eef8ff 100%));
            padding: 0.65rem 0.35rem;
            box-shadow: var(--se-logo-grid-shadow, inset 0 1px 0 rgba(255,255,255,0.8));
            max-width: var(--se-logo-grid-max, 100%);
            width: 100%;
            margin-inline: auto;
            box-sizing: border-box;
          }
          .slideease-container-${uniqueId}[data-effect="logo-grid"] .slick-list {
            overflow: hidden;
          }
          .slideease-container-${uniqueId}[data-effect="logo-grid"] .slick-slide {
            overflow: hidden;
            box-sizing: border-box;
          }
          .slideease-container-${uniqueId}[data-effect="logo-grid"] .slick-slide > div {
            overflow: hidden;
            max-width: 100%;
          }
          .slideease-container-${uniqueId}[data-effect="logo-grid"] .se-logo-cell {
            height: var(--se-height); display: flex; align-items: center; justify-content: center;
            padding: 0.55rem 0.45rem; box-sizing: border-box; width: 100%; max-width: 100%;
            overflow: hidden;
          }
          .slideease-container-${uniqueId}[data-effect="logo-grid"] .se-logo-card {
            width: 100%; max-width: 100%; height: auto;
            min-height: calc(var(--se-logo-height, 64px) + 1.4rem);
            max-height: calc(var(--se-height) - 0.5rem);
            display: flex; align-items: center; justify-content: center;
            background: #fff; border-radius: 14px; padding: 0.7rem 0.85rem;
            border: 1px solid rgba(23, 15, 73, 0.07);
            box-shadow: 0 6px 18px rgba(23, 15, 73, 0.07);
            transition: transform 0.25s var(--se-ease, ease), box-shadow 0.25s ease;
            overflow: hidden;
            box-sizing: border-box;
          }
          .slideease-container-${uniqueId}[data-effect="logo-grid"] .se-logo-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 24px rgba(23, 15, 73, 0.1);
          }
          .slideease-container-${uniqueId}[data-effect="logo-grid"] .se-logo-cell img {
            max-width: 100%;
            max-height: var(--se-logo-height, 64px);
            width: auto; height: auto; object-fit: contain;
            filter: none; opacity: 1; display: block;
          }
          .slideease-container-${uniqueId}[data-effect="logo-grid"] .se-logo-fallback {
            display: block; width: 70%; height: 55%; border-radius: 8px;
            background: linear-gradient(135deg, #ffd6a5, #c4b5fd, #93c5fd);
          }
          @media (max-width: 640px) {
            .slideease-container-${uniqueId}[data-effect="logo-grid"] {
              padding: 0.55rem 0.4rem;
            }
            .slideease-container-${uniqueId}[data-effect="logo-grid"] .se-logo-cell {
              padding: 0.4rem 0.45rem;
            }
            .slideease-container-${uniqueId}[data-effect="logo-grid"] .se-logo-card {
              padding: 0.5rem 0.55rem;
              min-height: calc(min(44px, var(--se-logo-height, 64px)) + 0.9rem);
              border-radius: 12px;
            }
            .slideease-container-${uniqueId}[data-effect="logo-grid"] .se-logo-cell img {
              max-width: 100%;
              max-height: min(44px, var(--se-logo-height, 64px));
            }
          }
          .slideease-container-${uniqueId} .se-story-focus {
            position: relative; overflow: hidden; height: var(--se-render-height); background: #111;
            box-shadow: 0 10px 28px rgba(18, 24, 38, 0.14);
          }
          .slideease-container-${uniqueId}.se-root--stories .se-story-focus__copy {
            padding: 0.9rem !important;
          }
          .slideease-container-${uniqueId}.se-root--stories .se-eyebrow {
            font-size: 0.7rem;
            margin: 0 0 0.35rem;
          }
          .slideease-container-${uniqueId}.se-root--stories .se-heading {
            font-size: 1.4rem;
            max-width: 100%;
            margin: 0 0 0.4rem;
          }
          .slideease-container-${uniqueId}.se-root--stories .se-desc {
            font-size: 0.92rem;
            margin: 0 0 0.8rem;
            -webkit-line-clamp: 2;
          }
          .slideease-container-${uniqueId}.se-root--stories .se-copy-plate {
            gap: 0.15rem;
            max-width: 100%;
          }
          .slideease-container-${uniqueId}.se-root--stories {
            --se-render-height: var(--se-height);
            overflow: visible;
            max-width: 100%;
            margin-inline: auto;
            padding: 0.25rem 0.5rem 0.5rem;
          }
          .slideease-container-${uniqueId}.se-root--stories .se-stories-rings {
            display: flex;
            gap: 12px;
            justify-content: center;
            overflow-x: auto;
            padding: 0 4px 12px;
            scrollbar-width: thin;
          }
          .slideease-container-${uniqueId}.se-root--stories .se-stories-ring {
            border: none;
            background: transparent;
            padding: 0;
            cursor: pointer;
            text-align: center;
            width: 72px;
            flex: 0 0 auto;
            font: inherit;
            color: #170f49;
          }
          .slideease-container-${uniqueId}.se-root--stories .se-stories-ring__avatar {
            display: block;
            width: 64px;
            height: 64px;
            border-radius: 50%;
            padding: 3px;
            margin: 0 auto;
            background: linear-gradient(135deg, #d1d5db, #9ca3af);
            box-sizing: border-box;
          }
          .slideease-container-${uniqueId}.se-root--stories .se-stories-ring.is-active .se-stories-ring__avatar {
            background: linear-gradient(135deg, #ed8104, #170f49);
          }
          .slideease-container-${uniqueId}.se-root--stories .se-stories-ring__img {
            display: block;
            width: 100%;
            height: 100%;
            border-radius: 50%;
            overflow: hidden;
            border: 2px solid #fff;
            background: #f3f4f6;
            box-sizing: border-box;
          }
          .slideease-container-${uniqueId}.se-root--stories .se-stories-ring__img img {
            width: 100%; height: 100%; object-fit: cover; display: block;
          }
          .slideease-container-${uniqueId}.se-root--stories .se-stories-ring__label {
            display: block;
            margin-top: 6px;
            font-size: 11px;
            font-weight: 600;
            color: #170f49;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }
          .slideease-container-${uniqueId}.se-root--stories .se-stories-stage {
            position: relative;
            max-width: 360px;
            width: 100%;
            margin: 0 auto;
          }
          .slideease-container-${uniqueId}.se-root--stories .se-stories-progress {
            height: 3px;
            background: #e7e7e7;
            border-radius: 999px;
            overflow: hidden;
            margin-bottom: 10px;
          }
          .slideease-container-${uniqueId}.se-root--stories .se-stories-progress__bar {
            display: block;
            height: 100%;
            width: 0%;
            background: #ed8104;
            border-radius: inherit;
            transition: width 0.3s ease;
          }
          .slideease-container-${uniqueId}.se-root--stories .se-slider,
          .slideease-container-${uniqueId}.se-root--stories .slick-list,
          .slideease-container-${uniqueId}.se-root--stories .slick-track,
          .slideease-container-${uniqueId}.se-root--stories .slick-slide,
          .slideease-container-${uniqueId}.se-root--stories .slick-slide > div,
          .slideease-container-${uniqueId}.se-root--stories [data-slideease-slide-id] {
            height: var(--se-render-height) !important;
            min-height: var(--se-render-height) !important;
          }
          .slideease-container-${uniqueId}.se-root--stories .se-nav {
            width: 34px;
            height: 34px;
            opacity: 0.95;
          }
          .slideease-container-${uniqueId}.se-root--stories .se-nav--prev { left: 10px; }
          .slideease-container-${uniqueId}.se-root--stories .se-nav--next { right: 10px; }
          .slideease-container-${uniqueId}.se-root--stories .se-progress { display: none !important; }
          .slideease-container-${uniqueId}.se-root--stories .slideease-dots-${uniqueId} { display: none !important; }
          @media (max-width: 640px) {
            .slideease-container-${uniqueId}.se-root--stories .se-stories-rings {
              justify-content: center;
            }
          }
          .slideease-container-${uniqueId} .se-announce {
            height: var(--se-height, 48px) !important;
            min-height: var(--se-height, 48px) !important;
            max-height: var(--se-height, 48px);
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.75rem;
            padding: 0 2.75rem;
            flex-wrap: wrap;
            text-align: center;
            width: 100%;
            box-sizing: border-box;
            position: relative;
            overflow: hidden;
          }
          .slideease-container-${uniqueId} .se-announce__text {
            font-weight: 600;
            font-size: 0.92rem;
            line-height: 1.3;
          }
          .slideease-container-${uniqueId} .se-announce__ctas {
            display: inline-flex;
            flex-wrap: wrap;
            gap: 0.4rem;
            align-items: center;
          }
          .slideease-container-${uniqueId} .se-announce__cta {
            display: inline-flex;
            align-items: center;
            padding: 0.25rem 0.65rem;
            border-radius: 999px;
            border: 1px solid rgba(255,255,255,0.45);
            color: inherit;
            text-decoration: none;
            font-size: 0.75rem;
            font-weight: 700;
            line-height: 1.2;
            background: transparent;
          }
          /* Announcement only — slim bar, height from settings */
          .slideease-container-${uniqueId}.se-root--announce {
            width: 100%;
            max-width: 100%;
            margin: 0;
            padding: 0;
            overflow: visible;
            --se-render-height: var(--se-height, 48px);
          }
          .slideease-container-${uniqueId}.se-root--announce .se-slider,
          .slideease-container-${uniqueId}.se-root--announce .slick-list,
          .slideease-container-${uniqueId}.se-root--announce .slick-track,
          .slideease-container-${uniqueId}.se-root--announce .slick-slide,
          .slideease-container-${uniqueId}.se-root--announce .slick-slide > div,
          .slideease-container-${uniqueId}.se-root--announce [data-slideease-slide-id] {
            height: var(--se-height, 48px) !important;
            min-height: var(--se-height, 48px) !important;
            max-height: var(--se-height, 48px);
          }
          .slideease-container-${uniqueId}.se-root--announce .slick-list {
            width: 100% !important;
          }
          .slideease-container-${uniqueId}.se-root--announce .se-nav {
            width: 28px;
            height: 28px;
            opacity: 0.92;
            border: 1px solid rgba(255,255,255,0.35);
            box-shadow: none;
            backdrop-filter: none;
            -webkit-backdrop-filter: none;
          }
          .slideease-container-${uniqueId}.se-root--announce .se-nav--prev { left: 8px; }
          .slideease-container-${uniqueId}.se-root--announce .se-nav--next { right: 8px; }
          .slideease-container-${uniqueId}.se-root--announce .se-nav svg {
            width: 14px;
            height: 14px;
          }
          .slideease-container-${uniqueId}.se-root--announce .slideease-dots-${uniqueId},
          .slideease-container-${uniqueId}.se-root--announce .se-progress {
            display: none !important;
          }
          .slideease-container-${uniqueId} .se-frame--boxed { max-width: 100%; margin-inline: auto; }
    `
  }


  function renderPremiumProductSlide(slide, settings, index, variant = "coverflow") {
    const cx = variant === "circular" ? "se-pcc" : "se-pcf"
    const slideAttr = variant === "circular" ? "data-se-pcc-slide" : "data-se-pcf-slide"
    const heading = slide.heading || slide.title || "Product"
    const description = slide.description || ""
    const compareAt = String(slide.compareAtPrice || "").trim()
    const ctaHref = safeUrl(slide.ctaUrl) || ""
    const targetAttrs = slide.ctaNewTab ? ' target="_blank" rel="noopener noreferrer"' : ""
    const imageUrl = escapeHtml(safeUrl(slide.imageUrl) || "")
    const hoverImageUrl = escapeHtml(safeUrl(slide.hoverImageUrl) || "")
    const showPrice = settings.showPrice !== false
    const showShopNow = settings.showShopNow !== false
    const showAddToCart = settings.showAddToCart !== false
    const showSoldOut = settings.showSoldOut !== false
    const salesBadgeMode = normalizeSalesBadgeMode(settings.salesBadgeMode)
    const salesBadgeFormat = normalizeSalesBadgeFormat(settings.salesBadgeFormat)
    const salesBadgeText =
      settings.salesBadgeText == null
        ? salesBadgeFormat === "custom"
          ? "{percent}% OFF"
          : "OFF"
        : String(settings.salesBadgeText)
    const shopLabel = escapeHtml(slide.ctaText || "View product")
    const soldOutLabel = escapeHtml(settings.soldOutText || "Sold out")
    const atcLabel = escapeHtml(settings.addToCartText || "Add to cart")
    const variantId = String(slide.variantId || "").replace(/\D/g, "")
    const productHandle =
      productHandleFromUrl(slide.ctaUrl || ctaHref || "") ||
      String(slide.subheading || "").trim()
    const isSoldOut = slide.availableForSale === false
    const saleDiscountPercent = Number(slide.saleDiscountPercent)
    const saleBadgeLabel =
      salesBadgeMode === "automatic" && Number.isFinite(saleDiscountPercent) && saleDiscountPercent > 0
        ? formatSaleBadgeLabel(saleDiscountPercent, {
            format: salesBadgeFormat,
            text: salesBadgeText,
          })
        : ""
    const badgeClass = saleBadgeLabel.toLowerCase().includes("sale") || saleBadgeLabel.includes("%")
      ? `${cx}-card__badge ${cx}-card__badge--sale se-product-card__badge`
      : `${cx}-card__badge se-product-card__badge`
    const badgeHtml = saleBadgeLabel
      ? `<span class="${badgeClass}" aria-hidden="true">${escapeHtml(saleBadgeLabel)}</span>`
      : ""
    const mediaInner = imageUrl
      ? `<img class="${cx}-card__image se-product-card__img se-product-card__img--primary" src="${imageUrl}" alt="${escapeHtml(slide.imageAlt || heading)}" width="800" height="1000" loading="${index === 0 ? "eager" : "lazy"}"${index === 0 ? ' fetchpriority="high"' : ""} decoding="async" />${
          hoverImageUrl
            ? `<img class="${cx}-card__image ${cx}-card__image--hover se-product-card__img se-product-card__img--hover" src="${hoverImageUrl}" alt="" aria-hidden="true" loading="lazy" decoding="async" />`
            : ""
        }${badgeHtml}`
      : badgeHtml
    const priceHtml =
      showPrice && description
        ? `<p class="${cx}-card__price"><span class="${cx}-card__amount">${escapeHtml(description)}</span>${
            compareAt ? `<span class="${cx}-card__compare">${escapeHtml(compareAt)}</span>` : ""
          }</p>`
        : ""
    const actions = []
    if (showAddToCart && (variantId || productHandle || isSoldOut)) {
      if (isSoldOut) {
        if (showSoldOut) {
          actions.push(
            `<button type="button" class="se-product-card__atc se-product-card__atc--soldout" disabled aria-disabled="true" data-sold-out="1" data-slide-id="${escapeHtml(slide.id)}">${soldOutLabel}</button>`,
          )
        }
      } else {
        actions.push(
          `<button type="button" class="se-product-card__atc" data-variant-id="${escapeHtml(variantId)}" data-product-handle="${escapeHtml(productHandle)}" data-slide-id="${escapeHtml(slide.id)}" data-show-sold-out="${showSoldOut ? "1" : "0"}">${atcLabel}</button>`,
        )
      }
    }
    if (showShopNow) {
      actions.push(
        `<a class="${cx}-card__cta slideease-cta" data-slide-id="${escapeHtml(slide.id)}" href="${escapeHtml(ctaHref || "#")}"${targetAttrs}>${shopLabel}</a>`,
      )
    }
    const canQuickAdd = !isSoldOut && Boolean(variantId || productHandle)
    const quickAddContent = buildQuickAddContent(settings)
    const quickAddHtml = canQuickAdd
      ? `<button type="button" class="se-product-card__atc se-product-card__quick-add" data-variant-id="${escapeHtml(variantId)}" data-product-handle="${escapeHtml(productHandle)}" data-slide-id="${escapeHtml(slide.id)}" data-show-sold-out="${showSoldOut ? "1" : "0"}" aria-label="Quick Add">${quickAddContent}</button>`
      : ""
    const cardMods = [
      hoverImageUrl ? `${cx}-card--has-hover se-product-card--has-hover` : "",
      canQuickAdd ? `${cx}-card--quick-add se-product-card--quick-add` : "",
    ]
      .filter(Boolean)
      .join(" ")
    const actionsHtml = actions.length
      ? `<div class="${cx}-card__actions">${actions.join("")}</div>`
      : ""
    return `
      <li class="${cx}__slide${index === 0 ? " is-active" : ""}" ${slideAttr} data-product-title="${escapeHtml(heading)}"${index === 0 ? ' aria-current="true"' : ""}>
        <article class="${cx}-card se-product-card${cardMods ? ` ${cardMods}` : ""}" data-product-handle="${escapeHtml(productHandle)}" data-variant-id="${escapeHtml(variantId)}" data-slideease-slide-id="${escapeHtml(slide.id)}">
          <div class="${cx}-card__media se-product-card__media">
            ${ctaHref ? `<a class="se-product-card__media-link" href="${escapeHtml(ctaHref)}"${targetAttrs} style="display:block;height:100%;position:relative;">${mediaInner}</a>` : mediaInner}
            ${quickAddHtml}
          </div>
          <div class="${cx}-card__body">
            <h3 class="${cx}-card__title">${
              ctaHref
                ? `<a href="${escapeHtml(ctaHref)}"${targetAttrs}>${escapeHtml(heading)}</a>`
                : escapeHtml(heading)
            }</h3>
            ${priceHtml}
            ${actionsHtml}
          </div>
        </article>
      </li>`
  }

  function renderPremiumCoverflow(data) {
    const settings = data.settings || {}
    const slides = (data.slides || []).filter((s) => s && s.isVisible !== false)
    if (!slides.length) {
      removeNode(`${uniqueId}-loading`)
      renderMessage("No slides available", "This slider does not have any visible slides yet.")
      return
    }

    // Start coverflow engine early so styles/init arrive ASAP (reduces FOUC)
    const premiumSrc = `${apiOrigin}/premium-coverflow.js?v=65`
    const premiumReady = loadScriptOnce(premiumSrc)

    trackEvent("view", slides[0]?.id)

    const salesBadgeMode = normalizeSalesBadgeMode(settings.salesBadgeMode)
    const salesBadgeFormat = normalizeSalesBadgeFormat(settings.salesBadgeFormat)
    const salesBadgeText = String(
      settings.salesBadgeText == null
        ? salesBadgeFormat === "custom"
          ? "{percent}% OFF"
          : "OFF"
        : settings.salesBadgeText,
    )

    const sectionSubheading = String(settings.sectionSubheading || "").trim()
    const sectionHeading = String(settings.sectionHeading || "").trim()
    const sectionDescription = String(settings.sectionDescription || "").trim()
    const headerParts = []
    if (sectionSubheading) {
      headerParts.push(`<span class="se-pcf__eyebrow">${escapeHtml(sectionSubheading)}</span>`)
    }
    if (sectionHeading) {
      headerParts.push(`<h2 class="se-pcf__heading">${escapeHtml(sectionHeading)}</h2>`)
    }
    if (sectionDescription) {
      headerParts.push(`<p class="se-pcf__subheading">${escapeHtml(sectionDescription)}</p>`)
    }
    const headerHtml = headerParts.length
      ? `<header class="se-pcf__header">${headerParts.join("")}</header>`
      : ""

    const showNav = settings.arrows !== false
    const showDots = settings.dots !== false
    const coverflowConfig = {
      autoplay: Boolean(settings.autoplay),
      autoplayDelay: Number(settings.autoplaySpeed) || 4200,
      navigation: showNav,
      pagination: showDots,
      loop: settings.infinite !== false,
      transitionSpeed: Number(settings.speed) || 620,
    }

    const ctaBg = escapeHtml(settings.ctaBackground || "#1a1816")
    const ctaColor = escapeHtml(settings.ctaTextColor || "#f7f5f1")
    const ctaBorder = escapeHtml(settings.ctaBorderColor || settings.ctaBackground || "#1a1816")
    const ctaHoverBg = escapeHtml(
      settings.ctaHoverBackground === "" || settings.ctaHoverBackground == null
        ? "transparent"
        : settings.ctaHoverBackground,
    )
    const ctaHoverColor = escapeHtml(settings.ctaHoverTextColor || settings.ctaBackground || "#1a1816")
    const atcBg = escapeHtml(settings.atcBackground || settings.ctaBackground || "#1a1816")
    const atcColor = escapeHtml(settings.atcTextColor || settings.ctaTextColor || "#f7f5f1")
    const atcBorder = escapeHtml(settings.atcBorderColor || settings.ctaBorderColor || atcBg)
    const atcHoverBg = escapeHtml(settings.atcHoverBackground || settings.ctaHoverBackground || "transparent")
    const atcHoverColor = escapeHtml(settings.atcHoverTextColor || settings.ctaHoverTextColor || atcBg)
    const quickAddBg = escapeHtml(settings.quickAddBackground || "#170f49")
    const quickAddSize = Math.min(Math.max(Number(settings.quickAddTextSize ?? 11), 8), 24)
    const ctaRadius = Math.min(Math.max(Number(settings.ctaBorderRadius ?? 1), 0), 50)
    const sectionBgTransparent = settings.sectionBackgroundTransparent === true
    const sectionBgCustom = String(settings.sectionBackground || "").trim()
    const defaultSectionBg =
      "radial-gradient(120% 80% at 50% 0%, rgba(255, 255, 255, 0.55) 0%, transparent 55%), linear-gradient(165deg, #ece8e2 0%, #d9d4cc 100%)"
    const sectionBgValue = sectionBgTransparent
      ? "transparent"
      : sectionBgCustom
        ? escapeHtml(sectionBgCustom)
        : defaultSectionBg
    const pcfStyleVars = [
      `--cf-cta-bg:${ctaBg}`,
      `--cf-cta-color:${ctaColor}`,
      `--cf-cta-border:${ctaBorder}`,
      `--cf-cta-hover-bg:${ctaHoverBg}`,
      `--cf-cta-hover-color:${ctaHoverColor}`,
      `--cf-cta-radius:${ctaRadius}px`,
      `--cf-atc-bg:${atcBg}`,
      `--cf-atc-color:${atcColor}`,
      `--cf-atc-border:${atcBorder}`,
      `--cf-atc-hover-bg:${atcHoverBg}`,
      `--cf-atc-hover-color:${atcHoverColor}`,
      `--cf-quick-add-bg:${quickAddBg}`,
      `--cf-quick-add-size:${quickAddSize}px`,
      `--cf-section-bg:${sectionBgValue}`,
      `--cf-sales-badge-bg:${escapeHtml(settings.salesBadgeBackground || "#170f49")}`,
      `--cf-sales-badge-pad:${Math.min(Math.max(Number(settings.salesBadgePadding ?? 8), 0), 24)}px`,
    ].join(";")

    const slidesHtml = slides.map((slide, i) => renderPremiumProductSlide(slide, settings, i)).join("")

    const markup = `
      <style id="se-pcf-boot-${uniqueId}">
        .slideease-container-${uniqueId}.se-root--premium {
          width: 100%;
          max-width: none;
          display: block;
        }
        .slideease-container-${uniqueId} .se-pcf {
          width: 100vw;
          max-width: 100vw;
          margin-left: calc(50% - 50vw);
          margin-right: calc(50% - 50vw);
          box-sizing: border-box;
        }
        .slideease-container-${uniqueId} .se-pcf:not(.is-ready) .se-pcf__stage,
        .slideease-container-${uniqueId} .se-pcf:not(.is-ready) .se-pcf__controls,
        .slideease-container-${uniqueId} .se-pcf:not(.is-ready) .se-pcf__header {
          opacity: 0 !important;
          visibility: hidden !important;
          pointer-events: none !important;
        }
        .slideease-container-${uniqueId} .se-pcf:not(.is-ready) .se-pcf__stage {
          min-height: min(78vw, 560px);
        }
        .slideease-container-${uniqueId} .se-pcf:not(.is-ready) .se-pcf__slide {
          position: absolute !important;
          top: 50%;
          left: 50%;
          opacity: 0 !important;
        }
        .slideease-container-${uniqueId} .se-pcf.is-ready .se-pcf__stage,
        .slideease-container-${uniqueId} .se-pcf.is-ready .se-pcf__controls,
        .slideease-container-${uniqueId} .se-pcf.is-ready .se-pcf__header {
          opacity: 1;
          visibility: visible;
          transition: opacity 160ms ease, visibility 160ms ease;
        }
      </style>
      <section class="slideease-container-${uniqueId} se-root se-root--premium se-root--products" data-effect="premium-coverflow" data-sales-badge-mode="${escapeHtml(salesBadgeMode)}" data-sales-badge-format="${escapeHtml(salesBadgeFormat)}" data-sales-badge-text="${escapeHtml(salesBadgeText)}" aria-roledescription="carousel">
        <div class="se-pcf" data-se-pcf data-se-pcf-config='${escapeHtml(JSON.stringify(coverflowConfig))}' aria-label="${escapeHtml(sectionHeading || data.name || "Featured products")}" aria-busy="true" style="${pcfStyleVars}">
          <div class="se-pcf__inner">
            ${headerHtml}
            <div class="se-pcf__stage" data-se-pcf-stage>
              <ul class="se-pcf__track" data-se-pcf-track>
                ${slidesHtml}
              </ul>
            </div>
            <div class="se-pcf__controls">
              <div class="se-pcf__nav" data-se-pcf-nav${showNav ? "" : " hidden"}>
                <button type="button" class="se-pcf__arrow" data-se-pcf-prev aria-label="Previous product">
                  <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path d="M10.2 2.2 4.4 8l5.8 5.8" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
                </button>
                <button type="button" class="se-pcf__arrow" data-se-pcf-next aria-label="Next product">
                  <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path d="M5.8 2.2 11.6 8l-5.8 5.8" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
                </button>
              </div>
              <ul class="se-pcf__pagination" data-se-pcf-pagination aria-label="Product pagination"${showDots ? "" : " hidden"}></ul>
            </div>
            <div class="se-pcf__live" data-se-pcf-live aria-live="polite" aria-atomic="true"></div>
          </div>
        </div>
      </section>
    `

    let pcfRoot = null

    const mountPremium = () => {
      const root = document.querySelector(`.slideease-container-${uniqueId}`)
      pcfRoot = root?.querySelector("[data-se-pcf]")
      if (!pcfRoot || !window.SEPremiumCoverflow) {
        throw new Error("Premium coverflow unavailable")
      }
      document.querySelectorAll(`.slideease-container-${uniqueId} .slideease-cta`).forEach((el) => {
        el.addEventListener("click", () => {
          trackEvent("cta_click", el.getAttribute("data-slide-id"))
        })
      })
      wireProductInteractions(root, settings)
      window.SEPremiumCoverflow.init(pcfRoot, coverflowConfig)
      pcfRoot.setAttribute("aria-busy", "false")
      removeNode(`${uniqueId}-loading`)
      document.addEventListener("shopify:section:unload", () => {
        window.SEPremiumCoverflow?.getInstance?.(pcfRoot)?.destroy?.()
      })
    }

    // Wait for engine CSS before painting markup — avoids horizontal product FOUC
    premiumReady
      .then(() => {
        window.SEPremiumCoverflow?.injectStyles?.()
        insertAdjacent(markup)
        mountPremium()
      })
      .catch(() => {
        removeNode(`${uniqueId}-loading`)
        renderMessage("Slider unavailable", "Could not load premium coverflow.")
      })

    // Full reload / back navigation: keep transforms painted if engine is already warm
    window.addEventListener("pageshow", (event) => {
      if (!pcfRoot || !document.contains(pcfRoot)) return
      const existing = window.SEPremiumCoverflow?.getInstance?.(pcfRoot)
      if (existing) {
        pcfRoot.classList.add("is-instant", "is-ready")
        existing._render?.({ animate: false })
        requestAnimationFrame(() => pcfRoot.classList.remove("is-instant"))
        return
      }
      if (event.persisted && window.SEPremiumCoverflow) {
        try {
          mountPremium()
        } catch (_) {
          /* ignore */
        }
      }
    })
  }

  function renderPremiumCircular(data) {
    const settings = data.settings || {}
    const slides = (data.slides || []).filter((s) => s && s.isVisible !== false)
    if (!slides.length) {
      removeNode(`${uniqueId}-loading`)
      renderMessage("No slides available", "This slider does not have any visible slides yet.")
      return
    }

    // Start circular engine early so styles/init arrive ASAP (reduces FOUC)
    const premiumSrc = `${apiOrigin}/premium-circular.js?v=65`
    const premiumReady = loadScriptOnce(premiumSrc)

    trackEvent("view", slides[0]?.id)

    const salesBadgeMode = normalizeSalesBadgeMode(settings.salesBadgeMode)
    const salesBadgeFormat = normalizeSalesBadgeFormat(settings.salesBadgeFormat)
    const salesBadgeText = String(
      settings.salesBadgeText == null
        ? salesBadgeFormat === "custom"
          ? "{percent}% OFF"
          : "OFF"
        : settings.salesBadgeText,
    )

    const sectionSubheading = String(settings.sectionSubheading || "").trim()
    const sectionHeading = String(settings.sectionHeading || "").trim()
    const sectionDescription = String(settings.sectionDescription || "").trim()
    const headerParts = []
    if (sectionSubheading) {
      headerParts.push(`<span class="se-pcc__eyebrow">${escapeHtml(sectionSubheading)}</span>`)
    }
    if (sectionHeading) {
      headerParts.push(`<h2 class="se-pcc__heading">${escapeHtml(sectionHeading)}</h2>`)
    }
    if (sectionDescription) {
      headerParts.push(`<p class="se-pcc__subheading">${escapeHtml(sectionDescription)}</p>`)
    }
    const headerHtml = headerParts.length
      ? `<header class="se-pcc__header">${headerParts.join("")}</header>`
      : ""

    const showNav = settings.arrows !== false
    const showDots = settings.dots !== false
    const circularConfig = {
      autoplay: Boolean(settings.autoplay),
      autoplayDelay: Number(settings.autoplaySpeed) || 4500,
      navigation: showNav,
      pagination: showDots,
      loop: settings.infinite !== false,
      transitionDuration: Number(settings.speed) || 650,
    }

    const ctaBg = escapeHtml(settings.ctaBackground || "#121417")
    const ctaColor = escapeHtml(settings.ctaTextColor || "#f4f5f7")
    const ctaBorder = escapeHtml(settings.ctaBorderColor || settings.ctaBackground || "#121417")
    const ctaHoverBg = escapeHtml(
      settings.ctaHoverBackground === "" || settings.ctaHoverBackground == null
        ? "transparent"
        : settings.ctaHoverBackground,
    )
    const ctaHoverColor = escapeHtml(settings.ctaHoverTextColor || settings.ctaBackground || "#121417")
    const atcBg = escapeHtml(settings.atcBackground || settings.ctaBackground || "#121417")
    const atcColor = escapeHtml(settings.atcTextColor || settings.ctaTextColor || "#f4f5f7")
    const atcBorder = escapeHtml(settings.atcBorderColor || settings.ctaBorderColor || atcBg)
    const atcHoverBg = escapeHtml(settings.atcHoverBackground || settings.ctaHoverBackground || "transparent")
    const atcHoverColor = escapeHtml(settings.atcHoverTextColor || settings.ctaHoverTextColor || atcBg)
    const quickAddBg = escapeHtml(settings.quickAddBackground || "#170f49")
    const quickAddSize = Math.min(Math.max(Number(settings.quickAddTextSize ?? 11), 8), 24)
    const ctaRadius = Math.min(Math.max(Number(settings.ctaBorderRadius ?? 1), 0), 50)
    const sectionBgTransparent = settings.sectionBackgroundTransparent === true
    const sectionBgCustom = String(settings.sectionBackground || "").trim()
    const defaultSectionBg =
      "radial-gradient(90% 70% at 50% 18%, rgba(255,255,255,0.65) 0%, transparent 58%), linear-gradient(168deg, #e8e9eb 0%, #d5d7db 100%)"
    const sectionBgValue = sectionBgTransparent
      ? "transparent"
      : sectionBgCustom
        ? escapeHtml(sectionBgCustom)
        : defaultSectionBg
    const pccStyleVars = [
      `--pcc-cta-bg:${ctaBg}`,
      `--pcc-cta-color:${ctaColor}`,
      `--pcc-cta-border:${ctaBorder}`,
      `--pcc-cta-hover-bg:${ctaHoverBg}`,
      `--pcc-cta-hover-color:${ctaHoverColor}`,
      `--pcc-cta-radius:${ctaRadius}px`,
      `--pcc-atc-bg:${atcBg}`,
      `--pcc-atc-color:${atcColor}`,
      `--pcc-atc-border:${atcBorder}`,
      `--pcc-atc-hover-bg:${atcHoverBg}`,
      `--pcc-atc-hover-color:${atcHoverColor}`,
      `--pcc-quick-add-bg:${quickAddBg}`,
      `--pcc-quick-add-size:${quickAddSize}px`,
      `--pcc-section-bg:${sectionBgValue}`,
      `--pcc-sales-badge-bg:${escapeHtml(settings.salesBadgeBackground || "#170f49")}`,
      `--pcc-sales-badge-pad:${Math.min(Math.max(Number(settings.salesBadgePadding ?? 8), 0), 24)}px`,
    ].join(";")

    const slidesHtml = slides
      .map((slide, i) => renderPremiumProductSlide(slide, settings, i, "circular"))
      .join("")

    const markup = `
      <style id="se-pcc-boot-${uniqueId}">
        .slideease-container-${uniqueId}.se-root--premium {
          width: 100%;
          max-width: none;
          display: block;
        }
        .slideease-container-${uniqueId} .se-pcc {
          width: 100vw;
          max-width: 100vw;
          margin-left: calc(50% - 50vw);
          margin-right: calc(50% - 50vw);
          box-sizing: border-box;
        }
        .slideease-container-${uniqueId} .se-pcc:not(.is-ready) .se-pcc__stage,
        .slideease-container-${uniqueId} .se-pcc:not(.is-ready) .se-pcc__controls,
        .slideease-container-${uniqueId} .se-pcc:not(.is-ready) .se-pcc__header {
          opacity: 0 !important;
          visibility: hidden !important;
          pointer-events: none !important;
        }
        .slideease-container-${uniqueId} .se-pcc:not(.is-ready) .se-pcc__stage {
          min-height: min(78vw, 560px);
        }
        .slideease-container-${uniqueId} .se-pcc:not(.is-ready) .se-pcc__slide {
          position: absolute !important;
          top: 50%;
          left: 50%;
          opacity: 0 !important;
        }
        .slideease-container-${uniqueId} .se-pcc.is-ready .se-pcc__stage,
        .slideease-container-${uniqueId} .se-pcc.is-ready .se-pcc__controls,
        .slideease-container-${uniqueId} .se-pcc.is-ready .se-pcc__header {
          opacity: 1;
          visibility: visible;
          transition: opacity 160ms ease, visibility 160ms ease;
        }
      </style>
      <section class="slideease-container-${uniqueId} se-root se-root--premium se-root--products" data-effect="premium-circular" data-sales-badge-mode="${escapeHtml(salesBadgeMode)}" data-sales-badge-format="${escapeHtml(salesBadgeFormat)}" data-sales-badge-text="${escapeHtml(salesBadgeText)}" aria-roledescription="carousel">
        <div class="se-pcc" data-se-pcc data-se-pcc-config='${escapeHtml(JSON.stringify(circularConfig))}' aria-label="${escapeHtml(sectionHeading || data.name || "Featured products")}" aria-busy="true" style="${pccStyleVars}">
          <div class="se-pcc__inner">
            ${headerHtml}
            <div class="se-pcc__stage" data-se-pcc-stage>
              <ul class="se-pcc__track" data-se-pcc-track>
                ${slidesHtml}
              </ul>
            </div>
            <div class="se-pcc__controls">
              <div class="se-pcc__nav" data-se-pcc-nav${showNav ? "" : " hidden"}>
                <button type="button" class="se-pcc__arrow" data-se-pcc-prev aria-label="Previous product">
                  <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path d="M10.2 2.2 4.4 8l5.8 5.8" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
                </button>
                <button type="button" class="se-pcc__arrow" data-se-pcc-next aria-label="Next product">
                  <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path d="M5.8 2.2 11.6 8l-5.8 5.8" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
                </button>
              </div>
              <ul class="se-pcc__pagination" data-se-pcc-pagination aria-label="Product pagination"${showDots ? "" : " hidden"}></ul>
            </div>
            <div class="se-pcc__live" data-se-pcc-live aria-live="polite" aria-atomic="true"></div>
          </div>
        </div>
      </section>
    `

    let pccRoot = null

    const mountPremium = () => {
      const root = document.querySelector(`.slideease-container-${uniqueId}`)
      pccRoot = root?.querySelector("[data-se-pcc]")
      if (!pccRoot || !window.SEPremiumCircular) {
        throw new Error("Premium circular unavailable")
      }
      document.querySelectorAll(`.slideease-container-${uniqueId} .slideease-cta`).forEach((el) => {
        el.addEventListener("click", () => {
          trackEvent("cta_click", el.getAttribute("data-slide-id"))
        })
      })
      wireProductInteractions(root, settings)
      window.SEPremiumCircular.init(pccRoot, circularConfig)
      pccRoot.setAttribute("aria-busy", "false")
      removeNode(`${uniqueId}-loading`)
      document.addEventListener("shopify:section:unload", () => {
        window.SEPremiumCircular?.getInstance?.(pccRoot)?.destroy?.()
      })
    }

    // Wait for engine CSS before painting markup — avoids horizontal product FOUC
    premiumReady
      .then(() => {
        window.SEPremiumCircular?.injectStyles?.()
        insertAdjacent(markup)
        mountPremium()
      })
      .catch(() => {
        removeNode(`${uniqueId}-loading`)
        renderMessage("Slider unavailable", "Could not load premium circular.")
      })

    // Full reload / back navigation: keep transforms painted if engine is already warm
    window.addEventListener("pageshow", (event) => {
      if (!pccRoot || !document.contains(pccRoot)) return
      const existing = window.SEPremiumCircular?.getInstance?.(pccRoot)
      if (existing) {
        pccRoot.classList.add("is-instant", "is-ready")
        existing._render?.({ animate: false })
        requestAnimationFrame(() => pccRoot.classList.remove("is-instant"))
        return
      }
      if (event.persisted && window.SEPremiumCircular) {
        try {
          mountPremium()
        } catch (_) {
          /* ignore */
        }
      }
    })
  }

  function formatCollectionItemCount(raw) {
    const n = Number(raw)
    if (!Number.isFinite(n) || n < 0) return ""
    const rounded = Math.round(n)
    return `${rounded} ${rounded === 1 ? "item" : "items"}`
  }

  function renderCollectionSlide(slide, settings, index) {
    const title = String(slide.heading || slide.title || "Collection").trim()
    const description = String(slide.description || "").trim()
    const imageUrl = String(slide.imageUrl || "").trim()
    const href = String(slide.ctaUrl || "#").trim() || "#"
    const ctaText = String(
      slide.ctaText || settings.exploreCtaText || "Explore Collection",
    ).trim() || "Explore Collection"
    const showCount = settings.showItemCount !== false
    const countLabel = showCount ? formatCollectionItemCount(slide.subheading) : ""
    const alt = escapeHtml(slide.imageAlt || title)
    const eager = index === 0

    const mediaHtml = imageUrl
      ? `<div class="collection-3d__media">
            <img
              class="collection-3d__image"
              src="${escapeHtml(imageUrl)}"
              alt="${alt}"
              width="1000"
              height="1333"
              loading="${eager ? "eager" : "lazy"}"
              ${eager ? 'fetchpriority="high"' : ""}
              decoding="async"
            />
            <div class="collection-3d__overlay" aria-hidden="true"></div>
          </div>`
      : `<div class="collection-3d__media collection-3d__media--empty">
            <div class="collection-3d__overlay" aria-hidden="true"></div>
          </div>`

    const countHtml = countLabel
      ? `<p class="collection-3d__count">${escapeHtml(countLabel)}</p>`
      : ""
    const descriptionHtml = description
      ? `<p class="collection-3d__description">${escapeHtml(description)}</p>`
      : ""
    const ctaHtml =
      settings.showShopNow === false
        ? ""
        : `<span class="collection-3d__cta slideease-cta" data-slide-id="${escapeHtml(String(slide.id || ""))}">${escapeHtml(ctaText)}</span>`

    return `
      <li class="collection-3d__slide${index === 0 ? " is-active" : ""}" data-collection-3d-slide data-collection-title="${escapeHtml(title)}"${index === 0 ? ' aria-current="true"' : ""}>
        <a class="collection-3d__card" href="${escapeHtml(href)}">
          ${mediaHtml}
          <div class="collection-3d__content">
            ${countHtml}
            <h3 class="collection-3d__title">${escapeHtml(title)}</h3>
            ${descriptionHtml}
            ${ctaHtml}
          </div>
        </a>
      </li>
    `
  }

  function renderCollectionCarousel(data) {
    const settings = data.settings || {}
    const slides = (data.slides || []).filter((s) => s && s.isVisible !== false)
    if (!slides.length) {
      removeNode(`${uniqueId}-loading`)
      renderMessage("No collections available", "Select collections in the SlideEase app to populate this carousel.")
      return
    }

    const engineSrc = `${apiOrigin}/collection-carousel.js?v=3`
    const engineReady = loadScriptOnce(engineSrc)

    trackEvent("view", slides[0]?.id)

    const sectionSubheading = String(settings.sectionSubheading || "").trim()
    const sectionHeading = String(settings.sectionHeading || "").trim()
    const sectionDescription = String(settings.sectionDescription || "").trim()
    const headerParts = []
    if (sectionSubheading) {
      headerParts.push(`<span class="collection-3d__eyebrow">${escapeHtml(sectionSubheading)}</span>`)
    }
    if (sectionHeading) {
      headerParts.push(`<h2 class="collection-3d__heading">${escapeHtml(sectionHeading)}</h2>`)
    }
    if (sectionDescription) {
      headerParts.push(`<p class="collection-3d__subheading">${escapeHtml(sectionDescription)}</p>`)
    }
    const headerHtml = headerParts.length
      ? `<header class="collection-3d__header">${headerParts.join("")}</header>`
      : ""

    const showNav = settings.arrows !== false
    const showDots = settings.dots !== false
    const carouselConfig = {
      perspective: Number(settings.c3Perspective) || 1400,
      depth: Number(settings.c3Depth) || 200,
      rotation: Number(settings.c3Rotation) || 42,
      scale: Number(settings.c3Scale) || 0.78,
      scaleStep: Number(settings.c3ScaleStep) || 0.09,
      spacing: Number(settings.c3Spacing) || 250,
      overlay: Number(settings.c3Overlay ?? settings.overlayOpacity ?? 0.55),
      borderRadius: Number(settings.borderRadius ?? 4),
      transitionDuration: Number(settings.speed) || 700,
      autoplay: Boolean(settings.autoplay),
      autoplayDelay: Number(settings.autoplaySpeed) || 4800,
      navigation: showNav,
      pagination: showDots,
      loop: settings.infinite !== false,
      visibleSlides: Number(settings.visibleSlides) || 5,
      tabletVisibleSlides: Number(settings.tabletVisibleSlides) || 3,
      mobileVisibleSlides: Number(settings.mobileVisibleSlides) || 3,
      clickNeighborToCenter: true,
      respectReducedMotion: true,
    }

    const sectionBgTransparent = settings.sectionBackgroundTransparent === true
    const sectionBgCustom = String(settings.sectionBackground || "").trim()
    const defaultSectionBg =
      "radial-gradient(85% 60% at 50% 0%, rgba(255, 255, 255, 0.55) 0%, transparent 58%), linear-gradient(168deg, #ece8e2 0%, #d8d2c8 100%)"
    const sectionBgValue = sectionBgTransparent
      ? "transparent"
      : sectionBgCustom
        ? escapeHtml(sectionBgCustom)
        : defaultSectionBg

    const styleVars = [
      `--c3-section-bg:${sectionBgValue}`,
      `--c3-overlay:${carouselConfig.overlay}`,
      `--c3-radius:${carouselConfig.borderRadius}px`,
      `--c3-perspective:${carouselConfig.perspective}px`,
    ].join(";")

    const slidesHtml = slides.map((slide, i) => renderCollectionSlide(slide, settings, i)).join("")

    const markup = `
      <style id="se-c3-boot-${uniqueId}">
        .slideease-container-${uniqueId}.se-root--collection-carousel {
          width: 100%;
          max-width: none;
          display: block;
        }
        .slideease-container-${uniqueId} .collection-3d {
          width: 100vw;
          max-width: 100vw;
          margin-left: calc(50% - 50vw);
          margin-right: calc(50% - 50vw);
          box-sizing: border-box;
        }
        .slideease-container-${uniqueId} .collection-3d:not(.is-ready) .collection-3d__stage,
        .slideease-container-${uniqueId} .collection-3d:not(.is-ready) .collection-3d__controls,
        .slideease-container-${uniqueId} .collection-3d:not(.is-ready) .collection-3d__header {
          opacity: 0 !important;
          visibility: hidden !important;
          pointer-events: none !important;
        }
        .slideease-container-${uniqueId} .collection-3d:not(.is-ready) .collection-3d__stage {
          min-height: min(78vw, 560px);
        }
        .slideease-container-${uniqueId} .collection-3d:not(.is-ready) .collection-3d__slide {
          position: absolute !important;
          top: 50%;
          left: 50%;
          opacity: 0 !important;
        }
        .slideease-container-${uniqueId} .collection-3d.is-ready .collection-3d__stage,
        .slideease-container-${uniqueId} .collection-3d.is-ready .collection-3d__controls,
        .slideease-container-${uniqueId} .collection-3d.is-ready .collection-3d__header {
          opacity: 1;
          visibility: visible;
          transition: opacity 160ms ease, visibility 160ms ease;
        }
      </style>
      <section class="slideease-container-${uniqueId} se-root se-root--collection-carousel" data-effect="collection-carousel" aria-roledescription="carousel">
        <div class="collection-3d" data-collection-3d data-collection-3d-config='${escapeHtml(JSON.stringify(carouselConfig))}' aria-label="${escapeHtml(sectionHeading || data.name || "Collections")}" aria-busy="true" style="${styleVars}">
          <div class="collection-3d__inner">
            ${headerHtml}
            <div class="collection-3d__stage" data-collection-3d-stage>
              <ul class="collection-3d__track" data-collection-3d-track>
                ${slidesHtml}
              </ul>
            </div>
            <div class="collection-3d__controls">
              <div class="collection-3d__nav" data-collection-3d-nav${showNav ? "" : " hidden"}>
                <button type="button" class="collection-3d__arrow" data-collection-3d-prev aria-label="Previous collection">
                  <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path d="M10.2 2.2 4.4 8l5.8 5.8" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
                </button>
                <button type="button" class="collection-3d__arrow" data-collection-3d-next aria-label="Next collection">
                  <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path d="M5.8 2.2 11.6 8l-5.8 5.8" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
                </button>
              </div>
              <ul class="collection-3d__pagination" data-collection-3d-pagination aria-label="Collection pagination"${showDots ? "" : " hidden"}></ul>
            </div>
            <div class="collection-3d__live" data-collection-3d-live aria-live="polite" aria-atomic="true"></div>
          </div>
        </div>
      </section>
    `

    let c3Root = null

    const mountCarousel = () => {
      const root = document.querySelector(`.slideease-container-${uniqueId}`)
      c3Root = root?.querySelector("[data-collection-3d]")
      if (!c3Root || !window.SECollectionCarousel) {
        throw new Error("Collection carousel unavailable")
      }
      document.querySelectorAll(`.slideease-container-${uniqueId} .slideease-cta`).forEach((el) => {
        el.addEventListener("click", () => {
          trackEvent("cta_click", el.getAttribute("data-slide-id"))
        })
      })
      window.SECollectionCarousel.init(c3Root, carouselConfig)
      c3Root.setAttribute("aria-busy", "false")
      removeNode(`${uniqueId}-loading`)
      document.addEventListener("shopify:section:unload", () => {
        window.SECollectionCarousel?.getInstance?.(c3Root)?.destroy?.()
      })
    }

    engineReady
      .then(() => {
        window.SECollectionCarousel?.injectStyles?.()
        insertAdjacent(markup)
        mountCarousel()
      })
      .catch(() => {
        removeNode(`${uniqueId}-loading`)
        renderMessage("Slider unavailable", "Could not load collection carousel.")
      })

    window.addEventListener("pageshow", (event) => {
      if (!c3Root || !document.contains(c3Root)) return
      const existing = window.SECollectionCarousel?.getInstance?.(c3Root)
      if (existing) {
        c3Root.classList.add("is-instant", "is-ready")
        existing._render?.({ animate: false })
        requestAnimationFrame(() => c3Root.classList.remove("is-instant"))
        return
      }
      if (event.persisted && window.SECollectionCarousel) {
        try {
          mountCarousel()
        } catch (_) {
          /* ignore */
        }
      }
    })
  }

  function renderStackedProductSlide(slide, settings, index) {
    const heading = slide.heading || slide.title || "Product"
    const description = String(slide.description || "").trim()
    const compareAt = String(slide.compareAtPrice || "").trim()
    const ctaHref = safeUrl(slide.ctaUrl) || ""
    const targetAttrs = slide.ctaNewTab ? ' target="_blank" rel="noopener noreferrer"' : ""
    const imageUrl = escapeHtml(safeUrl(slide.imageUrl) || "")
    const hoverImageUrl = escapeHtml(safeUrl(slide.hoverImageUrl) || "")
    const showPrice = settings.showPrice !== false
    const showShopNow = settings.showShopNow !== false
    const showAddToCart = settings.showAddToCart !== false
    const showSoldOut = settings.showSoldOut !== false
    const shopLabel = escapeHtml(slide.ctaText || "View product")
    const soldOutLabel = escapeHtml(settings.soldOutText || "Sold out")
    const atcLabel = escapeHtml(settings.addToCartText || "Add to cart")
    const variantId = String(slide.variantId || "").replace(/\D/g, "")
    const productHandle =
      productHandleFromUrl(slide.ctaUrl || ctaHref || "") ||
      String(slide.subheading || "").trim()
    const isSoldOut = slide.availableForSale === false
    const salesBadgeMode = normalizeSalesBadgeMode(settings.salesBadgeMode)
    const salesBadgeFormat = normalizeSalesBadgeFormat(settings.salesBadgeFormat)
    const salesBadgeText =
      settings.salesBadgeText == null
        ? salesBadgeFormat === "custom"
          ? "{percent}% OFF"
          : "OFF"
        : String(settings.salesBadgeText)
    const saleDiscountPercent = Number(slide.saleDiscountPercent)
    const saleBadgeLabel =
      salesBadgeMode === "automatic" && Number.isFinite(saleDiscountPercent) && saleDiscountPercent > 0
        ? formatSaleBadgeLabel(saleDiscountPercent, {
            format: salesBadgeFormat,
            text: salesBadgeText,
          })
        : ""
    const badgeHtml = saleBadgeLabel
      ? `<span class="stacked-card__badge stacked-card__badge--sale se-product-card__badge" aria-hidden="true">${escapeHtml(saleBadgeLabel)}</span>`
      : ""
    const priceHtml =
      showPrice && description
        ? `<p class="stacked-card__price"><span class="stacked-card__amount">${escapeHtml(description)}</span>${
            compareAt ? `<span class="stacked-card__compare">${escapeHtml(compareAt)}</span>` : ""
          }</p>`
        : ""
    const titleHtml = ctaHref
      ? `<a href="${escapeHtml(ctaHref)}"${targetAttrs}>${escapeHtml(heading)}</a>`
      : escapeHtml(heading)
    const actions = []
    if (showAddToCart && (variantId || productHandle || isSoldOut)) {
      if (isSoldOut) {
        if (showSoldOut) {
          actions.push(
            `<button type="button" class="se-product-card__atc se-product-card__atc--soldout" disabled aria-disabled="true" data-sold-out="1" data-slide-id="${escapeHtml(String(slide.id || ""))}">${soldOutLabel}</button>`,
          )
        }
      } else {
        actions.push(
          `<button type="button" class="se-product-card__atc" data-variant-id="${escapeHtml(variantId)}" data-product-handle="${escapeHtml(productHandle)}" data-slide-id="${escapeHtml(String(slide.id || ""))}" data-show-sold-out="${showSoldOut ? "1" : "0"}">${atcLabel}</button>`,
        )
      }
    }
    if (showShopNow) {
      actions.push(
        `<a class="stacked-card__cta slideease-cta" data-slide-id="${escapeHtml(String(slide.id || ""))}" href="${escapeHtml(ctaHref || "#")}"${targetAttrs}>${shopLabel}</a>`,
      )
    }
    const actionsHtml = actions.length
      ? `<div class="stacked-card__actions">${actions.join("")}</div>`
      : ""
    const canQuickAdd = !isSoldOut && Boolean(variantId || productHandle)
    const quickAddContent = buildQuickAddContent(settings)
    const quickAddHtml = canQuickAdd
      ? `<button type="button" class="se-product-card__atc se-product-card__quick-add" data-variant-id="${escapeHtml(variantId)}" data-product-handle="${escapeHtml(productHandle)}" data-slide-id="${escapeHtml(String(slide.id || ""))}" data-show-sold-out="${showSoldOut ? "1" : "0"}" aria-label="Quick Add">${quickAddContent}</button>`
      : ""
    const mediaInner = imageUrl
      ? `<img class="stacked-card__image se-product-card__img se-product-card__img--primary" src="${imageUrl}" alt="${escapeHtml(slide.imageAlt || heading)}" width="800" height="1000" loading="${index === 0 ? "eager" : "lazy"}"${index === 0 ? ' fetchpriority="high"' : ""} decoding="async" />${
          hoverImageUrl
            ? `<img class="stacked-card__image stacked-card__image--hover se-product-card__img se-product-card__img--hover" src="${hoverImageUrl}" alt="" aria-hidden="true" loading="lazy" decoding="async" />`
            : ""
        }`
      : ""
    const mediaHtml = ctaHref
      ? `<a class="se-product-card__media-link" href="${escapeHtml(ctaHref)}"${targetAttrs} style="display:block;height:100%;position:relative;">${mediaInner}${badgeHtml}</a>`
      : `${badgeHtml}${mediaInner}`
    const cardMods = [
      canQuickAdd ? "se-product-card--quick-add stacked-card--quick-add" : "",
      hoverImageUrl ? "se-product-card--has-hover stacked-card--has-hover" : "",
    ]
      .filter(Boolean)
      .join(" ")

    return `
      <li class="stacked-carousel__slide${index === 0 ? " is-active" : ""}" data-stacked-slide data-product-title="${escapeHtml(heading)}"${index === 0 ? ' aria-current="true"' : ""}>
        <article class="stacked-card se-product-card${cardMods ? ` ${cardMods}` : ""}" data-product-handle="${escapeHtml(productHandle)}" data-variant-id="${escapeHtml(variantId)}" data-slideease-slide-id="${escapeHtml(String(slide.id || ""))}">
          <div class="stacked-card__media se-product-card__media">
            ${mediaHtml}
            ${quickAddHtml}
          </div>
          <div class="stacked-card__body">
            <h3 class="stacked-card__title">${titleHtml}</h3>
            ${priceHtml}
            ${actionsHtml}
          </div>
        </article>
      </li>
    `
  }

  function renderPremiumStacked(data) {
    const settings = data.settings || {}
    const slides = (data.slides || []).filter((s) => s && s.isVisible !== false)
    if (!slides.length) {
      removeNode(`${uniqueId}-loading`)
      renderMessage("No slides available", "This slider does not have any visible slides yet.")
      return
    }

    const engineSrc = `${apiOrigin}/premium-stacked.js?v=7`
    const engineReady = loadScriptOnce(engineSrc)
    trackEvent("view", slides[0]?.id)

    const salesBadgeMode = normalizeSalesBadgeMode(settings.salesBadgeMode)
    const salesBadgeFormat = normalizeSalesBadgeFormat(settings.salesBadgeFormat)
    const salesBadgeText = String(
      settings.salesBadgeText == null
        ? salesBadgeFormat === "custom"
          ? "{percent}% OFF"
          : "OFF"
        : settings.salesBadgeText,
    )

    const sectionSubheading = String(settings.sectionSubheading || "").trim()
    const sectionHeading = String(settings.sectionHeading || "").trim()
    const sectionDescription = String(settings.sectionDescription || "").trim()
    const headerParts = []
    if (sectionSubheading) {
      headerParts.push(`<span class="stacked-carousel__eyebrow">${escapeHtml(sectionSubheading)}</span>`)
    }
    if (sectionHeading) {
      headerParts.push(`<h2 class="stacked-carousel__heading">${escapeHtml(sectionHeading)}</h2>`)
    }
    if (sectionDescription) {
      headerParts.push(`<p class="stacked-carousel__subheading">${escapeHtml(sectionDescription)}</p>`)
    }
    const headerHtml = headerParts.length
      ? `<header class="stacked-carousel__header">${headerParts.join("")}</header>`
      : ""

    const showNav = settings.arrows !== false
    const showDots = settings.dots !== false
    const stackedConfig = {
      stackDepth: Number(settings.stackDepth) || 4,
      horizontalOffset: Number(settings.stackHorizontalOffset) || 42,
      verticalOffset: Number(settings.stackVerticalOffset) || 22,
      scaleDifference: Number(settings.stackScaleDifference) || 0.07,
      rotation: Number(settings.stackRotation) || 2,
      depthStep: Number(settings.stackDepthStep) || 56,
      perspective: Number(settings.stackPerspective) || 1200,
      animationDuration: Number(settings.speed) || 680,
      autoplay: Boolean(settings.autoplay),
      autoplayDelay: Number(settings.autoplaySpeed) || 4400,
      navigation: showNav,
      pagination: showDots,
      loop: settings.infinite !== false,
    }

    const sectionBgTransparent = settings.sectionBackgroundTransparent === true
    const sectionBgCustom = String(settings.sectionBackground || "").trim()
    const defaultSectionBg =
      "radial-gradient(95% 75% at 50% 10%, rgba(255, 255, 255, 0.55) 0%, transparent 55%), linear-gradient(165deg, #efece7 0%, #ddd8d0 100%)"
    const sectionBgValue = sectionBgTransparent
      ? "transparent"
      : sectionBgCustom
        ? escapeHtml(sectionBgCustom)
        : defaultSectionBg

    const quickAddBg = escapeHtml(settings.quickAddBackground || "#170f49")
    const quickAddSize = Math.min(Math.max(Number(settings.quickAddTextSize ?? 11), 8), 24)
    const styleVars = [
      `--sc-section-bg:${sectionBgValue}`,
      `--sc-perspective:${stackedConfig.perspective}px`,
      `--sc-radius:${Number(settings.borderRadius ?? 4)}px`,
      `--sc-sales-badge-bg:${escapeHtml(settings.salesBadgeBackground || "#170f49")}`,
      `--sc-sales-badge-pad:${Math.min(Math.max(Number(settings.salesBadgePadding ?? 8), 0), 24)}px`,
      `--sc-quick-add-bg:${quickAddBg}`,
      `--sc-quick-add-size:${quickAddSize}px`,
    ].join(";")

    const slidesHtml = slides.map((slide, i) => renderStackedProductSlide(slide, settings, i)).join("")

    const markup = `
      <style id="se-stacked-boot-${uniqueId}">
        .slideease-container-${uniqueId}.se-root--premium {
          width: 100%;
          max-width: none;
          display: block;
        }
        .slideease-container-${uniqueId} .stacked-carousel {
          width: 100vw;
          max-width: 100vw;
          margin-left: calc(50% - 50vw);
          margin-right: calc(50% - 50vw);
          box-sizing: border-box;
        }
        .slideease-container-${uniqueId} .stacked-carousel:not(.is-ready) .stacked-carousel__stage,
        .slideease-container-${uniqueId} .stacked-carousel:not(.is-ready) .stacked-carousel__controls,
        .slideease-container-${uniqueId} .stacked-carousel:not(.is-ready) .stacked-carousel__header {
          opacity: 0 !important;
          visibility: hidden !important;
          pointer-events: none !important;
        }
        .slideease-container-${uniqueId} .stacked-carousel:not(.is-ready) .stacked-carousel__stage {
          min-height: min(78vw, 560px);
        }
        .slideease-container-${uniqueId} .stacked-carousel.is-ready .stacked-carousel__stage,
        .slideease-container-${uniqueId} .stacked-carousel.is-ready .stacked-carousel__controls,
        .slideease-container-${uniqueId} .stacked-carousel.is-ready .stacked-carousel__header {
          opacity: 1;
          visibility: visible;
          transition: opacity 160ms ease, visibility 160ms ease;
        }
      </style>
      <section class="slideease-container-${uniqueId} se-root se-root--premium se-root--products se-root--stacked" data-effect="premium-stacked" data-sales-badge-mode="${escapeHtml(salesBadgeMode)}" data-sales-badge-format="${escapeHtml(salesBadgeFormat)}" data-sales-badge-text="${escapeHtml(salesBadgeText)}" aria-roledescription="carousel">
        <div class="stacked-carousel" data-stacked data-stacked-config='${escapeHtml(JSON.stringify(stackedConfig))}' aria-label="${escapeHtml(sectionHeading || data.name || "Featured products")}" aria-busy="true" style="${styleVars}">
          <div class="stacked-carousel__inner">
            ${headerHtml}
            <div class="stacked-carousel__stage" data-stacked-stage>
              <ul class="stacked-carousel__track" data-stacked-track>
                ${slidesHtml}
              </ul>
            </div>
            <div class="stacked-carousel__controls">
              <div class="stacked-carousel__nav" data-stacked-nav${showNav ? "" : " hidden"}>
                <button type="button" class="stacked-carousel__arrow" data-stacked-prev aria-label="Previous product">
                  <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path d="M10.2 2.2 4.4 8l5.8 5.8" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
                </button>
                <button type="button" class="stacked-carousel__arrow" data-stacked-next aria-label="Next product">
                  <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path d="M5.8 2.2 11.6 8l-5.8 5.8" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
                </button>
              </div>
              <ul class="stacked-carousel__pagination" data-stacked-pagination aria-label="Product pagination"${showDots ? "" : " hidden"}></ul>
            </div>
            <div class="stacked-carousel__live" data-stacked-live aria-live="polite" aria-atomic="true"></div>
          </div>
        </div>
      </section>
    `

    let stackedRoot = null

    const mountStacked = () => {
      const root = document.querySelector(`.slideease-container-${uniqueId}`)
      stackedRoot = root?.querySelector("[data-stacked]")
      if (!stackedRoot || !window.SEPremiumStacked) {
        throw new Error("Premium stacked unavailable")
      }
      document.querySelectorAll(`.slideease-container-${uniqueId} .slideease-cta`).forEach((el) => {
        el.addEventListener("click", () => {
          trackEvent("cta_click", el.getAttribute("data-slide-id"))
        })
      })
      wireProductInteractions(root, settings)
      window.SEPremiumStacked.init(stackedRoot, stackedConfig)
      stackedRoot.setAttribute("aria-busy", "false")
      removeNode(`${uniqueId}-loading`)
      document.addEventListener("shopify:section:unload", () => {
        window.SEPremiumStacked?.getInstance?.(stackedRoot)?.destroy?.()
      })
    }

    engineReady
      .then(() => {
        window.SEPremiumStacked?.injectStyles?.()
        insertAdjacent(markup)
        mountStacked()
      })
      .catch(() => {
        removeNode(`${uniqueId}-loading`)
        renderMessage("Slider unavailable", "Could not load stacked carousel.")
      })

    window.addEventListener("pageshow", (event) => {
      if (!stackedRoot || !document.contains(stackedRoot)) return
      const existing = window.SEPremiumStacked?.getInstance?.(stackedRoot)
      if (existing) {
        stackedRoot.classList.add("is-instant", "is-ready")
        existing._render?.({ animate: false })
        requestAnimationFrame(() => stackedRoot.classList.remove("is-instant"))
        return
      }
      if (event.persisted && window.SEPremiumStacked) {
        try {
          mountStacked()
        } catch (_) {
          /* ignore */
        }
      }
    })
  }

  function t3StarSvg(filled) {
    return `<svg class="testimonials-3d__star${filled ? "" : " is-empty"}" viewBox="0 0 20 20" aria-hidden="true" focusable="false"><path fill="currentColor" d="M10 1.5l2.47 5.01 5.53.8-4 3.9.94 5.5L10 14.9l-4.94 2.6.94-5.5-4-3.9 5.53-.8L10 1.5z"/></svg>`
  }

  function t3StarsHtml(rating) {
    const n = Math.min(5, Math.max(1, Math.round(Number(rating) || 5)))
    const items = []
    for (let i = 1; i <= 5; i += 1) {
      items.push(`<li>${t3StarSvg(i <= n)}</li>`)
    }
    return `<ul class="testimonials-3d__stars" aria-label="${n} out of 5 stars">${items.join("")}</ul>`
  }

  function t3Initials(name) {
    const parts = String(name || "")
      .trim()
      .split(/\s+/)
      .filter(Boolean)
    if (!parts.length) return "?"
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  }

  function t3VerifiedHtml() {
    return `<span class="testimonials-3d__verified"><svg viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path fill="currentColor" d="M8 0a8 8 0 1 0 0 16A8 8 0 0 0 8 0Zm3.3 5.7-3.8 3.8-1.8-1.8a.75.75 0 1 0-1.06 1.06l2.33 2.33a.75.75 0 0 0 1.06 0l4.33-4.33a.75.75 0 1 0-1.06-1.06Z"/></svg>Verified</span>`
  }

  function renderTestimonials3DSlide(slide, index) {
    const quote = String(slide.heading || slide.title || "").trim() || "Customer quote"
    const author = String(slide.subheading || slide.title || "").trim() || "Customer"
    const role = String(slide.description || "").trim()
    const imageUrl = String(safeUrl(slide.imageUrl) || "").trim()
    const logoUrl = String(safeUrl(slide.logoUrl || slide.hoverImageUrl) || "").trim()
    const rating = Math.min(5, Math.max(1, Math.round(Number(slide.rating) || 5)))
    const verified = slide.verified === true || slide.verified === "true" || slide.verified === 1
    const alt = escapeHtml(slide.imageAlt || author)
    const eager = index === 0

    const avatarHtml = imageUrl
      ? `<img class="testimonials-3d__avatar" src="${escapeHtml(imageUrl)}" alt="${alt}" width="48" height="48" loading="${eager ? "eager" : "lazy"}"${eager ? ' fetchpriority="high"' : ""} decoding="async" />`
      : `<span class="testimonials-3d__avatar-fallback" aria-hidden="true">${escapeHtml(t3Initials(author))}</span>`

    const roleHtml = role ? `<p class="testimonials-3d__role">${escapeHtml(role)}</p>` : ""
    const verifiedHtml = verified ? t3VerifiedHtml() : ""
    const logoHtml = logoUrl
      ? `<img class="testimonials-3d__logo" src="${escapeHtml(logoUrl)}" alt="" loading="lazy" decoding="async" />`
      : ""

    return `
      <li class="testimonials-3d__slide${index === 0 ? " is-active" : ""}" data-testimonials-3d-slide data-author="${escapeHtml(author)}"${index === 0 ? ' aria-current="true"' : ""}>
        <article class="testimonials-3d__card">
          ${t3StarsHtml(rating)}
          <blockquote class="testimonials-3d__quote">\u201C${escapeHtml(quote)}\u201D</blockquote>
          <footer class="testimonials-3d__footer">
            ${avatarHtml}
            <div class="testimonials-3d__meta">
              <div class="testimonials-3d__name-row">
                <p class="testimonials-3d__name">${escapeHtml(author)}</p>
                ${verifiedHtml}
              </div>
              ${roleHtml}
            </div>
            ${logoHtml}
          </footer>
        </article>
      </li>
    `
  }

  function renderTestimonials3D(data) {
    const settings = data.settings || {}
    const slides = (data.slides || []).filter((s) => s && s.isVisible !== false)
    if (!slides.length) {
      removeNode(`${uniqueId}-loading`)
      renderMessage("No testimonials available", "This slider does not have any visible slides yet.")
      return
    }

    const engineSrc = `${apiOrigin}/testimonials-3d.js?v=1`
    const engineReady = loadScriptOnce(engineSrc)
    trackEvent("view", slides[0]?.id)

    const sectionSubheading = String(settings.sectionSubheading || "").trim()
    const sectionHeading = String(settings.sectionHeading || "").trim()
    const sectionDescription = String(settings.sectionDescription || "").trim()
    const headerParts = []
    if (sectionSubheading) {
      headerParts.push(`<span class="testimonials-3d__eyebrow">${escapeHtml(sectionSubheading)}</span>`)
    }
    if (sectionHeading) {
      headerParts.push(`<h2 class="testimonials-3d__heading">${escapeHtml(sectionHeading)}</h2>`)
    }
    if (sectionDescription) {
      headerParts.push(`<p class="testimonials-3d__subheading">${escapeHtml(sectionDescription)}</p>`)
    }
    const headerHtml = headerParts.length
      ? `<header class="testimonials-3d__header">${headerParts.join("")}</header>`
      : ""

    const showNav = settings.arrows !== false
    const showDots = settings.dots !== false
    const t3Config = {
      cardWidth: Number(settings.t3CardWidth) || 420,
      cardMinHeight: Number(settings.t3CardMinHeight) || 280,
      perspective: Number(settings.t3Perspective) || 1300,
      depth: Number(settings.t3Depth) || 200,
      rotation: Number(settings.t3Rotation) || 14,
      scale: Number(settings.t3Scale) || 0.86,
      scaleStep: Number(settings.t3ScaleStep) || 0.06,
      sideOpacity: Number(settings.t3SideOpacity) || 0.72,
      spacing: Number(settings.t3Spacing) || 260,
      sideVisibility: Number(settings.t3SideVisibility) || 1,
      floating: settings.t3Floating !== false,
      animationSpeed: Number(settings.speed) || 680,
      autoplay: Boolean(settings.autoplay),
      autoplayDelay: Number(settings.autoplaySpeed) || 5000,
      navigation: showNav,
      pagination: showDots,
      loop: settings.infinite !== false,
    }

    const sectionBgTransparent = settings.sectionBackgroundTransparent === true
    const sectionBgCustom = String(settings.sectionBackground || "").trim()
    const defaultSectionBg =
      "radial-gradient(80% 60% at 50% 0%, rgba(255, 255, 255, 0.85) 0%, transparent 60%), linear-gradient(165deg, #f4f6f8 0%, #e8ecf0 100%)"
    const sectionBgValue = sectionBgTransparent
      ? "transparent"
      : sectionBgCustom
        ? escapeHtml(sectionBgCustom)
        : defaultSectionBg

    const styleVars = [
      `--t3-section-bg:${sectionBgValue}`,
      `--t3-perspective:${t3Config.perspective}px`,
      `--t3-radius:${Number(settings.borderRadius ?? 18)}px`,
      `--t3-accent:${escapeHtml(settings.accentColor || "#2f6fed")}`,
      `--t3-star:${escapeHtml(settings.starColor || "#e6a817")}`,
    ].join(";")

    const slidesHtml = slides.map((slide, i) => renderTestimonials3DSlide(slide, i)).join("")

    const markup = `
      <style id="se-t3-boot-${uniqueId}">
        .slideease-container-${uniqueId}.se-root--testimonials-3d {
          width: 100%;
          max-width: none;
          display: block;
        }
        .slideease-container-${uniqueId} .testimonials-3d {
          width: 100vw;
          max-width: 100vw;
          margin-left: calc(50% - 50vw);
          margin-right: calc(50% - 50vw);
          box-sizing: border-box;
        }
        .slideease-container-${uniqueId} .testimonials-3d:not(.is-ready) .testimonials-3d__stage,
        .slideease-container-${uniqueId} .testimonials-3d:not(.is-ready) .testimonials-3d__controls,
        .slideease-container-${uniqueId} .testimonials-3d:not(.is-ready) .testimonials-3d__header {
          opacity: 0 !important;
          visibility: hidden !important;
          pointer-events: none !important;
        }
        .slideease-container-${uniqueId} .testimonials-3d:not(.is-ready) .testimonials-3d__stage {
          min-height: min(78vw, 520px);
        }
        .slideease-container-${uniqueId} .testimonials-3d:not(.is-ready) .testimonials-3d__slide {
          position: absolute !important;
          top: 50%;
          left: 50%;
          opacity: 0 !important;
        }
        .slideease-container-${uniqueId} .testimonials-3d.is-ready .testimonials-3d__stage,
        .slideease-container-${uniqueId} .testimonials-3d.is-ready .testimonials-3d__controls,
        .slideease-container-${uniqueId} .testimonials-3d.is-ready .testimonials-3d__header {
          opacity: 1;
          visibility: visible;
          transition: opacity 160ms ease, visibility 160ms ease;
        }
      </style>
      <section class="slideease-container-${uniqueId} se-root se-root--testimonials-3d" data-effect="testimonials-3d" aria-roledescription="carousel">
        <div class="testimonials-3d${t3Config.floating ? " is-floating" : ""}" data-testimonials-3d data-testimonials-3d-config='${escapeHtml(JSON.stringify(t3Config))}' aria-label="${escapeHtml(sectionHeading || data.name || "Testimonials")}" aria-busy="true" style="${styleVars}">
          <div class="testimonials-3d__inner">
            ${headerHtml}
            <div class="testimonials-3d__stage" data-testimonials-3d-stage>
              <ul class="testimonials-3d__track" data-testimonials-3d-track>
                ${slidesHtml}
              </ul>
            </div>
            <div class="testimonials-3d__controls">
              <div class="testimonials-3d__nav" data-testimonials-3d-nav${showNav ? "" : " hidden"}>
                <button type="button" class="testimonials-3d__arrow" data-testimonials-3d-prev aria-label="Previous testimonial">
                  <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path d="M10.2 2.2 4.4 8l5.8 5.8" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
                </button>
                <button type="button" class="testimonials-3d__arrow" data-testimonials-3d-next aria-label="Next testimonial">
                  <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path d="M5.8 2.2 11.6 8l-5.8 5.8" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
                </button>
              </div>
              <ul class="testimonials-3d__pagination" data-testimonials-3d-pagination aria-label="Testimonial pagination"${showDots ? "" : " hidden"}></ul>
            </div>
            <div class="testimonials-3d__live" data-testimonials-3d-live aria-live="polite" aria-atomic="true"></div>
          </div>
        </div>
      </section>
    `

    let t3Root = null

    const mountTestimonials3D = () => {
      const root = document.querySelector(`.slideease-container-${uniqueId}`)
      t3Root = root?.querySelector("[data-testimonials-3d]")
      if (!t3Root || !window.SETestimonials3D) {
        throw new Error("Testimonials 3D unavailable")
      }
      window.SETestimonials3D.init(t3Root, t3Config)
      t3Root.setAttribute("aria-busy", "false")
      removeNode(`${uniqueId}-loading`)
      document.addEventListener("shopify:section:unload", () => {
        window.SETestimonials3D?.getInstance?.(t3Root)?.destroy?.()
      })
    }

    engineReady
      .then(() => {
        window.SETestimonials3D?.injectStyles?.()
        insertAdjacent(markup)
        mountTestimonials3D()
      })
      .catch(() => {
        removeNode(`${uniqueId}-loading`)
        renderMessage("Slider unavailable", "Could not load 3D testimonials.")
      })

    window.addEventListener("pageshow", (event) => {
      if (!t3Root || !document.contains(t3Root)) return
      const existing = window.SETestimonials3D?.getInstance?.(t3Root)
      if (existing) {
        t3Root.classList.add("is-instant", "is-ready")
        existing._render?.({ animate: false })
        requestAnimationFrame(() => t3Root.classList.remove("is-instant"))
        return
      }
      if (event.persisted && window.SETestimonials3D) {
        try {
          mountTestimonials3D()
        } catch (_) {
          /* ignore */
        }
      }
    })
  }

  function ugcInitials(name) {
    const parts = String(name || "")
      .trim()
      .split(/\s+/)
      .filter(Boolean)
    if (!parts.length) return "?"
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  }

  function renderUgcFeedSlide(slide, index) {
    const title = String(slide.heading || slide.title || "").trim() || "UGC"
    const creator = String(slide.subheading || slide.title || "").trim()
    const handle = String(slide.creatorHandle || "").trim()
    const caption = String(slide.description || "").trim()
    const posterUrl = String(safeUrl(slide.imageUrl) || "").trim()
    const videoUrl = String(safeUrl(slide.videoUrl) || "").trim()
    const avatarUrl = String(safeUrl(slide.avatarUrl) || "").trim()
    const ctaText = String(slide.ctaText || "").trim()
    const ctaUrl = String(safeUrl(slide.ctaUrl) || slide.ctaUrl || "#").trim() || "#"
    const ctaTarget = slide.ctaOpenInNewTab ? ' target="_blank" rel="noopener noreferrer"' : ""
    const hasVideo = Boolean(videoUrl)
    const eager = index === 0
    const alt = escapeHtml(slide.imageAlt || title)

    const posterHtml = posterUrl
      ? `<img class="video-ugc-3d__poster" src="${escapeHtml(posterUrl)}" width="600" height="1067" alt="${alt}" loading="${eager ? "eager" : "lazy"}"${eager ? ' fetchpriority="high"' : ""} decoding="async" />`
      : ""

    const videoHtml = hasVideo
      ? `<video class="video-ugc-3d__video" playsinline loop muted${posterUrl ? ` poster="${escapeHtml(posterUrl)}"` : ""}>
                  <source data-src="${escapeHtml(videoUrl)}" type="video/mp4" />
                </video>`
      : ""

    const avatarHtml = avatarUrl
      ? `<img class="video-ugc-3d__avatar" src="${escapeHtml(avatarUrl)}" width="32" height="32" alt="" loading="${eager ? "eager" : "lazy"}" decoding="async" />`
      : `<span class="video-ugc-3d__avatar" style="display:inline-flex;align-items:center;justify-content:center;background:rgba(255,255,255,0.18);font-size:11px;font-weight:600;" aria-hidden="true">${escapeHtml(ugcInitials(creator || title))}</span>`

    const handleHtml = handle ? `<p class="video-ugc-3d__handle">${escapeHtml(handle)}</p>` : ""
    const captionHtml = caption ? `<p class="video-ugc-3d__description">${escapeHtml(caption)}</p>` : ""
    const ctaHtml = ctaText
      ? `<a class="video-ugc-3d__cta" href="${escapeHtml(ctaUrl)}"${ctaTarget}>${escapeHtml(ctaText)}</a>`
      : ""

    const controlsHtml = hasVideo
      ? `<div class="video-ugc-3d__media-controls" data-video-ugc-media-controls>
                <button type="button" class="video-ugc-3d__control" data-video-ugc-play aria-label="Play or pause">
                  <svg class="video-ugc-3d__icon-play" viewBox="0 0 16 16" aria-hidden="true"><path fill="currentColor" d="M4 2.5v11l9-5.5L4 2.5z"/></svg>
                  <svg class="video-ugc-3d__icon-pause" viewBox="0 0 16 16" aria-hidden="true"><path fill="currentColor" d="M4 3h3v10H4V3zm5 0h3v10H9V3z"/></svg>
                </button>
                <button type="button" class="video-ugc-3d__control" data-video-ugc-mute aria-label="Mute or unmute">
                  <svg class="video-ugc-3d__icon-mute" viewBox="0 0 16 16" aria-hidden="true"><path fill="currentColor" d="M2 6h3l3-3v10L5 10H2V6zm9.5 2l1.8-1.8.7.7L12.2 8l1.8 1.8-.7.7L11.5 8.7l-1.8 1.8-.7-.7L10.8 8 9 6.2l.7-.7L11.5 8z"/></svg>
                  <svg class="video-ugc-3d__icon-unmute" viewBox="0 0 16 16" aria-hidden="true"><path fill="currentColor" d="M2 6h3l3-3v10L5 10H2V6zm8 1.2a2.5 2.5 0 010 1.6v-1.6zm1.5-2.1a4.5 4.5 0 010 5.8l-.9-.7a3.3 3.3 0 000-4.4l.9-.7z"/></svg>
                </button>
              </div>`
      : ""

    return `
      <li class="video-ugc-3d__slide${index === 0 ? " is-active" : ""}${hasVideo ? "" : " is-image-only"}" data-video-ugc-slide data-video-title="${escapeHtml(title)}"${index === 0 ? ' aria-current="true"' : ""}>
        <article class="video-ugc-3d__card">
          <div class="video-ugc-3d__media">
            ${videoHtml}
            ${posterHtml}
            ${hasVideo ? '<div class="video-ugc-3d__fallback">Video unavailable</div>' : ""}
            <div class="video-ugc-3d__gradient" aria-hidden="true"></div>
          </div>
          <div class="video-ugc-3d__top">
            <div class="video-ugc-3d__creator">
              ${avatarHtml}
              <div class="video-ugc-3d__creator-text">
                ${creator ? `<p class="video-ugc-3d__name">${escapeHtml(creator)}</p>` : ""}
                ${handleHtml}
              </div>
            </div>
          </div>
          <div class="video-ugc-3d__bottom">
            <h3 class="video-ugc-3d__title">${escapeHtml(title)}</h3>
            ${captionHtml}
            ${ctaHtml}
          </div>
          ${controlsHtml}
        </article>
      </li>
    `
  }

  function renderUgcFeed(data) {
    const settings = data.settings || {}
    const slides = (data.slides || []).filter((s) => s && s.isVisible !== false)
    if (!slides.length) {
      removeNode(`${uniqueId}-loading`)
      renderMessage("No UGC slides available", "This slider does not have any visible slides yet.")
      return
    }

    const engineSrc = `${apiOrigin}/video-ugc-3d.js?v=3`
    const engineReady = loadScriptOnce(engineSrc)
    trackEvent("view", slides[0]?.id)

    const sectionSubheading = String(settings.sectionSubheading || "").trim()
    const sectionHeading = String(settings.sectionHeading || "").trim()
    const sectionDescription = String(settings.sectionDescription || "").trim()
    const headerParts = []
    if (sectionSubheading) {
      headerParts.push(`<span class="video-ugc-3d__eyebrow">${escapeHtml(sectionSubheading)}</span>`)
    }
    if (sectionHeading) {
      headerParts.push(`<h2 class="video-ugc-3d__heading">${escapeHtml(sectionHeading)}</h2>`)
    }
    if (sectionDescription) {
      headerParts.push(`<p class="video-ugc-3d__subheading">${escapeHtml(sectionDescription)}</p>`)
    }
    const headerHtml = headerParts.length
      ? `<header class="video-ugc-3d__header">${headerParts.join("")}</header>`
      : ""

    const showNav = settings.arrows !== false
    const showDots = settings.dots !== false
    const ugcConfig = {
      videoAspectRatio: "9 / 16",
      cardWidth: Number(settings.ugcCardWidth) || 280,
      perspective: Number(settings.ugcPerspective) || 1300,
      depth: Number(settings.ugcDepth) || 180,
      rotation: Number(settings.ugcRotation) || 18,
      scale: Number(settings.ugcScale) || 0.84,
      scaleStep: Number(settings.ugcScaleStep) || 0.07,
      spacing: Number(settings.ugcSpacing) || 200,
      visibleSlides: Number(settings.ugcVisibleSlides) || 5,
      tabletVisibleSlides: 3,
      mobileVisibleSlides: 3,
      autoplay: settings.autoplay !== false,
      mutedByDefault: settings.ugcMutedByDefault !== false,
      showMediaControls: settings.ugcShowMediaControls !== false,
      transitionDuration: Number(settings.speed) || 650,
      navigation: showNav,
      pagination: showDots,
      loop: settings.infinite !== false,
      carouselAutoplay: Boolean(settings.ugcCarouselAutoplay),
      carouselAutoplayDelay: Number(settings.autoplaySpeed) || 8000,
      clickNeighborToCenter: true,
      respectReducedMotion: true,
    }

    const sectionBgTransparent = settings.sectionBackgroundTransparent === true
    const sectionBgCustom = String(settings.sectionBackground || "").trim()
    const defaultSectionBg =
      "radial-gradient(70% 55% at 50% 20%, rgba(255, 255, 255, 0.05) 0%, transparent 55%), linear-gradient(180deg, #121417 0%, #1a1e24 100%)"
    const sectionBgValue = sectionBgTransparent
      ? "transparent"
      : sectionBgCustom
        ? escapeHtml(sectionBgCustom)
        : defaultSectionBg

    const styleVars = [
      `--vu-section-bg:${sectionBgValue}`,
      `--vu-perspective:${ugcConfig.perspective}px`,
      `--vu-radius:${Number(settings.borderRadius ?? 16)}px`,
    ].join(";")

    const slidesHtml = slides.map((slide, i) => renderUgcFeedSlide(slide, i)).join("")

    const markup = `
      <style id="se-ugc-boot-${uniqueId}">
        .slideease-container-${uniqueId}.se-root--ugc-feed {
          width: 100%;
          max-width: none;
          display: block;
        }
        .slideease-container-${uniqueId} .video-ugc-3d {
          width: 100vw;
          max-width: 100vw;
          margin-left: calc(50% - 50vw);
          margin-right: calc(50% - 50vw);
          box-sizing: border-box;
        }
        .slideease-container-${uniqueId} .video-ugc-3d:not(.is-ready) .video-ugc-3d__stage,
        .slideease-container-${uniqueId} .video-ugc-3d:not(.is-ready) .video-ugc-3d__controls,
        .slideease-container-${uniqueId} .video-ugc-3d:not(.is-ready) .video-ugc-3d__header {
          opacity: 0 !important;
          visibility: hidden !important;
          pointer-events: none !important;
        }
        .slideease-container-${uniqueId} .video-ugc-3d:not(.is-ready) .video-ugc-3d__stage {
          min-height: min(78vw, 560px);
        }
        .slideease-container-${uniqueId} .video-ugc-3d:not(.is-ready) .video-ugc-3d__slide {
          position: absolute !important;
          top: 50%;
          left: 50%;
          opacity: 0 !important;
        }
        .slideease-container-${uniqueId} .video-ugc-3d.is-ready .video-ugc-3d__stage,
        .slideease-container-${uniqueId} .video-ugc-3d.is-ready .video-ugc-3d__controls,
        .slideease-container-${uniqueId} .video-ugc-3d.is-ready .video-ugc-3d__header {
          opacity: 1;
          visibility: visible;
          transition: opacity 160ms ease, visibility 160ms ease;
        }
      </style>
      <section class="slideease-container-${uniqueId} se-root se-root--ugc-feed" data-effect="ugc-feed" aria-roledescription="carousel">
        <div class="video-ugc-3d" data-video-ugc data-video-ugc-config='${escapeHtml(JSON.stringify(ugcConfig))}' aria-label="${escapeHtml(sectionHeading || data.name || "UGC feed")}" aria-busy="true" style="${styleVars}">
          <div class="video-ugc-3d__inner">
            ${headerHtml}
            <div class="video-ugc-3d__stage" data-video-ugc-stage>
              <ul class="video-ugc-3d__track" data-video-ugc-track>
                ${slidesHtml}
              </ul>
            </div>
            <div class="video-ugc-3d__controls">
              <div class="video-ugc-3d__nav" data-video-ugc-nav${showNav ? "" : " hidden"}>
                <button type="button" class="video-ugc-3d__arrow" data-video-ugc-prev aria-label="Previous video">
                  <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path d="M10.2 2.2 4.4 8l5.8 5.8" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
                </button>
                <button type="button" class="video-ugc-3d__arrow" data-video-ugc-next aria-label="Next video">
                  <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path d="M5.8 2.2 11.6 8l-5.8 5.8" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
                </button>
              </div>
              <ul class="video-ugc-3d__pagination" data-video-ugc-pagination aria-label="UGC pagination"${showDots ? "" : " hidden"}></ul>
            </div>
            <div class="video-ugc-3d__live" data-video-ugc-live aria-live="polite" aria-atomic="true"></div>
          </div>
        </div>
      </section>
    `

    let ugcRoot = null

    const mountUgcFeed = () => {
      const root = document.querySelector(`.slideease-container-${uniqueId}`)
      ugcRoot = root?.querySelector("[data-video-ugc]")
      if (!ugcRoot || !window.SEVideoUgc3D) {
        throw new Error("UGC feed unavailable")
      }
      window.SEVideoUgc3D.init(ugcRoot, ugcConfig)
      ugcRoot.setAttribute("aria-busy", "false")
      removeNode(`${uniqueId}-loading`)
      document.addEventListener("shopify:section:unload", () => {
        window.SEVideoUgc3D?.getInstance?.(ugcRoot)?.destroy?.()
      })
    }

    engineReady
      .then(() => {
        window.SEVideoUgc3D?.injectStyles?.()
        insertAdjacent(markup)
        mountUgcFeed()
      })
      .catch(() => {
        removeNode(`${uniqueId}-loading`)
        renderMessage("Slider unavailable", "Could not load 3D UGC feed.")
      })

    window.addEventListener("pageshow", (event) => {
      if (!ugcRoot || !document.contains(ugcRoot)) return
      const existing = window.SEVideoUgc3D?.getInstance?.(ugcRoot)
      if (existing) {
        ugcRoot.classList.add("is-instant", "is-ready")
        existing._render?.({ animate: false })
        requestAnimationFrame(() => ugcRoot.classList.remove("is-instant"))
        return
      }
      if (event.persisted && window.SEVideoUgc3D) {
        try {
          mountUgcFeed()
        } catch (_) {
          /* ignore */
        }
      }
    })
  }

  function renderLogo3DSlide(slide, index) {
    const brand = String(slide.heading || slide.title || "").trim() || "Brand"
    const description = String(slide.description || "").trim()
    const imageUrl = String(safeUrl(slide.imageUrl) || slide.imageUrl || "").trim()
    const ctaUrl = String(safeUrl(slide.ctaUrl) || slide.ctaUrl || "").trim()
    const ctaTarget = slide.ctaOpenInNewTab ? ' target="_blank" rel="noopener noreferrer"' : ""
    const eager = index === 0
    const alt = escapeHtml(slide.imageAlt || brand)

    const logoHtml = imageUrl
      ? `<img class="logo-3d__logo" src="${escapeHtml(imageUrl)}" width="120" height="40" alt="${alt}" loading="${eager ? "eager" : "lazy"}"${eager ? ' fetchpriority="high"' : ""} decoding="async" />`
      : `<span class="logo-3d__logo" aria-hidden="true">${escapeHtml(brand.slice(0, 1))}</span>`

    const descHtml = description
      ? `<p class="logo-3d__description">${escapeHtml(description)}</p>`
      : ""

    const inner = `
                <div class="logo-3d__logo-wrap">
                  ${logoHtml}
                </div>
                <p class="logo-3d__name">${escapeHtml(brand)}</p>
                ${descHtml}
    `

    const card = ctaUrl
      ? `<a class="logo-3d__card" href="${escapeHtml(ctaUrl)}"${ctaTarget}>${inner}</a>`
      : `<div class="logo-3d__card">${inner}</div>`

    return `
      <li class="logo-3d__slide${index === 0 ? " is-active" : ""}" data-logo-3d-slide data-brand-name="${escapeHtml(brand)}"${index === 0 ? ' aria-current="true"' : ""}>
        ${card}
      </li>
    `
  }

  function renderLogo3D(data) {
    const settings = data.settings || {}
    const slides = (data.slides || []).filter((s) => s && s.isVisible !== false)
    if (!slides.length) {
      removeNode(`${uniqueId}-loading`)
      renderMessage("No logo slides available", "This slider does not have any visible slides yet.")
      return
    }

    const engineSrc = `${apiOrigin}/logo-3d.js?v=1`
    const engineReady = loadScriptOnce(engineSrc)
    trackEvent("view", slides[0]?.id)

    const sectionSubheading = String(settings.sectionSubheading || "").trim()
    const sectionHeading = String(settings.sectionHeading || "").trim()
    const sectionDescription = String(settings.sectionDescription || "").trim()
    const headerParts = []
    if (sectionSubheading) {
      headerParts.push(`<span class="logo-3d__eyebrow">${escapeHtml(sectionSubheading)}</span>`)
    }
    if (sectionHeading) {
      headerParts.push(`<h2 class="logo-3d__heading">${escapeHtml(sectionHeading)}</h2>`)
    }
    if (sectionDescription) {
      headerParts.push(`<p class="logo-3d__subheading">${escapeHtml(sectionDescription)}</p>`)
    }
    const headerHtml = headerParts.length
      ? `<header class="logo-3d__header">${headerParts.join("")}</header>`
      : ""

    const showNav = settings.arrows !== false
    const showDots = settings.dots === true
    const l3Config = {
      perspective: Number(settings.logo3dPerspective) || 1200,
      cylinderRadius: Number(settings.logo3dCylinderRadius) || 320,
      depth: Number(settings.logo3dDepth) || 160,
      rotation: Number(settings.logo3dRotation) || 28,
      scale: Number(settings.logo3dScale) || 0.82,
      scaleStep: Number(settings.logo3dScaleStep) || 0.08,
      sideOpacity: Number(settings.logo3dSideOpacity) || 0.55,
      logoSize: Number(settings.logo3dLogoSize) || 88,
      visibleSlides: Number(settings.logo3dVisibleSlides) || 7,
      tabletVisibleSlides: 5,
      mobileVisibleSlides: 3,
      tiltIntensity: Number(settings.logo3dTiltIntensity) || 0.35,
      autoplay: settings.autoplay !== false,
      autoplayDelay: Number(settings.autoplaySpeed) || 3200,
      animationSpeed: Number(settings.speed) || 700,
      navigation: showNav,
      pagination: showDots,
      loop: settings.infinite !== false,
      clickNeighborToCenter: true,
      respectReducedMotion: true,
    }

    const sectionBgTransparent = settings.sectionBackgroundTransparent === true
    const sectionBgCustom = String(settings.sectionBackground || "").trim()
    const defaultSectionBg =
      "radial-gradient(80% 55% at 50% 0%, #fff 0%, transparent 60%), linear-gradient(180deg, #f5f5f3 0%, #ebebe8 100%)"
    const sectionBgValue = sectionBgTransparent
      ? "transparent"
      : sectionBgCustom
        ? escapeHtml(sectionBgCustom)
        : defaultSectionBg

    const styleVars = [
      `--l3-section-bg:${sectionBgValue}`,
      `--l3-perspective:${l3Config.perspective}px`,
      `--l3-logo-size:${l3Config.logoSize}px`,
    ].join(";")

    const slidesHtml = slides.map((slide, i) => renderLogo3DSlide(slide, i)).join("")

    const markup = `
      <style id="se-logo3d-boot-${uniqueId}">
        .slideease-container-${uniqueId}.se-root--logo-3d {
          width: 100%;
          max-width: none;
          display: block;
        }
        .slideease-container-${uniqueId} .logo-3d {
          width: 100vw;
          max-width: 100vw;
          margin-left: calc(50% - 50vw);
          margin-right: calc(50% - 50vw);
          box-sizing: border-box;
        }
        .slideease-container-${uniqueId} .logo-3d:not(.is-ready) .logo-3d__stage,
        .slideease-container-${uniqueId} .logo-3d:not(.is-ready) .logo-3d__controls,
        .slideease-container-${uniqueId} .logo-3d:not(.is-ready) .logo-3d__header {
          opacity: 0 !important;
          visibility: hidden !important;
          pointer-events: none !important;
        }
        .slideease-container-${uniqueId} .logo-3d:not(.is-ready) .logo-3d__stage {
          min-height: min(42vw, 280px);
        }
        .slideease-container-${uniqueId} .logo-3d:not(.is-ready) .logo-3d__slide {
          position: absolute !important;
          top: 50%;
          left: 50%;
          opacity: 0 !important;
        }
        .slideease-container-${uniqueId} .logo-3d.is-ready .logo-3d__stage,
        .slideease-container-${uniqueId} .logo-3d.is-ready .logo-3d__controls,
        .slideease-container-${uniqueId} .logo-3d.is-ready .logo-3d__header {
          opacity: 1;
          visibility: visible;
          transition: opacity 160ms ease, visibility 160ms ease;
        }
      </style>
      <section class="slideease-container-${uniqueId} se-root se-root--logo-3d" data-effect="logo-3d" aria-roledescription="carousel">
        <div class="logo-3d" data-logo-3d data-logo-3d-config='${escapeHtml(JSON.stringify(l3Config))}' aria-label="${escapeHtml(sectionHeading || data.name || "Brand logos")}" aria-busy="true" style="${styleVars}">
          <div class="logo-3d__inner">
            ${headerHtml}
            <div class="logo-3d__stage" data-logo-3d-stage>
              <div class="logo-3d__tilt" data-logo-3d-tilt>
                <ul class="logo-3d__track" data-logo-3d-track>
                  ${slidesHtml}
                </ul>
              </div>
            </div>
            <div class="logo-3d__controls">
              <div class="logo-3d__nav" data-logo-3d-nav${showNav ? "" : " hidden"}>
                <button type="button" class="logo-3d__arrow" data-logo-3d-prev aria-label="Previous logo">
                  <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path d="M10.2 2.2 4.4 8l5.8 5.8" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
                </button>
                <button type="button" class="logo-3d__arrow" data-logo-3d-next aria-label="Next logo">
                  <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path d="M5.8 2.2 11.6 8l-5.8 5.8" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
                </button>
              </div>
              <ul class="logo-3d__pagination" data-logo-3d-pagination aria-label="Logo pagination"${showDots ? "" : " hidden"}></ul>
            </div>
            <div class="logo-3d__live" data-logo-3d-live aria-live="polite" aria-atomic="true"></div>
          </div>
        </div>
      </section>
    `

    let l3Root = null

    const mountLogo3D = () => {
      const root = document.querySelector(`.slideease-container-${uniqueId}`)
      l3Root = root?.querySelector("[data-logo-3d]")
      if (!l3Root || !window.SELogo3D) {
        throw new Error("Logo 3D unavailable")
      }
      window.SELogo3D.init(l3Root, l3Config)
      l3Root.setAttribute("aria-busy", "false")
      removeNode(`${uniqueId}-loading`)
      document.addEventListener("shopify:section:unload", () => {
        window.SELogo3D?.getInstance?.(l3Root)?.destroy?.()
      })
    }

    engineReady
      .then(() => {
        window.SELogo3D?.injectStyles?.()
        insertAdjacent(markup)
        mountLogo3D()
      })
      .catch(() => {
        removeNode(`${uniqueId}-loading`)
        renderMessage("Slider unavailable", "Could not load 3D brand logos.")
      })

    window.addEventListener("pageshow", (event) => {
      if (!l3Root || !document.contains(l3Root)) return
      const existing = window.SELogo3D?.getInstance?.(l3Root)
      if (existing) {
        l3Root.classList.add("is-instant", "is-ready")
        existing._render?.({ animate: false })
        requestAnimationFrame(() => l3Root.classList.remove("is-instant"))
        return
      }
      if (event.persisted && window.SELogo3D) {
        try {
          mountLogo3D()
        } catch (_) {
          /* ignore */
        }
      }
    })
  }

  function wireProductInteractions(root, settings) {
    if (!root) return
    const soldOutLabel = settings.soldOutText || "Sold out"
    const showSoldOut = settings.showSoldOut !== false
    Promise.resolve(refreshAtcAvailability(root, { soldOutLabel, showSoldOut }))
      .then(() => refreshSalesBadges(root))
      .catch(() => {})
    if (root.dataset.seProductWired === "1") return
    root.dataset.seProductWired = "1"
    root.addEventListener(
      "click",
      async (event) => {
        const btn = event.target?.closest?.(".se-product-card__atc")
        if (!btn || !root.contains(btn)) return
        event.preventDefault()
        event.stopPropagation()
        if (
          btn.disabled ||
          btn.dataset.seBusy === "1" ||
          btn.dataset.soldOut === "1" ||
          btn.classList.contains("se-product-card__atc--soldout")
        ) {
          return
        }
        const isQuickAdd = btn.classList.contains("se-product-card__quick-add")
        const originalHtml = btn.innerHTML
        const originalText = btn.textContent
        const quickAddDefault = buildQuickAddContent(settings)
        btn.dataset.seBusy = "1"
        btn.disabled = true
        if (isQuickAdd) {
          btn.innerHTML = String(settings.quickAddText || "").trim()
            ? "…"
            : QUICK_ADD_CART_ICON
          btn.setAttribute("aria-label", "Adding to cart")
          btn.classList.add("se-product-card__quick-add--busy")
        } else {
          btn.textContent = "Adding…"
        }
        try {
          const variantId = await resolveVariantId({
            variantId: btn.getAttribute("data-variant-id"),
            productHandle: btn.getAttribute("data-product-handle"),
          })
          await addVariantToCart(variantId, 1)
          trackEvent("add_to_cart", btn.getAttribute("data-slide-id"))
          if (isQuickAdd) {
            btn.innerHTML = String(settings.quickAddText || "").trim()
              ? "Added"
              : QUICK_ADD_CHECK_ICON
            btn.setAttribute("aria-label", "Added to cart")
          } else {
            btn.textContent = "Added"
          }
          setTimeout(() => {
            if (isQuickAdd) {
              btn.innerHTML = quickAddDefault
              btn.setAttribute("aria-label", "Quick Add")
              btn.classList.remove("se-product-card__quick-add--busy")
            } else {
              btn.textContent = originalText
            }
            btn.disabled = false
            btn.dataset.seBusy = "0"
          }, 1200)
        } catch (error) {
          const message = String(error?.message || "")
          const card = btn.closest?.(".se-product-card")
          if (/sold out/i.test(message)) {
            card
              ?.querySelectorAll(".se-product-card__quick-add")
              .forEach((quickBtn) => quickBtn.remove())
            const bodyAtc = card?.querySelector(
              ".se-product-card__atc:not(.se-product-card__quick-add)",
            )
            if (bodyAtc) {
              if (showSoldOut) markAtcSoldOut(bodyAtc, soldOutLabel)
              else bodyAtc.remove()
            } else if (!isQuickAdd) {
              if (showSoldOut) markAtcSoldOut(btn, soldOutLabel)
              else btn.remove()
            } else {
              btn.remove()
            }
          } else if (isQuickAdd) {
            btn.innerHTML = originalHtml || quickAddDefault
            btn.setAttribute("aria-label", "Quick Add")
            btn.disabled = false
            btn.dataset.seBusy = "0"
            btn.classList.remove("se-product-card__quick-add--busy")
          } else {
            btn.textContent = "Unavailable"
            setTimeout(() => {
              btn.textContent = originalText
              btn.disabled = false
              btn.dataset.seBusy = "0"
            }, 1800)
          }
          console.warn("SlideEase add to cart failed:", error?.message || error)
        }
      },
      true,
    )
  }


  function renderSlider(data) {
    const settings = data.settings || {}
    const slides = (data.slides || []).filter((s) => s && s.isVisible !== false)
    if (!slides.length) {
      removeNode(`${uniqueId}-loading`)
      renderMessage("No slides available", "This slider does not have any visible slides yet.")
      return
    }

    trackEvent("view", slides[0]?.id)
    const { config: slickConfig, effect } = buildSlickConfig(settings)
    if (effect === "premium-coverflow") {
      renderPremiumCoverflow(data)
      return
    }
    if (effect === "premium-circular") {
      renderPremiumCircular(data)
      return
    }
    if (effect === "premium-stacked") {
      renderPremiumStacked(data)
      return
    }
    if (effect === "testimonials-3d") {
      renderTestimonials3D(data)
      return
    }
    if (effect === "ugc-feed") {
      renderUgcFeed(data)
      return
    }
    if (effect === "logo-3d") {
      renderLogo3D(data)
      return
    }
    if (effect === "collection-carousel") {
      renderCollectionCarousel(data)
      return
    }
    if (effect === "testimonials") {
      const show = Math.min(Math.max(Number(slickConfig.slidesToShow) || 3, 1), 3)
      const visible = Math.min(show, slides.length)
      slickConfig.slidesToShow = visible
      slickConfig.slidesToScroll = visible
      if (slides.length <= show) slickConfig.infinite = false
    }
    const frameHeight =
      effect === "announcement"
        ? Math.min(Math.max(Number(settings.height) || 48, 36), 120)
        : resolveFrameHeight(settings)
    const isProductLayout = ["product-carousel", "product-showcase", "collection-rail"].includes(effect)
    const showArrows =
      settings.arrows !== false &&
      !["marquee", "logo-grid"].includes(effect)
    const showProgress =
      Boolean(settings.autoplay) &&
      Boolean(settings.progressBar) &&
      ["hero-fullwidth", "hero-boxed", "autoplay", "center", "hero-video", "slide", "thumbnails"].includes(effect) &&
      slides.length > 1
    const arrowBg = escapeHtml(settings.arrowBg || "rgba(15,23,42,0.55)")
    const arrowColor = escapeHtml(settings.arrowColor || "#ffffff")
    const dotColor = escapeHtml(settings.dotColor || "#1a2f4a")
    const autoplayMs = Number(settings.autoplaySpeed) || 3200
    const headingFontSize = Math.min(Math.max(Number(settings.headingFontSize ?? 42), 18), 96)
    const subheadingFontSize = Math.min(Math.max(Number(settings.subheadingFontSize ?? 12), 10), 28)
    const descriptionFontSize = Math.min(Math.max(Number(settings.descriptionFontSize ?? 16), 12), 32)
    const mobileHeadingFontSize = Math.min(
      Math.max(Number(settings.mobile?.headingFontSize ?? Math.round(headingFontSize * 0.67)), 14),
      64,
    )
    const mobileSubheadingFontSize = Math.min(
      Math.max(Number(settings.mobile?.subheadingFontSize ?? Math.round(subheadingFontSize * 0.9)), 9),
      22,
    )
    const mobileDescriptionFontSize = Math.min(
      Math.max(Number(settings.mobile?.descriptionFontSize ?? Math.round(descriptionFontSize * 0.88)), 11),
      24,
    )
    const headingColor = escapeHtml(settings.headingColor || "#ffffff")
    const subheadingColor = escapeHtml(settings.subheadingColor || "#ffffff")
    const descriptionColor = escapeHtml(settings.descriptionColor || "#ffffff")
    const copyGap = Math.min(Math.max(Number(settings.copyGap ?? 10), 0), 48)
    const paginationOffset = Math.min(Math.max(Number(settings.paginationOffset ?? 16), 0), 120)
    const progressBarColor = escapeHtml(settings.progressBarColor || "#ffffff")
    const dotsPosition = ["left", "right", "center"].includes(settings.dotsPosition) ? settings.dotsPosition : "center"
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
    const mobileCtaFontSize = Math.min(
      Math.max(Number(settings.mobile?.ctaFontSize ?? Math.round(ctaFontSize * 0.88)), 10),
      22,
    )
    const ctaRadius = Math.min(Math.max(Number(settings.ctaBorderRadius ?? 50), 0), 50)
    const ctaBorderWidth = Math.min(Math.max(Number(settings.ctaBorderWidth ?? 1), 0), 6)
    const atcPad = ctaPad
    const atcFontSize = ctaFontSize
    const atcRadius = ctaRadius
    const atcBorderWidth = ctaBorderWidth
    const atcBg = escapeHtml(settings.atcBackground || "#ffffff")
    const atcColor = escapeHtml(settings.atcTextColor || "#170f49")
    const atcBorder = escapeHtml(settings.atcBorderColor || "#170f49")
    const atcHoverBg = escapeHtml(settings.atcHoverBackground || "#170f49")
    const atcHoverColor = escapeHtml(settings.atcHoverTextColor || "#ffffff")
    const salesBadgePad = Math.min(Math.max(Number(settings.salesBadgePadding ?? 8), 0), 24)
    const salesBadgeBg = escapeHtml(settings.salesBadgeBackground || "#170f49")
    const quickAddBg = escapeHtml(settings.quickAddBackground || "#170f49")
    const quickAddSize = Math.min(Math.max(Number(settings.quickAddTextSize ?? 11), 8), 24)
    const productCardBg = settings.productCardTransparent
      ? "transparent"
      : escapeHtml(settings.productCardBackground || "#ffffff")
    const productCardBorder = settings.productCardBorder === false ? "none" : "1px solid #e7e7e7"
    const productStyleVars = isProductLayout
      ? `--se-section-heading-size:${sectionHeadingSize}px;--se-section-heading-gap:${sectionHeadingGap}px;--se-product-title-size:${productTitleSize}px;--se-product-price-size:${productPriceSize}px;--se-product-content-gap:${productContentGap}px;--se-pagination-gap:${paginationGap}px;--se-product-card-bg:${productCardBg};--se-product-card-border:${productCardBorder};--se-product-cta-bg:${productCtaBg};--se-product-cta-color:${productCtaColor};--se-product-cta-hover-bg:${productCtaHover};--se-product-cta-hover-color:${productCtaHoverColor};--se-product-cta-border:${productCtaBorder};--se-atc-bg:${atcBg};--se-atc-color:${atcColor};--se-atc-border:${atcBorder};--se-atc-hover-bg:${atcHoverBg};--se-atc-hover-color:${atcHoverColor};--se-atc-pad:${atcPad}px;--se-atc-font-size:${atcFontSize}px;--se-atc-radius:${atcRadius}px;--se-atc-border-width:${atcBorderWidth}px;--se-sales-badge-pad:${salesBadgePad}px;--se-sales-badge-bg:${salesBadgeBg};--se-quick-add-bg:${quickAddBg};--se-quick-add-size:${quickAddSize}px;`
      : ""
    const logoWidth = Math.min(Math.max(Number(settings.logoWidth ?? 140), 40), 280)
    const logoHeight = Math.min(Math.max(Number(settings.logoHeight ?? 64), 24), 160)
    const logoGridFullWidth = settings.logoGridFullWidth !== false
    const logoGridWidth = Math.min(Math.max(Number(settings.width) || 1100, 320), 1600)
    const logoGridTransparent = settings.logoGridTransparent === true
    const logoGridCustomBg = String(settings.logoGridBackground || "").trim()
    const logoGridBg = logoGridTransparent
      ? "transparent"
      : logoGridCustomBg
        ? escapeHtml(logoGridCustomBg)
        : ""
    const logoGridBorder = logoGridTransparent ? "none" : "1px solid #ebe4f5"
    const logoGridShadow = logoGridTransparent ? "none" : "inset 0 1px 0 rgba(255,255,255,0.8)"
    const logoGridMax = logoGridFullWidth ? "100%" : `min(100%, ${logoGridWidth}px)`
    const logoStyleVars =
      effect === "logo-grid"
        ? `--se-logo-width:${logoWidth}px;--se-logo-height:${logoHeight}px;--se-logo-grid-max:${logoGridMax};--se-logo-grid-border:${logoGridBorder};--se-logo-grid-shadow:${logoGridShadow};${
            logoGridBg ? `--se-logo-grid-bg:${logoGridBg};` : ""
          }`
        : ""
    const ctaStyleVars = `--se-cta-pad:${ctaPad}px;--se-cta-font-size:${ctaFontSize}px;--se-cta-radius:${ctaRadius}px;--se-cta-border-width:${ctaBorderWidth}px;--se-m-cta-font-size:${mobileCtaFontSize}px;`
    const heroStyleVars = !isProductLayout
      ? `--se-heading-size:${headingFontSize}px;--se-subheading-size:${subheadingFontSize}px;--se-desc-size:${descriptionFontSize}px;--se-m-heading-size:${mobileHeadingFontSize}px;--se-m-subheading-size:${mobileSubheadingFontSize}px;--se-m-desc-size:${mobileDescriptionFontSize}px;--se-heading-color:${headingColor};--se-subheading-color:${subheadingColor};--se-desc-color:${descriptionColor};--se-copy-gap:${copyGap}px;--se-pagination-offset:${paginationOffset}px;--se-progress-color:${progressBarColor};`
      : ""
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
        "testimonials",
      ].includes(effect) || Number(settings.slidesToShow) > 1
    const isUtilityCompact = ["logo-grid", "testimonials"].includes(effect)
    const isStories = effect === "stories"
    const isAnnounce = effect === "announcement"
    const salesBadgeMode = isProductLayout
      ? normalizeSalesBadgeMode(settings.salesBadgeMode)
      : "off"
    const salesBadgeFormat = isProductLayout
      ? normalizeSalesBadgeFormat(settings.salesBadgeFormat)
      : "percent-off"
    const salesBadgeText = isProductLayout
      ? String(
          settings.salesBadgeText == null
            ? salesBadgeFormat === "custom"
              ? "{percent}% OFF"
              : "OFF"
            : settings.salesBadgeText,
        )
      : "OFF"
    const testimonialWidth = Math.min(Math.max(Number(settings.width) || 1100, 320), 1600)
    const widthStyleVar = effect === "testimonials" ? `--se-width:${testimonialWidth}px;` : ""

    const thumbs =
      settings.thumbnails || settings.heroAnimation === "thumbnails"
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

    const storiesRings = isStories
      ? `<div class="se-stories-rings" role="tablist" aria-label="Stories">${slides
          .map((slide, i) => {
            const thumb = escapeHtml(safeUrl(slide.imageUrl) || "")
            const label = escapeHtml(slide.heading || slide.title || `Story ${i + 1}`)
            return `<button type="button" class="se-stories-ring${i === 0 ? " is-active" : ""}" data-story-index="${i}" role="tab" aria-selected="${i === 0 ? "true" : "false"}">
              <span class="se-stories-ring__avatar"><span class="se-stories-ring__img">${thumb ? `<img src="${thumb}" alt="" loading="lazy" />` : ""}</span></span>
              <span class="se-stories-ring__label">${label}</span>
            </button>`
          })
          .join("")}</div>`
      : ""
    const storiesProgress = isStories
      ? `<div class="se-stories-progress" aria-hidden="true"><span class="se-stories-progress__bar" style="width:${
          slides.length ? Math.round(100 / slides.length) : 100
        }%"></span></div>`
      : ""
    const arrowsHtml = showArrows
      ? `
          <button type="button" class="slideease-prev-${uniqueId} se-nav se-nav--prev" aria-label="Previous slide">${CHEVRON_LEFT}</button>
          <button type="button" class="slideease-next-${uniqueId} se-nav se-nav--next" aria-label="Next slide">${CHEVRON_RIGHT}</button>
        `
      : ""
    const sliderHtml = `<div id="${uniqueId}" class="slideease-slider-${uniqueId} se-slider">
          ${slides.map((slide) => renderSlide(slide, settings, effect)).join("")}
        </div>`

    insertAdjacent(`
      <section class="slideease-container-${uniqueId} se-root${isMulti ? " se-root--multi" : isStories ? " se-root--stories" : isAnnounce ? " se-root--announce" : " se-root--hero"}${isUtilityCompact ? " se-root--utility" : ""}${isProductLayout ? " se-root--products" : ""}${effect === "hero-boxed" ? " se-root--boxed" : ""}${effect === "testimonials" ? " se-root--testimonials" : ""}${dotsPosition !== "center" ? ` se-root--dots-${dotsPosition}` : ""}" data-effect="${escapeHtml(effect)}" data-hero-anim="${escapeHtml(settings.heroAnimation && settings.heroAnimation !== "none" ? String(settings.heroAnimation) : "")}" data-sales-badge-mode="${escapeHtml(salesBadgeMode)}" data-sales-badge-format="${escapeHtml(salesBadgeFormat)}" data-sales-badge-text="${escapeHtml(salesBadgeText)}" style="--se-height:${frameHeight}px;--se-dot:${dotColor};--se-arrow-bg:${arrowBg};--se-arrow-color:${arrowColor};--se-autoplay:${autoplayMs}ms;${widthStyleVar}${ctaStyleVars}${heroStyleVars}${productStyleVars}${logoStyleVars}" aria-roledescription="carousel">
        ${
          ["product-carousel", "product-showcase", "collection-rail"].includes(effect) && settings.sectionHeading
            ? `<h2 class="se-section-heading">${escapeHtml(settings.sectionHeading)}</h2>`
            : ""
        }
        ${storiesRings}
        ${
          isStories
            ? `<div class="se-stories-stage">${arrowsHtml}${storiesProgress}${sliderHtml}</div>`
            : `${arrowsHtml}${sliderHtml}`
        }
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
          .slideease-container-${uniqueId}.se-root--stories {
            --se-render-height: var(--se-height);
          }
          .slideease-container-${uniqueId}.se-root--announce {
            --se-render-height: var(--se-height, 48px);
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
          /* Hide until Slick initializes — prevents stacked FOUC on load / back-nav */
          .slideease-container-${uniqueId} .se-slider:not(.slick-initialized) {
            opacity: 0 !important;
            visibility: hidden !important;
            min-height: var(--se-render-height, var(--se-height, 320px));
            pointer-events: none;
          }
          .slideease-container-${uniqueId} .se-slider.slick-initialized {
            opacity: 1;
            visibility: visible;
            transition: opacity 160ms ease, visibility 160ms ease;
          }
          .slideease-container-${uniqueId} .se-nav {
            opacity: 0;
            pointer-events: none;
            transition: opacity 160ms ease;
          }
          .slideease-container-${uniqueId}.se-slick-ready .se-nav {
            opacity: 1;
            pointer-events: auto;
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
          .slideease-container-${uniqueId}[data-effect="autoplay"].se-root--multi .slideease-frame {
            box-shadow: none;
            background: transparent;
          }
          .slideease-container-${uniqueId}.se-root--multi .se-copy {
            padding: clamp(0.9rem, 2vw, 1.5rem);
            padding-bottom: clamp(1.5rem, 3vw, 2.25rem);
          }
          .slideease-container-${uniqueId}.se-root--multi .se-eyebrow {
            font-size: var(--se-subheading-size, clamp(0.62rem, 0.9vw, 0.7rem));
            padding: 0.32rem 0.58rem;
            letter-spacing: 0.12em;
          }
          .slideease-container-${uniqueId}.se-root--multi .se-heading {
            max-width: 100%;
            font-size: var(--se-heading-size, clamp(1.35rem, 2.4vw, 2.1rem));
            letter-spacing: -0.03em;
          }
          .slideease-container-${uniqueId}.se-root--multi .se-desc {
            font-size: var(--se-desc-size, clamp(0.85rem, 1.3vw, 1rem));
            -webkit-line-clamp: 2;
          }
          .slideease-container-${uniqueId}.se-root--multi .se-copy-plate {
            gap: var(--se-copy-gap, 0.4rem);
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
            padding-bottom: calc(2.75rem + var(--se-pagination-offset, 16px));
            max-width: 100%;
            pointer-events: none;
            overflow: hidden;
          }
          .slideease-container-${uniqueId} .se-copy--left,
          .slideease-container-${uniqueId} .se-copy--bottom-left,
          .slideease-container-${uniqueId} .se-copy--right,
          .slideease-container-${uniqueId} .se-copy--bottom-right,
          .slideease-container-${uniqueId} .se-copy--bottom-center {
            justify-content: flex-end;
          }
          .slideease-container-${uniqueId} .se-copy--center,
          .slideease-container-${uniqueId} .se-copy--middle {
            justify-content: center;
            padding-top: clamp(2rem, 5vw, 4rem);
            padding-bottom: calc(2.75rem + var(--se-pagination-offset, 16px));
          }
          .slideease-container-${uniqueId} .se-copy-plate {
            pointer-events: auto;
            display: flex;
            flex-direction: column;
            gap: var(--se-copy-gap, clamp(0.4rem, 1vw, 0.75rem));
            max-width: min(46rem, 100%);
            max-height: 100%;
            min-height: 0;
            padding: 0;
            background: transparent;
            filter: drop-shadow(0 3px 18px rgba(0,0,0,0.32));
            overflow: hidden;
          }
          .slideease-container-${uniqueId} .se-copy--center .se-copy-plate,
          .slideease-container-${uniqueId} .se-copy--middle .se-copy-plate,
          .slideease-container-${uniqueId} .se-copy--bottom-center .se-copy-plate {
            margin: 0 auto;
            text-align: center;
            align-items: center;
          }
          .slideease-container-${uniqueId} .se-copy--left .se-copy-plate,
          .slideease-container-${uniqueId} .se-copy--bottom-left .se-copy-plate {
            margin-right: auto;
            align-items: flex-start;
          }
          .slideease-container-${uniqueId} .se-copy--right .se-copy-plate,
          .slideease-container-${uniqueId} .se-copy--bottom-right .se-copy-plate {
            margin-left: auto;
            align-items: flex-end;
          }

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
            font-size: var(--se-subheading-size, clamp(0.68rem, 1vw, 0.76rem));
            color: var(--se-subheading-color, inherit);
            font-weight: 700;
            letter-spacing: 0.16em;
            text-transform: uppercase;
            line-height: 1.2;
            flex-shrink: 0;
          }
          .slideease-container-${uniqueId} .se-heading {
            margin: 0;
            max-width: 18ch;
            color: var(--se-heading-color, inherit);
            font-size: var(--se-heading-size, clamp(2.6rem, 5.6vw, 5rem));
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
            color: var(--se-desc-color, inherit);
            font-size: var(--se-desc-size, clamp(1.1rem, 1.8vw, 1.35rem));
            line-height: 1.5;
            opacity: 0.92;
            display: -webkit-box;
            overflow: hidden;
            -webkit-line-clamp: 3;
            -webkit-box-orient: vertical;
            flex-shrink: 1;
            min-height: 0;
          }
          .slideease-container-${uniqueId} .se-cta-row {
            display: inline-flex;
            flex-wrap: wrap;
            align-items: center;
            gap: 0.65rem;
            margin-top: 0.35rem;
          }
          .slideease-container-${uniqueId} .se-cta-row .se-cta { margin-top: 0; }
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
          .slideease-container-${uniqueId} .se-cta--secondary {
            background: var(--se-cta2-bg, transparent);
            color: var(--se-cta2-color, var(--se-cta-color));
            border-color: var(--se-cta2-border, var(--se-cta-border));
            box-shadow: none;
          }
          .slideease-container-${uniqueId} .se-cta--secondary svg {
            color: var(--se-cta2-icon-color, var(--se-cta2-color));
            background: var(--se-cta2-icon-bg, rgba(255,255,255,0.12));
          }
          .slideease-container-${uniqueId} .se-cta--secondary:hover {
            background: var(--se-cta2-hover-bg, rgba(255,255,255,0.14));
            color: var(--se-cta2-hover-color, var(--se-cta2-color));
            box-shadow: none;
            filter: none;
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
            bottom: 14px;
            transform: translateX(-50%);
            z-index: 7;
            display: flex !important;
            align-items: center;
            justify-content: center;
            gap: 6px;
            margin: 0 !important;
            padding: 7px 9px;
            list-style: none;
            border-radius: 999px;
            background: rgba(5, 8, 15, 0.28);
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
            border: 1px solid rgba(255,255,255,0.14);
          }
          .slideease-container-${uniqueId}.se-root--dots-left .slideease-dots-${uniqueId} {
            left: clamp(14px, 3vw, 36px) !important;
            right: auto !important;
            transform: none !important;
            justify-content: flex-start !important;
          }
          .slideease-container-${uniqueId}.se-root--dots-right .slideease-dots-${uniqueId} {
            right: clamp(14px, 3vw, 36px) !important;
            left: auto !important;
            transform: none !important;
            justify-content: flex-end !important;
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
            background: var(--se-progress-color, #fff);
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
          .slideease-container-${uniqueId}[data-effect="autoplay"] {
            background: transparent !important;
          }
          .slideease-container-${uniqueId}[data-effect="autoplay"] .se-slider,
          .slideease-container-${uniqueId}[data-effect="autoplay"] .slick-list,
          .slideease-container-${uniqueId}[data-effect="autoplay"] .slick-track,
          .slideease-container-${uniqueId}[data-effect="autoplay"] .slick-slide,
          .slideease-container-${uniqueId}[data-effect="autoplay"] .slick-slide > div {
            background: transparent !important;
          }
          .slideease-container-${uniqueId}[data-effect="autoplay"] .slideease-frame {
            background: transparent;
            box-shadow: none;
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
            .slideease-container-${uniqueId}.se-root--stories {
              --se-render-height: min(280px, var(--se-height));
            }
            .slideease-container-${uniqueId}.se-root--announce {
              --se-render-height: var(--se-height, 48px);
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
            .slideease-container-${uniqueId} .se-eyebrow {
              font-size: var(--se-m-subheading-size, var(--se-subheading-size, clamp(0.62rem, 2.4vw, 0.72rem)));
            }
            .slideease-container-${uniqueId} .se-heading {
              max-width: 100%;
              font-size: var(--se-m-heading-size, var(--se-heading-size, clamp(2.15rem, 9vw, 3.4rem)));
            }
            .slideease-container-${uniqueId} .se-desc {
              display: -webkit-box;
              overflow: hidden;
              -webkit-line-clamp: 2;
              -webkit-box-orient: vertical;
              font-size: var(--se-m-desc-size, var(--se-desc-size, inherit));
            }
            .slideease-container-${uniqueId} .se-cta,
            .slideease-container-${uniqueId} .se-product-card__shop,
            .slideease-container-${uniqueId} .se-product-card__atc {
              font-size: var(--se-m-cta-font-size, var(--se-cta-font-size, 14px));
            }
            .slideease-container-${uniqueId} .se-product-card__atc.se-product-card__quick-add {
              font-size: var(--se-quick-add-size, 11px);
              padding: var(--se-sales-badge-pad, 8px);
              border-radius: 4px;
            }
            .slideease-container-${uniqueId} .se-copy {
              padding: 1.25rem;
              padding-bottom: calc(3rem + var(--se-pagination-offset, 16px));
            }
            .slideease-container-${uniqueId} .se-copy--center,
            .slideease-container-${uniqueId} .se-copy--middle {
              padding-top: 2.25rem;
              padding-bottom: calc(3rem + var(--se-pagination-offset, 16px));
              justify-content: center;
            }
            .slideease-container-${uniqueId} .se-copy-plate { gap: var(--se-copy-gap, 0.45rem); }
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
      const soldOutLabel = settings.soldOutText || "Sold out"
      const showSoldOut = settings.showSoldOut !== false
      Promise.resolve(refreshAtcAvailability(root, { soldOutLabel, showSoldOut }))
        .then(() => refreshSalesBadges(root))
        .catch(() => {})
      root.addEventListener(
        "click",
        async (event) => {
          const btn = event.target?.closest?.(".se-product-card__atc")
          if (!btn || !root.contains(btn)) return
          event.preventDefault()
          event.stopPropagation()
          if (
            btn.disabled ||
            btn.dataset.seBusy === "1" ||
            btn.dataset.soldOut === "1" ||
            btn.classList.contains("se-product-card__atc--soldout")
          ) {
            return
          }
          const isQuickAdd = btn.classList.contains("se-product-card__quick-add")
          const originalHtml = btn.innerHTML
          const originalText = btn.textContent
          const quickAddDefault = buildQuickAddContent(settings)
          btn.dataset.seBusy = "1"
          btn.disabled = true
          if (isQuickAdd) {
            btn.innerHTML = String(settings.quickAddText || "").trim()
              ? "…"
              : QUICK_ADD_CART_ICON
            btn.setAttribute("aria-label", "Adding to cart")
            btn.classList.add("se-product-card__quick-add--busy")
          } else {
            btn.textContent = "Adding…"
          }
          try {
            const variantId = await resolveVariantId({
              variantId: btn.getAttribute("data-variant-id"),
              productHandle: btn.getAttribute("data-product-handle"),
            })
            await addVariantToCart(variantId, 1)
            trackEvent("add_to_cart", btn.getAttribute("data-slide-id"))
            if (isQuickAdd) {
              btn.innerHTML = String(settings.quickAddText || "").trim()
                ? "Added"
                : QUICK_ADD_CHECK_ICON
              btn.setAttribute("aria-label", "Added to cart")
            } else {
              btn.textContent = "Added"
            }
            setTimeout(() => {
              if (isQuickAdd) {
                btn.innerHTML = quickAddDefault
                btn.setAttribute("aria-label", "Quick Add")
                btn.classList.remove("se-product-card__quick-add--busy")
              } else {
                btn.textContent = originalText
              }
              btn.disabled = false
              btn.dataset.seBusy = "0"
            }, 1200)
          } catch (error) {
            const message = String(error?.message || "")
            const card = btn.closest?.(".se-product-card")
            if (/sold out/i.test(message)) {
              card
                ?.querySelectorAll(".se-product-card__quick-add")
                .forEach((quickBtn) => quickBtn.remove())
              const bodyAtc = card?.querySelector(
                ".se-product-card__atc:not(.se-product-card__quick-add)",
              )
              if (bodyAtc) {
                if (showSoldOut) markAtcSoldOut(bodyAtc, soldOutLabel)
                else bodyAtc.remove()
              } else if (!isQuickAdd) {
                if (showSoldOut) markAtcSoldOut(btn, soldOutLabel)
                else btn.remove()
              } else {
                btn.remove()
              }
            } else if (isQuickAdd) {
              btn.innerHTML = originalHtml || quickAddDefault
              btn.setAttribute("aria-label", "Quick Add")
              btn.disabled = false
              btn.dataset.seBusy = "0"
              btn.classList.remove("se-product-card__quick-add--busy")
            } else {
              btn.textContent = "Unavailable"
              setTimeout(() => {
                btn.textContent = originalText
                btn.disabled = false
                btn.dataset.seBusy = "0"
              }, 1800)
            }
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
        $slider.on("init", () => {
          root?.classList.add("se-slick-ready")
        })
        $slider.slick(slickConfig)
        root?.classList.add("se-slick-ready")
        fullBleed.sync()

        if (settings.thumbnails || settings.heroAnimation === "thumbnails") {
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

        const syncStoriesUi = (current) => {
          if (!isStories || !root) return
          const idx = Math.max(0, Number(current) || 0)
          root.querySelectorAll(".se-stories-ring").forEach((ring, i) => {
            const active = i === idx
            ring.classList.toggle("is-active", active)
            ring.setAttribute("aria-selected", active ? "true" : "false")
          })
          const bar = root.querySelector(".se-stories-progress__bar")
          if (bar && slides.length) {
            bar.style.width = `${Math.round(((idx + 1) / slides.length) * 100)}%`
          }
        }

        if (isStories && root) {
          root.querySelectorAll(".se-stories-ring").forEach((ring) => {
            ring.addEventListener("click", () => {
              const idx = Number(ring.getAttribute("data-story-index"))
              if (!Number.isFinite(idx)) return
              $slider.slick("slickGoTo", idx)
            })
          })
          syncStoriesUi(0)
        }

        restartProgress()
        $slider.on("beforeChange", () => {
          if (root) root.classList.remove("se-progress-run")
        })
        $slider.on("afterChange", (_e, _slick, current) => {
          const slide = slides[current]
          if (slide?.id) trackEvent("view", slide.id)
          restartProgress()
          syncStoriesUi(current)
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
      if (data.error) {
        removeNode(`${uniqueId}-loading`)
        renderMessage("Slider unavailable", data.error)
        return
      }
      const plan = data.plan || {}
      const apiSaysBlocked = data.placement && data.placement.allowed === false
      if (apiSaysBlocked || !isPlacementAllowed(plan)) {
        removeNode(`${uniqueId}-loading`)
        renderPlacementLocked(plan)
        return
      }
      // Premium 3D engines clear the loader after styles + transforms are ready
      // so the raw horizontal product list never flashes.
      const effect = resolveEffect(data.settings || {})
      if (
        effect !== "premium-coverflow" &&
        effect !== "premium-circular" &&
        effect !== "premium-stacked" &&
        effect !== "testimonials-3d" &&
        effect !== "ugc-feed" &&
        effect !== "logo-3d" &&
        effect !== "collection-carousel"
      ) {
        removeNode(`${uniqueId}-loading`)
      }
      renderSlider(data)
    })
    .catch(() => {
      removeNode(`${uniqueId}-loading`)
      renderMessage("Slider unavailable", "Unable to load this slider.")
    })
})()
