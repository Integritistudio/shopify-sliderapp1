"use client"

import { useCallback, useEffect, useState } from "react"
import { FormLayout, TextField, Stack, Text, Button, Banner } from "@shopify/polaris"
import { useAppBridge } from "@shopify/app-bridge-react"
import { PRODUCT_SLIDER_TYPES, SLIDER_TYPES } from "../utils/sliderConfig"
import SeSelect from "./se-select"

function clampNum(value, min, max, fallback) {
  const next = Number(value)
  if (!Number.isFinite(next)) return fallback
  return Math.min(max, Math.max(min, next))
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
  onTypeChange,
  onSettingsChange,
  onCollectionSynced,
  disabled = false,
}) {
  const [collections, setCollections] = useState([])
  const [collectionsError, setCollectionsError] = useState(null)
  const [loadingCollections, setLoadingCollections] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [syncMessage, setSyncMessage] = useState(null)
  const shopify = useAppBridge()

  const isProductType = PRODUCT_SLIDER_TYPES.includes(sliderType)
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

  return (
    <FormLayout>
      <SeSelect
        label="Slider preset"
        options={SLIDER_TYPES.map((type) => ({
          label: `${type.group || "Style"} · ${type.label}`,
          value: type.value,
        }))}
        value={sliderType}
        onChange={onTypeChange}
        disabled={disabled}
        helpText={SLIDER_TYPES.find((t) => t.value === sliderType)?.description}
      />

      {isProductType ? <Text variant="headingSm">Products</Text> : null}

      {isProductType ? (
        <TextField
          label="Section heading (optional)"
          value={settings.sectionHeading || ""}
          onChange={(value) => update("sectionHeading", value)}
          placeholder="Featured products"
          disabled={disabled}
          autoComplete="off"
        />
      ) : null}

      {isProductType && collectionsError ? (
        <Banner status="warning" title="Collections unavailable">
          <p>{collectionsError}</p>
        </Banner>
      ) : null}

      {isProductType ? (
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
        </div>
      ) : null}

      {isProductType && settings.showAddToCart !== false ? (
        <TextField
          label="Add to cart label"
          value={settings.addToCartText || "Add to cart"}
          onChange={(value) => update("addToCartText", value)}
          disabled={disabled}
          autoComplete="off"
        />
      ) : null}

      {isProductType ? (
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

      {isProductType ? (
        <FormLayout.Group>
          <TextField
            label="Collection product limit"
            type="number"
            value={String(settings.productLimit ?? 8)}
            onChange={(value) => update("productLimit", Math.min(Math.max(Number(value) || 8, 1), 50))}
            disabled={disabled}
          />
          <div style={{ display: "flex", alignItems: "flex-end", height: "100%", paddingBottom: 2 }}>
            <Button onClick={syncCollection} loading={syncing} disabled={disabled || !settings.collectionId}>
              Sync collection
            </Button>
          </div>
        </FormLayout.Group>
      ) : null}

      {isProductType && syncMessage ? (
        <Banner status={syncMessage.error ? "critical" : "success"}>
          <p>{syncMessage.text}</p>
        </Banner>
      ) : null}

      {isProductType ? <Text variant="headingSm">Product typography</Text> : null}

      {isProductType ? (
        <FormLayout.Group>
          <TextField
            label="Section heading size (px)"
            type="number"
            value={String(settings.sectionHeadingFontSize ?? 28)}
            onChange={(value) => update("sectionHeadingFontSize", clampNum(value, 16, 48, 28))}
            disabled={disabled}
            autoComplete="off"
          />
          <TextField
            label="Space under heading (px)"
            type="number"
            value={String(settings.sectionHeadingGap ?? 16)}
            onChange={(value) => update("sectionHeadingGap", clampNum(value, 0, 64, 16))}
            disabled={disabled}
            autoComplete="off"
          />
        </FormLayout.Group>
      ) : null}

      {isProductType ? (
        <FormLayout.Group>
          <TextField
            label="Product title size (px)"
            type="number"
            value={String(settings.productTitleFontSize ?? 16)}
            onChange={(value) => update("productTitleFontSize", clampNum(value, 12, 28, 16))}
            disabled={disabled}
            autoComplete="off"
          />
          <TextField
            label="Price size (px)"
            type="number"
            value={String(settings.productPriceFontSize ?? 14)}
            onChange={(value) => update("productPriceFontSize", clampNum(value, 10, 24, 14))}
            disabled={disabled}
            autoComplete="off"
          />
        </FormLayout.Group>
      ) : null}

      {isProductType ? (
        <FormLayout.Group>
          <TextField
            label="Content gap (px)"
            type="number"
            value={String(settings.productContentGap ?? 8)}
            onChange={(value) => update("productContentGap", clampNum(value, 0, 32, 8))}
            disabled={disabled}
            autoComplete="off"
          />
          <TextField
            label="Pagination gap (px)"
            type="number"
            value={String(settings.paginationGap ?? 16)}
            onChange={(value) => update("paginationGap", clampNum(value, 0, 48, 16))}
            disabled={disabled}
            autoComplete="off"
          />
        </FormLayout.Group>
      ) : null}

      <FormLayout.Group>
        <TextField
          label="Height (px)"
          type="number"
          value={String(settings.height || 640)}
          onChange={(value) => update("height", clampNum(value, heightMin, 900, 640))}
          disabled={disabled}
          autoComplete="off"
        />
        <TextField
          label="Corner radius (px)"
          type="number"
          value={String(settings.borderRadius ?? 0)}
          onChange={(value) => update("borderRadius", clampNum(value, 0, 40, 0))}
          disabled={disabled}
          autoComplete="off"
        />
      </FormLayout.Group>

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

      <FormLayout.Group>
        <TextField
          label="Slides to show"
          type="number"
          value={String(settings.slidesToShow ?? 1)}
          onChange={(value) => update("slidesToShow", Number(value) || 1)}
          disabled={disabled}
        />
        <TextField
          label="Autoplay speed (ms)"
          type="number"
          value={String(settings.autoplaySpeed ?? 3000)}
          onChange={(value) => update("autoplaySpeed", Number(value) || 3000)}
          disabled={disabled}
        />
      </FormLayout.Group>

      <Stack spacing="tight">
        <Button pressed={Boolean(settings.autoplay)} onClick={() => update("autoplay", !settings.autoplay)} disabled={disabled}>
          Autoplay {settings.autoplay ? "On" : "Off"}
        </Button>
        <Button pressed={settings.arrows !== false} onClick={() => update("arrows", settings.arrows === false)} disabled={disabled}>
          Arrows {settings.arrows === false ? "Off" : "On"}
        </Button>
        <Button pressed={settings.dots !== false} onClick={() => update("dots", settings.dots === false)} disabled={disabled}>
          Dots {settings.dots === false ? "Off" : "On"}
        </Button>
        <Button pressed={settings.infinite !== false} onClick={() => update("infinite", settings.infinite === false)} disabled={disabled}>
          Infinite {settings.infinite === false ? "Off" : "On"}
        </Button>
      </Stack>

      <FormLayout.Group>
        <TextField
          label="Arrow color"
          value={settings.arrowColor || "#ffffff"}
          onChange={(value) => update("arrowColor", value)}
          disabled={disabled}
        />
        <TextField
          label="Dot color"
          value={settings.dotColor || "#2c4a6e"}
          onChange={(value) => update("dotColor", value)}
          disabled={disabled}
        />
      </FormLayout.Group>

      <Text variant="headingSm">{isProductType ? "Shop now button" : "CTA button"}</Text>
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

      <ColorField
        label="Hover text color"
        value={settings.ctaHoverTextColor || "#ffffff"}
        onChange={(value) => update("ctaHoverTextColor", value)}
        fallback="#ffffff"
        disabled={disabled}
      />

      {!isProductType ? (
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

      {!isProductType ? (
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
      ) : null}

      {!isProductType ? (
        <TextField
          label="Icon size (px)"
          type="number"
          value={String(settings.ctaIconSize ?? 34)}
          onChange={(value) => update("ctaIconSize", clampNum(value, 20, 56, 34))}
          disabled={disabled}
          autoComplete="off"
        />
      ) : null}

      <FormLayout.Group>
        <TextField
          label="Button border (px)"
          type="number"
          value={String(settings.ctaBorderWidth ?? 1)}
          onChange={(value) => update("ctaBorderWidth", clampNum(value, 0, 6, 1))}
          disabled={disabled}
          autoComplete="off"
        />
        <TextField
          label="Button corners (px)"
          type="number"
          value={String(settings.ctaBorderRadius ?? 50)}
          onChange={(value) => update("ctaBorderRadius", clampNum(value, 0, 50, 50))}
          disabled={disabled}
          autoComplete="off"
        />
      </FormLayout.Group>

      {isProductType ? (
        <TextField
          label="Button font size (px)"
          type="number"
          value={String(settings.ctaFontSize ?? 16)}
          onChange={(value) => update("ctaFontSize", clampNum(value, 10, 24, 16))}
          disabled={disabled}
          autoComplete="off"
        />
      ) : (
        <FormLayout.Group>
          <TextField
            label="Button font size (px)"
            type="number"
            value={String(settings.ctaFontSize ?? 16)}
            onChange={(value) => update("ctaFontSize", clampNum(value, 10, 24, 16))}
            disabled={disabled}
            autoComplete="off"
          />
          <TextField
            label="Button padding (px)"
            type="number"
            value={String(settings.ctaPadding ?? 12)}
            onChange={(value) => update("ctaPadding", clampNum(value, 4, 36, 12))}
            disabled={disabled}
            autoComplete="off"
          />
        </FormLayout.Group>
      )}

      {isProductType ? <Text variant="headingSm">Add to cart button</Text> : null}

      {isProductType ? (
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

      {isProductType ? (
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

      {isProductType ? (
        <ColorField
          label="Hover text color"
          value={settings.atcHoverTextColor || "#ffffff"}
          onChange={(value) => update("atcHoverTextColor", value)}
          fallback="#ffffff"
          disabled={disabled}
        />
      ) : null}

      {isProductType ? (
        <FormLayout.Group>
          <TextField
            label="Button border (px)"
            type="number"
            value={String(settings.atcBorderWidth ?? 1)}
            onChange={(value) => update("atcBorderWidth", clampNum(value, 0, 6, 1))}
            disabled={disabled}
            autoComplete="off"
          />
          <TextField
            label="Button corners (px)"
            type="number"
            value={String(settings.atcBorderRadius ?? 50)}
            onChange={(value) => update("atcBorderRadius", clampNum(value, 0, 50, 50))}
            disabled={disabled}
            autoComplete="off"
          />
        </FormLayout.Group>
      ) : null}

      {isProductType ? (
        <FormLayout.Group>
          <TextField
            label="Button font size (px)"
            type="number"
            value={String(settings.atcFontSize ?? 14)}
            onChange={(value) => update("atcFontSize", clampNum(value, 10, 24, 14))}
            disabled={disabled}
            autoComplete="off"
          />
          <TextField
            label="Button padding (px)"
            type="number"
            value={String(settings.ctaPadding ?? settings.atcPadding ?? 12)}
            onChange={(value) => {
              const next = clampNum(value, 4, 36, 12)
              onSettingsChange({
                ...settings,
                ctaPadding: next,
                atcPadding: next,
              })
            }}
            disabled={disabled}
            autoComplete="off"
          />
        </FormLayout.Group>
      ) : null}

      <Text variant="headingSm">Mobile overrides</Text>
      <FormLayout.Group>
        <TextField
          label="Mobile slides to show"
          type="number"
          value={String(settings.mobile?.slidesToShow ?? 1)}
          onChange={(value) => updateMobile("slidesToShow", Number(value) || 1)}
          disabled={disabled}
        />
        <TextField
          label="Mobile slides to scroll"
          type="number"
          value={String(settings.mobile?.slidesToScroll ?? 1)}
          onChange={(value) => updateMobile("slidesToScroll", Number(value) || 1)}
          disabled={disabled}
        />
      </FormLayout.Group>
    </FormLayout>
  )
}
