"use client"

import { useCallback, useEffect, useState } from "react"
import { FormLayout, TextField, Stack, Text, Button, Banner } from "@shopify/polaris"
import { useAppBridge } from "@shopify/app-bridge-react"
import {
  HERO_ANIMATION_OPTIONS,
  HERO_CONTENT_POSITION_OPTIONS,
} from "../utils/sliderConfig"
import { getSettingsCapabilities } from "../utils/settingsVisibility"
import SeSelect from "./se-select"

function clampNum(value, min, max, fallback) {
  if (value === "" || value === null || value === undefined) return fallback
  const next = Number(value)
  if (!Number.isFinite(next)) return fallback
  return Math.min(max, Math.max(min, next))
}

/** Number input that clamps on blur so typing (e.g. 500) is not snapped mid-keystroke. */
function ClampedNumberField({
  label,
  value,
  min,
  max,
  fallback,
  onChange,
  disabled,
  helpText,
  labelHidden,
}) {
  const [draft, setDraft] = useState(null)
  const committed = value ?? fallback
  const shown = draft !== null ? draft : String(committed ?? "")

  const commit = (raw) => {
    const next = clampNum(raw, min, max, fallback)
    onChange(next)
    setDraft(null)
  }

  return (
    <TextField
      label={label}
      labelHidden={labelHidden}
      type="number"
      helpText={helpText}
      value={shown}
      disabled={disabled}
      autoComplete="off"
      min={min}
      max={max}
      onFocus={() => setDraft(String(committed ?? ""))}
      onChange={(next) => {
        setDraft(next)
        if (next === "" || next === "-" || next === ".") return
        const parsed = Number(next)
        // Live-update only when in range so partial typing (e.g. "5" of "500") is not clamped away
        if (Number.isFinite(parsed) && parsed >= min && parsed <= max) onChange(parsed)
      }}
      onBlur={() => commit(draft !== null ? draft : committed)}
    />
  )
}

