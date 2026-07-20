"use client"

import { useCallback, useEffect, useState } from "react"
import {
  Modal,
  TextField,
  Stack,
  Text,
  Button,
  Spinner,
  Thumbnail,
  EmptyState,
  Banner,
} from "@shopify/polaris"

export default function MediaPickerModal({ open, onClose, onSelect }) {
  const [files, setFiles] = useState([])
  const [query, setQuery] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [pageInfo, setPageInfo] = useState({ hasNextPage: false, endCursor: null })

  const fetchFiles = useCallback(async ({ search = "", after = null, append = false } = {}) => {
    try {
      setLoading(true)
      setError(null)
      const params = new URLSearchParams()
      if (search) params.set("query", search)
      if (after) params.set("after", after)
      params.set("first", "24")

      const response = await fetch(`/api/files?${params.toString()}`)
      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data.error || "Failed to load Shopify files")
      }
      const data = await response.json()
      setFiles((prev) => (append ? [...prev, ...(data.files || [])] : data.files || []))
      setPageInfo(data.pageInfo || { hasNextPage: false, endCursor: null })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (open) {
      fetchFiles({ search: "" })
    }
  }, [open, fetchFiles])

  const handleSearch = () => {
    fetchFiles({ search: query.trim() })
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Select image from Shopify Files"
      large
      secondaryActions={[{ content: "Cancel", onAction: onClose }]}
    >
      <Modal.Section>
        <Stack vertical spacing="loose">
          <Stack>
            <div style={{ flex: 1 }}>
              <TextField
                label="Search files"
                labelHidden
                value={query}
                onChange={setQuery}
                placeholder="Search uploaded images"
                connectedRight={<Button onClick={handleSearch}>Search</Button>}
                onBlur={handleSearch}
              />
            </div>
          </Stack>

          {error && (
            <Banner status="critical" title="Could not load files">
              <p>{error}</p>
              <p>Make sure the app has the read_files scope and reinstall if you just updated permissions.</p>
            </Banner>
          )}

          {loading && files.length === 0 ? (
            <div style={{ textAlign: "center", padding: "2rem" }}>
              <Spinner size="large" />
            </div>
          ) : files.length === 0 ? (
            <EmptyState
              heading="No images found"
              image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
            >
              <p>Upload images in Shopify Admin → Content → Files, then try again.</p>
            </EmptyState>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
                gap: "12px",
              }}
            >
              {files.map((file) => (
                <button
                  key={file.id}
                  type="button"
                  onClick={() => {
                    onSelect(file)
                    onClose()
                  }}
                  style={{
                    border: "1px solid #e1e3e5",
                    borderRadius: 8,
                    padding: 8,
                    background: "#fff",
                    cursor: "pointer",
                    textAlign: "left",
                  }}
                >
                  <Thumbnail source={file.url} alt={file.alt || "File"} size="large" />
                  <Text variant="bodySm" truncate>
                    {file.alt || "Untitled image"}
                  </Text>
                </button>
              ))}
            </div>
          )}

          {pageInfo.hasNextPage && (
            <Button
              onClick={() => fetchFiles({ search: query.trim(), after: pageInfo.endCursor, append: true })}
              loading={loading}
            >
              Load more
            </Button>
          )}
        </Stack>
      </Modal.Section>
    </Modal>
  )
}
