"use client"
import { useState, useEffect } from "react"
import { Modal, FormLayout, Select, Stack, Text, Spinner, Card, Thumbnail, Banner } from "@shopify/polaris"
import { useToast } from "../contexts/toast-context"

export default function CreateFromCollectionModal({ isOpen, onClose, onCreateSlider }) {
  const { showToast } = useToast()
  const [collections, setCollections] = useState([])
  const [selectedCollection, setSelectedCollection] = useState("")
  const [collectionProducts, setCollectionProducts] = useState([])
  const [isLoadingCollections, setIsLoadingCollections] = useState(false)
  const [isLoadingProducts, setIsLoadingProducts] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState(null)

  // Fetch collections when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchCollections()
    } else {
      // Reset state when modal closes
      setSelectedCollection("")
      setCollectionProducts([])
      setCollections([])
      setError(null)
    }
  }, [isOpen])

  // Fetch products when collection is selected
  useEffect(() => {
    if (selectedCollection) {
      fetchCollectionProducts(selectedCollection)
    } else {
      setCollectionProducts([])
    }
  }, [selectedCollection])

  const fetchCollections = async () => {
    try {
      setIsLoadingCollections(true)
      setError(null)

      const response = await fetch("/api/collections", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      console.log("Fetched collections:", data)
      setCollections(data)

      if (data.length === 0) {
        setError("No collections found in your store. Please create some collections first.")
      }
    } catch (error) {
      console.error("Error fetching collections:", error)
      setError(`Failed to fetch collections: ${error.message}`)
      showToast("Failed to fetch collections", { error: true })
    } finally {
      setIsLoadingCollections(false)
    }
  }

  const fetchCollectionProducts = async (collectionId) => {
    try {
      setIsLoadingProducts(true)
      setError(null)

      const response = await fetch(`/api/collections/${collectionId}/products`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      console.log("Fetched collection products:", data)
      setCollectionProducts(data)
    } catch (error) {
      console.error("Error fetching collection products:", error)
      setError(`Failed to fetch collection products: ${error.message}`)
      showToast("Failed to fetch collection products", { error: true })
    } finally {
      setIsLoadingProducts(false)
    }
  }

  const handleCreateSlider = async () => {
    if (!selectedCollection) {
      showToast("Please select a collection", { error: true })
      return
    }

    if (collectionProducts.length === 0) {
      showToast("Selected collection has no products", { error: true })
      return
    }

    try {
      setIsCreating(true)

      const selectedCollectionData = collections.find((c) => c.id.toString() === selectedCollection.toString())
      const sliderName = `${selectedCollectionData?.title || "Collection"} Slider`

      // Create slider with collection products
      await onCreateSlider(sliderName, "center", collectionProducts)

      onClose()
      showToast(`Slider created from "${selectedCollectionData?.title}" collection!`)
    } catch (error) {
      console.error("Error creating slider from collection:", error)
      showToast("Failed to create slider from collection", { error: true })
    } finally {
      setIsCreating(false)
    }
  }

  // Fix duplicate key issue by ensuring unique keys
  const collectionOptions = [
    { label: "Select a collection", value: "", key: "select-placeholder" },
    ...collections.map((collection) => ({
      label: `${collection.title} (${collection.products_count || 0} products)`,
      value: collection.id.toString(),
      key: `collection-${collection.id}`,
    })),
  ]

  const selectedCollectionData = collections.find((c) => c.id.toString() === selectedCollection.toString())

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      title="Create Slider from Collection"
      primaryAction={{
        content: isCreating ? "Creating..." : "Create Slider",
        onAction: handleCreateSlider,
        loading: isCreating,
        disabled: !selectedCollection || collectionProducts.length === 0 || isLoadingProducts,
      }}
      secondaryActions={[
        {
          content: "Cancel",
          onAction: onClose,
        },
      ]}
    >
      <Modal.Section>
        <FormLayout>
          <Stack vertical spacing="loose">
            {error && (
              <Banner status="critical" title="Error">
                <p>{error}</p>
                <div style={{ marginTop: "1rem" }}>
                  <button
                    onClick={fetchCollections}
                    style={{
                      background: "#008060",
                      color: "white",
                      border: "none",
                      padding: "8px 16px",
                      borderRadius: "4px",
                      cursor: "pointer",
                    }}
                  >
                    Retry
                  </button>
                </div>
              </Banner>
            )}

            <div>
              <Text variant="headingMd">Select Collection</Text>
              <div style={{ marginTop: "0.5rem" }}>
                {isLoadingCollections ? (
                  <Stack alignment="center" spacing="tight">
                    <Spinner size="small" />
                    <Text color="subdued">Loading collections...</Text>
                  </Stack>
                ) : (
                  <Select
                    options={collectionOptions}
                    value={selectedCollection}
                    onChange={setSelectedCollection}
                    placeholder="Choose a collection"
                    disabled={collections.length === 0}
                  />
                )}
              </div>
            </div>

            {selectedCollection && selectedCollectionData && (
              <div>
                <Text variant="headingMd">Collection Preview</Text>
                <div style={{ marginTop: "0.5rem" }}>
                  <Card sectioned>
                    <Stack alignment="center" spacing="tight">
                      {selectedCollectionData.image && (
                        <Thumbnail
                          source={selectedCollectionData.image.url}
                          alt={selectedCollectionData.title}
                          size="small"
                        />
                      )}
                      <div>
                        <Text variant="headingSm" fontWeight="semibold">
                          {selectedCollectionData.title}
                        </Text>
                        <Text color="subdued">{selectedCollectionData.products_count || 0} products</Text>
                      </div>
                    </Stack>
                  </Card>
                </div>
              </div>
            )}

            {selectedCollection && (
              <div>
                <Text variant="headingMd">Products Preview</Text>
                <div style={{ marginTop: "0.5rem" }}>
                  {isLoadingProducts ? (
                    <Stack alignment="center" spacing="tight">
                      <Spinner size="small" />
                      <Text color="subdued">Loading products...</Text>
                    </Stack>
                  ) : collectionProducts.length > 0 ? (
                    <div>
                      <Text color="subdued" variant="bodySm">
                        {collectionProducts.length} products will be added as slides
                      </Text>
                      <div
                        style={{
                          marginTop: "1rem",
                          maxHeight: "300px",
                          overflowY: "auto",
                          border: "1px solid #e1e3e5",
                          borderRadius: "8px",
                          padding: "1rem",
                        }}
                      >
                        <Stack vertical spacing="tight">
                          {collectionProducts.slice(0, 5).map((product, index) => (
                            <Card key={`product-${product.id}-${index}`} sectioned>
                              <Stack alignment="center" spacing="tight">
                                {product.image && (
                                  <Thumbnail source={product.image.src} alt={product.title} size="small" />
                                )}
                                <div style={{ flex: 1 }}>
                                  <Text variant="bodyMd" fontWeight="semibold">
                                    {product.title}
                                  </Text>
                                  {product.description && (
                                    <Text color="subdued" variant="bodySm">
                                      {product.description.substring(0, 100)}
                                      {product.description.length > 100 ? "..." : ""}
                                    </Text>
                                  )}
                                </div>
                              </Stack>
                            </Card>
                          ))}
                          {collectionProducts.length > 5 && (
                            <Text color="subdued" alignment="center">
                              ... and {collectionProducts.length - 5} more products
                            </Text>
                          )}
                        </Stack>
                      </div>
                    </div>
                  ) : (
                    <Card sectioned>
                      <Stack alignment="center" spacing="tight">
                        <Text color="subdued">No products found in this collection</Text>
                      </Stack>
                    </Card>
                  )}
                </div>
              </div>
            )}
          </Stack>
        </FormLayout>
      </Modal.Section>
    </Modal>
  )
}