function pickerValue(value, fallback) {
  const color = String(value || "").trim()
  if (/^#[0-9a-f]{6}$/i.test(color)) return color
  if (/^#[0-9a-f]{3}$/i.test(color)) {
    return `#${color
      .slice(1)
      .split("")
      .map((part) => part + part)
      .join("")}`
  }
  return fallback
}

function ColorField({ label, value, fallback, onChange, disabled }) {
  return (
    <div>
      <Text variant="bodyMd" as="p">
        {label}
      </Text>
      <div style={{ display: "flex", alignItems: "center", gap: "0.65rem", marginTop: "0.35rem" }}>
        <input
          type="color"
          value={pickerValue(value, fallback)}
          onChange={(event) => onChange(event.target.value)}
          disabled={disabled}
          aria-label={`${label} picker`}
          style={{
            width: 44,
            height: 36,
            padding: 3,
            border: "1px solid #c9cccf",
            borderRadius: 8,
            background: "#ffffff",
            cursor: disabled ? "not-allowed" : "pointer",
          }}
        />
        <div style={{ flex: 1 }}>
          <TextField label={label} labelHidden value={value || fallback} onChange={onChange} disabled={disabled} autoComplete="off" />
        </div>
      </div>
    </div>
  )
}

export default function StyleSettingsForm({
  sliderId,
  sliderType,
  settings,
  onSettingsChange,
  onCollectionSynced,
  onHeroAnimationChange,
  disabled = false,
}) {
  const [collections, setCollections] = useState([])
  const [collectionsError, setCollectionsError] = useState(null)
  const [loadingCollections, setLoadingCollections] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [syncMessage, setSyncMessage] = useState(null)
  const shopify = useAppBridge()

  const show = getSettingsCapabilities(sliderType)
  const isTestimonials = sliderType === "testimonials"
  const isProductType = show.productSource
  const heightMin = sliderType === "announcement" ? 36 : sliderType === "logo-grid" ? 80 : 160

  const update = (key, value) => {
    onSettingsChange({
      ...settings,
      [key]: value,
    })
  }

  const updateMobile = (key, value) => {
    onSettingsChange({
      ...settings,
      mobile: {
        ...(settings.mobile || {}),
        [key]: value,
      },
    })
  }

  const loadCollections = useCallback(async () => {
    if (!isProductType) return
    setLoadingCollections(true)
    setCollectionsError(null)
    try {
      const response = await fetch("/api/collections")
      const data = await response.json().catch(() => ([]))
      if (!response.ok) {
        throw new Error(data.error || "Failed to load collections")
      }
      setCollections(Array.isArray(data) ? data : [])
    } catch (error) {
      setCollections([])
      setCollectionsError(error.message)
    } finally {
      setLoadingCollections(false)
    }
  }, [isProductType])

  useEffect(() => {
    loadCollections()
  }, [loadCollections])

  const syncCollection = async () => {
    if (!sliderId || !settings.collectionId) {
      setSyncMessage({ error: true, text: "Select a collection first" })
      return
    }
    setSyncing(true)
    setSyncMessage(null)
    try {
      const response = await fetch(`/api/sliders/${sliderId}/sync-collection`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          collectionId: settings.collectionId,
          productLimit: settings.productLimit ?? 8,
          showPrice: settings.showPrice !== false,
          sectionHeading: settings.sectionHeading || "",
          settings,
        }),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.error || "Sync failed")
      onCollectionSynced?.(data)
      setSyncMessage({
        error: false,
        text: `Loaded ${data.syncMeta?.productCount ?? 0} products from ${data.syncMeta?.collectionTitle || "collection"}`,
      })
    } catch (error) {
      setSyncMessage({ error: true, text: error.message })
    } finally {
      setSyncing(false)
    }
  }

  const pickProducts = async () => {
    if (!sliderId) return
    try {
      if (!shopify?.resourcePicker) {
        setSyncMessage({ error: true, text: "Product picker is unavailable in this session." })
        return
      }
      const result = await shopify.resourcePicker({
        type: "product",
        multiple: true,
        action: "select",
        filter: { variants: false },
      })
      const resources = Array.isArray(result) ? result : result?.selection
      if (!resources?.length) return

      const productIds = resources.map((item) => item.id).filter(Boolean)
      setSyncing(true)
      setSyncMessage(null)
      const response = await fetch(`/api/sliders/${sliderId}/sync-products`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productIds,
          showPrice: settings.showPrice !== false,
          sectionHeading: settings.sectionHeading || "",
          settings,
        }),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.error || "Failed to load products")
      onCollectionSynced?.(data)
      setSyncMessage({
        error: false,
        text: `Loaded ${data.syncMeta?.productCount ?? productIds.length} selected products`,
      })
    } catch (error) {
      if (error?.message && /cancel|closed|abort/i.test(error.message)) return
      setSyncMessage({ error: true, text: error.message || "Could not pick products" })
    } finally {
      setSyncing(false)
    }
  }

  const showBehaviourToggles = show.autoplay || show.arrows || show.dots || show.infinite
  const showNavColors = show.arrowColor || show.dotColor
  const showLayoutRow = show.height || show.borderRadius
  const showSlidesRow = show.slidesToShow || show.autoplaySpeed
  const showMobileSection = show.mobileSlides || show.mobileHeroText || show.mobileCtaFont

  return (
    <FormLayout>
      {showBehaviourToggles ? (
        <Stack spacing="tight">
          {show.autoplay ? (
            <Button pressed={Boolean(settings.autoplay)} onClick={() => update("autoplay", !settings.autoplay)} disabled={disabled}>
              Autoplay {settings.autoplay ? "On" : "Off"}
            </Button>
          ) : null}
          {show.arrows ? (
            <Button pressed={settings.arrows !== false} onClick={() => update("arrows", settings.arrows === false)} disabled={disabled}>
              Arrows {settings.arrows === false ? "Off" : "On"}
            </Button>
          ) : null}
          {show.dots ? (
            <Button pressed={settings.dots !== false} onClick={() => update("dots", settings.dots === false)} disabled={disabled}>
              Pagination {settings.dots === false ? "Off" : "On"}
            </Button>
          ) : null}
          {show.infinite ? (
            <Button pressed={settings.infinite !== false} onClick={() => update("infinite", settings.infinite === false)} disabled={disabled}>
              Infinite {settings.infinite === false ? "Off" : "On"}
            </Button>
          ) : null}
        </Stack>
      ) : null}

      {show.heroAnimation ? (
        <SeSelect
          label="Animation style"
          options={HERO_ANIMATION_OPTIONS.map((option) => ({
            label: option.label,
            value: option.value,
          }))}
          value={settings.heroAnimation || "none"}
          onChange={(value) => {
            onSettingsChange({
              ...settings,
              heroAnimation: value,
              thumbnails: false,
            })
            onHeroAnimationChange?.(value)
          }}
          disabled={disabled}
        />
      ) : null}

      {show.heroText ? <Text variant="headingSm">Hero text</Text> : null}

      {show.heroText ? (
        <SeSelect
          label="Content placement"
          options={HERO_CONTENT_POSITION_OPTIONS.map((option) => ({
            label: option.label,
            value: option.value,
          }))}
          value={settings.contentPosition || "bottom-center"}
          onChange={(value) => update("contentPosition", value)}
          helpText="One control for heading, subheading, description, and button on every slide (unless a slide overrides it)"
          disabled={disabled}
        />
      ) : null}

      {show.heroText ? (
        <FormLayout.Group>
          <ClampedNumberField
            label="Heading size (px)"
            value={settings.headingFontSize ?? 42}
            min={18}
            max={96}
            fallback={42}
            onChange={(value) => update("headingFontSize", value)}
            disabled={disabled}
          />
          <ClampedNumberField
            label="Subheading size (px)"
            value={settings.subheadingFontSize ?? 12}
            min={10}
            max={28}
            fallback={12}
            onChange={(value) => update("subheadingFontSize", value)}
            disabled={disabled}
          />
        </FormLayout.Group>
      ) : null}

      {show.heroText ? (
        <FormLayout.Group>
          <ClampedNumberField
            label="Description size (px)"
            value={settings.descriptionFontSize ?? 16}
            min={12}
            max={32}
            fallback={16}
            onChange={(value) => update("descriptionFontSize", value)}
            disabled={disabled}
          />
          <ColorField
            label="Description color"
            value={settings.descriptionColor || "#ffffff"}
            onChange={(value) => update("descriptionColor", value)}
            fallback="#ffffff"
            disabled={disabled}
          />
        </FormLayout.Group>
      ) : null}

      {show.heroText ? (
        <FormLayout.Group>
          <ClampedNumberField
            label="Copy gap (px)"
            value={settings.copyGap ?? 10}
            min={0}
            max={48}
            fallback={10}
            onChange={(value) => update("copyGap", value)}
            helpText="Space between subheading, heading, and description"
            disabled={disabled}
          />
          {show.heroPaginationChrome ? (
            <ClampedNumberField
              label="Distance from button (px)"
              value={settings.paginationOffset ?? 16}
              min={0}
              max={120}
              fallback={16}
              onChange={(value) => update("paginationOffset", value)}
              helpText="Space between the CTA button and the dots"
              disabled={disabled || settings.dots === false}
            />
          ) : (
            <div />
          )}
        </FormLayout.Group>
      ) : null}

      {show.heroText ? (
        <FormLayout.Group>
          <ColorField
            label="Heading color"
            value={settings.headingColor || "#ffffff"}
            onChange={(value) => update("headingColor", value)}
            fallback="#ffffff"
            disabled={disabled}
          />
          <ColorField
            label="Subheading color"
            value={settings.subheadingColor || "#ffffff"}
            onChange={(value) => update("subheadingColor", value)}
            fallback="#ffffff"
            disabled={disabled}
          />
        </FormLayout.Group>
      ) : null}

      {show.heroPaginationChrome ? <Text variant="headingSm">Hero arrows & pagination</Text> : null}

      {show.heroPaginationChrome ? (
        <FormLayout.Group>
          <SeSelect
            label="Pagination position"
            options={[
              { label: "Bottom center", value: "center" },
              { label: "Bottom left", value: "left" },
              { label: "Bottom right", value: "right" },
            ]}
            value={settings.dotsPosition || "center"}
            onChange={(value) => update("dotsPosition", value)}
            disabled={disabled || settings.dots === false}
          />
          <ColorField
            label="Arrow background"
            value={settings.arrowBg || "#000000"}
            onChange={(value) => update("arrowBg", value)}
            fallback="#000000"
            disabled={disabled}
          />
        </FormLayout.Group>
      ) : null}

      {show.productSource ? (
        <TextField
          label="Section heading (optional)"
          value={settings.sectionHeading || ""}
          onChange={(value) => update("sectionHeading", value)}
          placeholder="Featured products"
          disabled={disabled}
          autoComplete="off"
        />
      ) : null}

      {show.productSource && collectionsError ? (
        <Banner status="warning" title="Collections unavailable">
          <p>{collectionsError}</p>
        </Banner>
      ) : null}

      {show.productSource ? (
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <Button primary onClick={pickProducts} loading={syncing} disabled={disabled}>
            Select products
          </Button>
          <Button
            pressed={settings.showPrice !== false}
            onClick={() => update("showPrice", settings.showPrice === false)}
            disabled={disabled}
          >
            Show price {settings.showPrice === false ? "Off" : "On"}
          </Button>
          <Button
            pressed={settings.showShopNow !== false}
            onClick={() => update("showShopNow", settings.showShopNow === false)}
            disabled={disabled}
          >
            Shop now {settings.showShopNow === false ? "Off" : "On"}
          </Button>
          <Button
            pressed={settings.showAddToCart !== false}
            onClick={() => update("showAddToCart", settings.showAddToCart === false)}
            disabled={disabled}
          >
            Add to cart {settings.showAddToCart === false ? "Off" : "On"}
          </Button>
          <Button
            pressed={settings.showSoldOut !== false}
            onClick={() => update("showSoldOut", settings.showSoldOut === false)}
            disabled={disabled}
          >
            Sold out {settings.showSoldOut === false ? "Off" : "On"}
          </Button>
        </div>
      ) : null}

      {show.productSource && settings.showAddToCart !== false ? (
        <FormLayout.Group>
          <TextField
            label="Add to cart label"
            value={settings.addToCartText || "Add to cart"}
            onChange={(value) => update("addToCartText", value)}
            disabled={disabled}
            autoComplete="off"
          />
          {settings.showSoldOut !== false ? (
            <TextField
              label="Sold out label"
              value={settings.soldOutText || "Sold out"}
              onChange={(value) => update("soldOutText", value)}
              disabled={disabled}
              autoComplete="off"
            />
          ) : null}
        </FormLayout.Group>
      ) : null}

      {show.productSource ? (
        <SeSelect
          label="Or sync from collection"
          options={[
            { label: loadingCollections ? "Loading…" : "Select a collection", value: "" },
            ...collections.map((collection) => ({
              label: `${collection.title} (${collection.productsCount})`,
              value: collection.id,
            })),
          ]}
          value={settings.collectionId || ""}
          onChange={(value) => {
            const selected = collections.find((item) => item.id === value)
            onSettingsChange({
              ...settings,
              collectionId: value || null,
              collectionHandle: selected?.handle || null,
            })
          }}
          disabled={disabled || loadingCollections || Boolean(collectionsError)}
        />
      ) : null}

      {show.productSource ? (
        <FormLayout.Group>
          <ClampedNumberField
            label="Collection product limit"
            value={settings.productLimit ?? 8}
            min={1}
            max={50}
            fallback={8}
            onChange={(value) => update("productLimit", value)}
            disabled={disabled}
          />
          <div style={{ display: "flex", alignItems: "flex-end", height: "100%", paddingBottom: 2 }}>
            <Button onClick={syncCollection} loading={syncing} disabled={disabled || !settings.collectionId}>
              Sync collection
            </Button>
          </div>
        </FormLayout.Group>
      ) : null}

      {show.productSource && syncMessage ? (
        <Banner status={syncMessage.error ? "critical" : "success"}>
          <p>{syncMessage.text}</p>
        </Banner>
      ) : null}

      {show.productTypography ? <Text variant="headingSm">Product typography</Text> : null}

      {show.productTypography ? (
        <FormLayout.Group>
          <ClampedNumberField
            label="Section heading size (px)"
            value={settings.sectionHeadingFontSize ?? 28}
            min={16}
            max={48}
            fallback={28}
            onChange={(value) => update("sectionHeadingFontSize", value)}
            disabled={disabled}
          />
          <ClampedNumberField
            label="Space under heading (px)"
            value={settings.sectionHeadingGap ?? 16}
            min={0}
            max={64}
            fallback={16}
            onChange={(value) => update("sectionHeadingGap", value)}
            disabled={disabled}
          />
        </FormLayout.Group>
      ) : null}

      {show.productTypography ? (
        <FormLayout.Group>
          <ClampedNumberField
            label="Product title size (px)"
            value={settings.productTitleFontSize ?? 16}
            min={12}
            max={28}
            fallback={16}
            onChange={(value) => update("productTitleFontSize", value)}
            disabled={disabled}
          />
          <ClampedNumberField
            label="Price size (px)"
            value={settings.productPriceFontSize ?? 14}
            min={10}
            max={24}
            fallback={14}
            onChange={(value) => update("productPriceFontSize", value)}
            disabled={disabled}
          />
        </FormLayout.Group>
      ) : null}

      {show.productTypography ? (
        <FormLayout.Group>
          <ClampedNumberField
            label="Content gap (px)"
            value={settings.productContentGap ?? 8}
            min={0}
            max={32}
            fallback={8}
            onChange={(value) => update("productContentGap", value)}
            disabled={disabled}
          />
          <ClampedNumberField
            label="Pagination gap (px)"
            value={settings.paginationGap ?? 16}
            min={0}
            max={48}
            fallback={16}
            onChange={(value) => update("paginationGap", value)}
            disabled={disabled}
          />
        </FormLayout.Group>
      ) : null}

      {showLayoutRow ? (
        <FormLayout.Group>
          {show.height ? (
            <ClampedNumberField
              label="Height (px)"
              helpText={isTestimonials ? "Applied as the height of each testimonial card" : undefined}
              value={settings.height ?? (isTestimonials ? 280 : 640)}
              min={heightMin}
              max={isTestimonials ? 520 : 900}
              fallback={isTestimonials ? 280 : 640}
              onChange={(value) => update("height", value)}
              disabled={disabled}
            />
          ) : (
            <div />
          )}
          {show.borderRadius ? (
            <ClampedNumberField
              label="Corner radius (px)"
              value={settings.borderRadius ?? 0}
              min={0}
              max={40}
              fallback={0}
              onChange={(value) => update("borderRadius", value)}
              disabled={disabled}
            />
          ) : (
            <div />
          )}
        </FormLayout.Group>
      ) : null}

      {show.width ? (
        <FormLayout.Group>
          <ClampedNumberField
            label="Slider width (px)"
            helpText="Max width of the testimonials section on desktop"
            value={settings.width ?? 1100}
            min={320}
            max={1600}
            fallback={1100}
            onChange={(value) => update("width", value)}
            disabled={disabled}
          />
          <div />
        </FormLayout.Group>
      ) : null}

      {show.objectFit ? (
        <FormLayout.Group>
          <SeSelect
            label="Image fit"
            options={[
              { label: "Cover", value: "cover" },
              { label: "Contain", value: "contain" },
            ]}
            value={settings.objectFit || "cover"}
            onChange={(value) => update("objectFit", value)}
            disabled={disabled}
          />
          <div />
        </FormLayout.Group>
      ) : null}

      {showSlidesRow ? (
        <FormLayout.Group>
          {show.slidesToShow ? (
            <ClampedNumberField
              label={isTestimonials ? "Cards to show" : "Slides to show"}
              helpText={isTestimonials ? "Show up to 3 cards; navigation advances by the same group size" : undefined}
              value={settings.slidesToShow ?? (isTestimonials ? 3 : 1)}
              min={1}
              max={isTestimonials ? 3 : 12}
              fallback={isTestimonials ? 3 : 1}
              onChange={(value) => {
                if (isTestimonials) {
                  onSettingsChange({
                    ...settings,
                    slidesToShow: value,
                    slidesToScroll: value,
                  })
                } else {
                  update("slidesToShow", value)
                }
              }}
              disabled={disabled}
            />
          ) : (
            <div />
          )}
          {show.autoplaySpeed ? (
            <ClampedNumberField
              label="Autoplay speed (ms)"
              value={settings.autoplaySpeed ?? 3000}
              min={0}
              max={60000}
              fallback={3000}
              onChange={(value) => update("autoplaySpeed", value)}
              disabled={disabled}
            />
          ) : (
            <div />
          )}
        </FormLayout.Group>
      ) : null}

      {showNavColors ? (
        <FormLayout.Group>
          {show.arrowColor ? (
            <TextField
              label="Arrow color"
              value={settings.arrowColor || "#ffffff"}
              onChange={(value) => update("arrowColor", value)}
              disabled={disabled}
            />
          ) : (
            <div />
          )}
          {show.dotColor ? (
            <TextField
              label="Dot color"
              value={settings.dotColor || "#2c4a6e"}
              onChange={(value) => update("dotColor", value)}
              disabled={disabled}
            />
          ) : (
            <div />
          )}
        </FormLayout.Group>
      ) : null}

      {show.ctaBackgroundOnly && !show.ctaPrimary && !show.shopNowButton ? (
        <>
          <Text variant="headingSm">Bar style</Text>
          <FormLayout.Group>
            <ColorField
              label="Background"
              value={settings.ctaBackground || "#1a2f4a"}
              onChange={(value) => update("ctaBackground", value)}
              fallback="#1a2f4a"
              disabled={disabled}
            />
            <div />
          </FormLayout.Group>
        </>
      ) : null}

      {show.ctaPrimary || show.shopNowButton ? (
        <Text variant="headingSm">{show.shopNowButton ? "Shop now button" : "First button"}</Text>
      ) : null}

      {show.ctaPrimary || show.shopNowButton ? (
        <FormLayout.Group>
          <ColorField
            label="Button background"
            value={settings.ctaBackground || "#1a2f4a"}
            onChange={(value) => update("ctaBackground", value)}
            fallback="#1a2f4a"
            disabled={disabled}
          />
          <ColorField
            label="Text color"
            value={settings.ctaTextColor || "#ffffff"}
            onChange={(value) => update("ctaTextColor", value)}
            fallback="#ffffff"
            disabled={disabled}
          />
        </FormLayout.Group>
      ) : null}

      {show.ctaPrimary || show.shopNowButton ? (
        <FormLayout.Group>
          <ColorField
            label="Border color"
            value={settings.ctaBorderColor || "#ffffff"}
            onChange={(value) => update("ctaBorderColor", value)}
            fallback="#ffffff"
            disabled={disabled}
          />
          <ColorField
            label="Hover background"
            value={settings.ctaHoverBackground || "#243d5c"}
            onChange={(value) => update("ctaHoverBackground", value)}
            fallback="#243d5c"
            disabled={disabled}
          />
        </FormLayout.Group>
      ) : null}

      {show.ctaPrimary || show.shopNowButton ? (
        <FormLayout.Group>
          <ColorField
            label="Hover text color"
            value={settings.ctaHoverTextColor || "#ffffff"}
            onChange={(value) => update("ctaHoverTextColor", value)}
            fallback="#ffffff"
            disabled={disabled}
          />
          {show.ctaIcons ? (
            <SeSelect
              label="Button icon"
              options={[
                { label: "Arrow", value: "arrow" },
                { label: "Chevron", value: "chevron" },
                { label: "No icon", value: "none" },
              ]}
              value={settings.ctaIcon || "arrow"}
              onChange={(value) => update("ctaIcon", value)}
              disabled={disabled}
            />
          ) : (
            <div />
          )}
        </FormLayout.Group>
      ) : null}

      {show.ctaIcons ? (
        <FormLayout.Group>
          <ColorField
            label="Icon color"
            value={settings.ctaIconColor || "#ffffff"}
            onChange={(value) => update("ctaIconColor", value)}
            fallback="#ffffff"
            disabled={disabled}
          />
          <ColorField
            label="Icon background"
            value={settings.ctaIconBg || "rgba(255,255,255,0.12)"}
            onChange={(value) => update("ctaIconBg", value)}
            fallback="#ffffff"
            disabled={disabled}
          />
        </FormLayout.Group>
      ) : null}

      {show.ctaIcons ? (
        <FormLayout.Group>
          <ClampedNumberField
            label="Icon size (px)"
            value={settings.ctaIconSize ?? 34}
            min={20}
            max={56}
            fallback={34}
            onChange={(value) => update("ctaIconSize", value)}
            disabled={disabled}
            helpText="Applies to both buttons"
          />
          <div />
        </FormLayout.Group>
      ) : null}

      {show.ctaSecondary ? <Text variant="headingSm">Second button</Text> : null}

      {show.ctaSecondary ? (
        <FormLayout.Group>
          <ColorField
            label="Button background"
            value={settings.cta2Background ?? "transparent"}
            onChange={(value) => update("cta2Background", value)}
            fallback="#ffffff"
            disabled={disabled}
          />
          <ColorField
            label="Text color"
            value={settings.cta2TextColor || "#ffffff"}
            onChange={(value) => update("cta2TextColor", value)}
            fallback="#ffffff"
            disabled={disabled}
          />
        </FormLayout.Group>
      ) : null}

      {show.ctaSecondary ? (
        <FormLayout.Group>
          <ColorField
            label="Border color"
            value={settings.cta2BorderColor || "#ffffff"}
            onChange={(value) => update("cta2BorderColor", value)}
            fallback="#ffffff"
            disabled={disabled}
          />
          <ColorField
            label="Hover background"
            value={settings.cta2HoverBackground || "rgba(255,255,255,0.14)"}
            onChange={(value) => update("cta2HoverBackground", value)}
            fallback="#ffffff"
            disabled={disabled}
          />
        </FormLayout.Group>
      ) : null}

      {show.ctaSecondary ? (
        <FormLayout.Group>
          <ColorField
            label="Hover text color"
            value={settings.cta2HoverTextColor || "#ffffff"}
            onChange={(value) => update("cta2HoverTextColor", value)}
            fallback="#ffffff"
            disabled={disabled}
          />
          <SeSelect
            label="Button icon"
            options={[
              { label: "Arrow", value: "arrow" },
              { label: "Chevron", value: "chevron" },
              { label: "No icon", value: "none" },
            ]}
            value={settings.cta2Icon || "none"}
            onChange={(value) => update("cta2Icon", value)}
            disabled={disabled}
          />
        </FormLayout.Group>
      ) : null}

      {show.ctaSecondary ? (
        <FormLayout.Group>
          <ColorField
            label="Icon color"
            value={settings.cta2IconColor || "#ffffff"}
            onChange={(value) => update("cta2IconColor", value)}
            fallback="#ffffff"
            disabled={disabled}
          />
          <ColorField
            label="Icon background"
            value={settings.cta2IconBg || "rgba(255,255,255,0.12)"}
            onChange={(value) => update("cta2IconBg", value)}
            fallback="#ffffff"
            disabled={disabled}
          />
        </FormLayout.Group>
      ) : null}

      {show.ctaSizing ? (
        <FormLayout.Group>
          <ClampedNumberField
            label="Buttons border (px)"
            value={settings.ctaBorderWidth ?? 1}
            min={0}
            max={6}
            fallback={1}
            onChange={(next) => {
              if (show.atcButton) {
                onSettingsChange({
                  ...settings,
                  ctaBorderWidth: next,
                  atcBorderWidth: next,
                })
              } else {
                update("ctaBorderWidth", next)
              }
            }}
            disabled={disabled}
            helpText={show.atcButton ? undefined : "Same size for both buttons"}
          />
          <ClampedNumberField
            label="Buttons corners (px)"
            value={settings.ctaBorderRadius ?? settings.atcBorderRadius ?? 50}
            min={0}
            max={50}
            fallback={50}
            onChange={(next) => {
              if (show.atcButton) {
                onSettingsChange({
                  ...settings,
                  ctaBorderRadius: next,
                  atcBorderRadius: next,
                })
              } else {
                update("ctaBorderRadius", next)
              }
            }}
            disabled={disabled}
          />
        </FormLayout.Group>
      ) : null}

      {show.ctaSizing && show.atcButton ? (
        <FormLayout.Group>
          <ClampedNumberField
            label="Buttons font size (px)"
            value={settings.ctaFontSize ?? settings.atcFontSize ?? 16}
            min={10}
            max={24}
            fallback={16}
            onChange={(next) => {
              onSettingsChange({
                ...settings,
                ctaFontSize: next,
                atcFontSize: next,
              })
            }}
            disabled={disabled}
          />
          <ClampedNumberField
            label="Buttons padding (px)"
            value={settings.ctaPadding ?? settings.atcPadding ?? 12}
            min={4}
            max={36}
            fallback={12}
            onChange={(next) => {
              onSettingsChange({
                ...settings,
                ctaPadding: next,
                atcPadding: next,
              })
            }}
            disabled={disabled}
          />
        </FormLayout.Group>
      ) : null}

      {show.ctaSizing && !show.atcButton ? (
        <FormLayout.Group>
          <ClampedNumberField
            label="Buttons font size (px)"
            value={settings.ctaFontSize ?? 16}
            min={10}
            max={24}
            fallback={16}
            onChange={(value) => update("ctaFontSize", value)}
            disabled={disabled}
          />
          <ClampedNumberField
            label="Buttons padding (px)"
            value={settings.ctaPadding ?? 12}
            min={4}
            max={36}
            fallback={12}
            onChange={(value) => update("ctaPadding", value)}
            disabled={disabled}
          />
        </FormLayout.Group>
      ) : null}

      {show.atcButton ? <Text variant="headingSm">Add to cart button</Text> : null}

      {show.atcButton ? (
        <FormLayout.Group>
          <ColorField
            label="Button background"
            value={settings.atcBackground || "#ffffff"}
            onChange={(value) => update("atcBackground", value)}
            fallback="#ffffff"
            disabled={disabled}
          />
          <ColorField
            label="Text color"
            value={settings.atcTextColor || "#170f49"}
            onChange={(value) => update("atcTextColor", value)}
            fallback="#170f49"
            disabled={disabled}
          />
        </FormLayout.Group>
      ) : null}

      {show.atcButton ? (
        <FormLayout.Group>
          <ColorField
            label="Border color"
            value={settings.atcBorderColor || "#170f49"}
            onChange={(value) => update("atcBorderColor", value)}
            fallback="#170f49"
            disabled={disabled}
          />
          <ColorField
            label="Hover background"
            value={settings.atcHoverBackground || "#170f49"}
            onChange={(value) => update("atcHoverBackground", value)}
            fallback="#170f49"
            disabled={disabled}
          />
        </FormLayout.Group>
      ) : null}

      {show.atcButton ? (
        <FormLayout.Group>
          <ColorField
            label="Hover text color"
            value={settings.atcHoverTextColor || "#ffffff"}
            onChange={(value) => update("atcHoverTextColor", value)}
            fallback="#ffffff"
            disabled={disabled}
          />
          <div />
        </FormLayout.Group>
      ) : null}

      {showMobileSection ? <Text variant="headingSm">Mobile overrides</Text> : null}

      {show.mobileSlides ? (
        <FormLayout.Group>
          <ClampedNumberField
            label="Mobile slides to show"
            value={settings.mobile?.slidesToShow ?? 1}
            min={1}
            max={isTestimonials ? 3 : 12}
            fallback={1}
            onChange={(value) => updateMobile("slidesToShow", value)}
            disabled={disabled}
          />
          <ClampedNumberField
            label="Mobile slides to scroll"
            value={settings.mobile?.slidesToScroll ?? 1}
            min={1}
            max={12}
            fallback={1}
            onChange={(value) => updateMobile("slidesToScroll", value)}
            disabled={disabled}
          />
        </FormLayout.Group>
      ) : null}

      {show.mobileHeroText ? (
        <FormLayout.Group>
          <ClampedNumberField
            label="Mobile heading size (px)"
            value={settings.mobile?.headingFontSize ?? 28}
            min={14}
            max={64}
            fallback={28}
            onChange={(value) => updateMobile("headingFontSize", value)}
            disabled={disabled}
          />
          <ClampedNumberField
            label="Mobile subheading size (px)"
            value={settings.mobile?.subheadingFontSize ?? 11}
            min={9}
            max={22}
            fallback={11}
            onChange={(value) => updateMobile("subheadingFontSize", value)}
            disabled={disabled}
          />
        </FormLayout.Group>
      ) : null}

      {show.mobileHeroText && show.mobileCtaFont ? (
        <FormLayout.Group>
          <ClampedNumberField
            label="Mobile description size (px)"
            value={settings.mobile?.descriptionFontSize ?? 14}
            min={11}
            max={24}
            fallback={14}
            onChange={(value) => updateMobile("descriptionFontSize", value)}
            disabled={disabled}
          />
          <ClampedNumberField
            label="Mobile button size (px)"
            value={settings.mobile?.ctaFontSize ?? 14}
            min={10}
            max={22}
            fallback={14}
            onChange={(value) => updateMobile("ctaFontSize", value)}
            disabled={disabled}
          />
        </FormLayout.Group>
      ) : null}

      {show.mobileHeroText && !show.mobileCtaFont ? (
        <FormLayout.Group>
          <ClampedNumberField
            label="Mobile description size (px)"
            value={settings.mobile?.descriptionFontSize ?? 14}
            min={11}
            max={24}
            fallback={14}
            onChange={(value) => updateMobile("descriptionFontSize", value)}
            disabled={disabled}
          />
          <div />
        </FormLayout.Group>
      ) : null}

      {!show.mobileHeroText && show.mobileCtaFont ? (
        <FormLayout.Group>
          <ClampedNumberField
            label="Mobile button size (px)"
            value={settings.mobile?.ctaFontSize ?? 14}
            min={10}
            max={22}
            fallback={14}
            onChange={(value) => updateMobile("ctaFontSize", value)}
            disabled={disabled}
            helpText={show.atcButton ? "Shop now and Add to cart" : undefined}
          />
          <div />
        </FormLayout.Group>
      ) : null}
    </FormLayout>
  )
}
