"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { TextField, Text, Button, Spinner, Banner } from "@shopify/polaris"

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = String(reader.result || "")
      const base64 = result.includes(",") ? result.split(",")[1] : result
      resolve(base64)
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export default function MediaPickerInline({ onSelect, onClose, mediaType = "image" }) {
  const [files, setFiles] = useState([])
  const [query, setQuery] = useState("")
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState(null)
  const [permissionError, setPermissionError] = useState(false)
  const [pageInfo, setPageInfo] = useState({ hasNextPage: false, endCursor: null })
  const [dragOver, setDragOver] = useState(false)
  const inputRef = useRef(null)

  const fetchFiles = useCallback(
    async ({ search = "", after = null, append = false } = {}) => {
      try {
        setLoading(true)
        setError(null)
        setPermissionError(false)
        const params = new URLSearchParams()
        if (search) params.set("query", search)
        if (after) params.set("after", after)
        params.set("first", "24")
        params.set("mediaType", mediaType === "video" ? "video" : "image")

        const response = await fetch(`/api/files?${params.toString()}`)
        const data = await response.json().catch(() => ({}))
        if (!response.ok) {
          if (data.code === "FILES_PERMISSION" || response.status === 403) {
            setPermissionError(true)
          }
          throw new Error(data.error || "Failed to load Shopify files")
        }
        setFiles((prev) => (append ? [...prev, ...(data.files || [])] : data.files || []))
        setPageInfo(data.pageInfo || { hasNextPage: false, endCursor: null })
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    },
    [mediaType],
  )

  useEffect(() => {
    fetchFiles({ search: "" })
  }, [fetchFiles])

  const uploadFile = async (file) => {
    if (!file) return
    const isVideo = file.type.startsWith("video/")
    if (mediaType === "image" && !file.type.startsWith("image/")) {
      setError("Please upload an image file")
      return
    }
    if (mediaType === "video" && !isVideo && !file.type.startsWith("image/")) {
      setError("Please upload a video or poster image")
      return
    }

    try {
      setUploading(true)
      setError(null)
      const fileBase64 = await fileToBase64(file)
      const response = await fetch("/api/files/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filename: file.name,
          mimeType: file.type || "application/octet-stream",
          fileSize: file.size,
          fileBase64,
          alt: file.name,
        }),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) {
        if (data.code === "FILES_PERMISSION" || response.status === 403) {
          setPermissionError(true)
        }
        throw new Error(data.error || "Upload failed")
      }
      await fetchFiles({ search: query.trim() })
      if (data.url || data.previewUrl) {
        onSelect({
          id: data.id,
          url: data.url || data.previewUrl,
          previewUrl: data.previewUrl,
          alt: data.alt || file.name,
          mediaType: data.mediaType || (isVideo ? "video" : "image"),
        })
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setUploading(false)
    }
  }

  const onDrop = async (event) => {
    event.preventDefault()
    setDragOver(false)
    const file = event.dataTransfer?.files?.[0]
    if (file) await uploadFile(file)
  }

  return (
    <div
      style={{
        border: "1px solid #dfe3e8",
        borderRadius: 12,
        padding: 14,
        background: "#fafbfb",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <Text variant="headingSm" as="h3">
          Shopify Files
        </Text>
        {onClose && (
          <Button plain onClick={onClose}>
            Close
          </Button>
        )}
      </div>

      <div
        onDragOver={(e) => {
          e.preventDefault()
          setDragOver(true)
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        style={{
          border: `2px dashed ${dragOver ? "#2c4a6e" : "#c9cccf"}`,
          borderRadius: 12,
          padding: "1rem",
          textAlign: "center",
          background: dragOver ? "#f3f6fa" : "#fff",
          marginBottom: 12,
        }}
      >
        <Text variant="bodySm">
          Drag & drop {mediaType === "video" ? "a video" : "an image"} here, or upload from your computer
        </Text>
        <div style={{ marginTop: 10 }}>
          <Button onClick={() => inputRef.current?.click()} loading={uploading}>
            Upload file
          </Button>
          <input
            ref={inputRef}
            type="file"
            accept={mediaType === "video" ? "video/*,image/*" : "image/*"}
            style={{ display: "none" }}
            onChange={(e) => uploadFile(e.target.files?.[0])}
          />
        </div>
      </div>

      <TextField
        label="Search files"
        labelHidden
        value={query}
        onChange={setQuery}
        placeholder={mediaType === "video" ? "Search videos" : "Search uploaded images"}
        connectedRight={<Button onClick={() => fetchFiles({ search: query.trim() })}>Search</Button>}
      />

      {permissionError && (
        <div style={{ marginTop: 12 }}>
          <Banner status="warning" title="Files permission required">
            <p>
              SlideEase needs <strong>read_files</strong> and <strong>write_files</strong>. Reinstall the app from
              Shopify Admin → Apps to grant these scopes, then try again.
            </p>
          </Banner>
        </div>
      )}

      {error && !permissionError && (
        <div style={{ marginTop: 12 }}>
          <Banner status="critical">
            <p>{error}</p>
          </Banner>
        </div>
      )}

      {loading && files.length === 0 ? (
        <div style={{ textAlign: "center", padding: "1.5rem" }}>
          <Spinner size="large" />
        </div>
      ) : files.length === 0 ? (
        <div style={{ padding: "1rem 0" }}>
          <Text color="subdued">
            No {mediaType === "video" ? "videos" : "images"} found. Upload above or add files in Shopify Admin → Content
            → Files.
          </Text>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(96px, 1fr))",
            gap: 10,
            marginTop: 12,
            maxHeight: 260,
            overflowY: "auto",
          }}
        >
          {files.map((file) => (
            <button
              key={file.id}
              type="button"
              onClick={() => onSelect(file)}
              style={{
                border: "1px solid #e1e3e5",
                borderRadius: 10,
                padding: 0,
                overflow: "hidden",
                background: "#fff",
                cursor: "pointer",
                aspectRatio: "1 / 1",
                position: "relative",
              }}
              title={file.alt || "Select file"}
            >
              <img
                src={file.previewUrl || file.url}
                alt={file.alt || "File"}
                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
              />
              {file.mediaType === "video" && (
                <span
                  style={{
                    position: "absolute",
                    bottom: 4,
                    right: 4,
                    background: "rgba(0,0,0,0.7)",
                    color: "#fff",
                    fontSize: 10,
                    padding: "2px 5px",
                    borderRadius: 4,
                  }}
                >
                  Video
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {pageInfo.hasNextPage && (
        <div style={{ marginTop: 12 }}>
          <Button
            onClick={() => fetchFiles({ search: query.trim(), after: pageInfo.endCursor, append: true })}
            loading={loading}
          >
            Load more
          </Button>
        </div>
      )}
    </div>
  )
}
