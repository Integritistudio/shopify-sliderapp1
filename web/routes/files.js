import express from "express"
import shopify from "../shopify.js"
import { extractShop } from "../middleware/auth.js"

const router = express.Router()

router.use(extractShop)

const FILES_QUERY = `
  query listFiles($first: Int!, $after: String, $query: String) {
    files(first: $first, after: $after, query: $query, sortKey: CREATED_AT, reverse: true) {
      pageInfo {
        hasNextPage
        endCursor
      }
      edges {
        cursor
        node {
          ... on MediaImage {
            id
            alt
            createdAt
            image {
              url
              width
              height
              altText
            }
          }
          ... on Video {
            id
            alt
            createdAt
            originalSource {
              url
              mimeType
            }
            preview {
              image {
                url
              }
            }
          }
        }
      }
    }
  }
`

const STAGED_UPLOADS_CREATE = `
  mutation stagedUploadsCreate($input: [StagedUploadInput!]!) {
    stagedUploadsCreate(input: $input) {
      stagedTargets {
        url
        resourceUrl
        parameters {
          name
          value
        }
      }
      userErrors {
        field
        message
      }
    }
  }
`

const FILE_CREATE = `
  mutation fileCreate($files: [FileCreateInput!]!) {
    fileCreate(files: $files) {
      files {
        id
        alt
        fileStatus
        ... on MediaImage {
          image {
            url
            width
            height
            altText
          }
        }
        ... on Video {
          originalSource {
            url
          }
          preview {
            image {
              url
            }
          }
        }
      }
      userErrors {
        field
        message
      }
    }
  }
`

const FILE_STATUS_QUERY = `
  query fileStatus($id: ID!) {
    node(id: $id) {
      ... on MediaImage {
        id
        alt
        fileStatus
        image {
          url
          width
          height
          altText
        }
      }
      ... on Video {
        id
        alt
        fileStatus
        originalSource {
          url
        }
        preview {
          image {
            url
          }
        }
      }
    }
  }
`

function mediaQueryFilter(mediaType, search) {
  const typePart =
    mediaType === "video" ? "media_type:VIDEO" : mediaType === "all" ? "" : "media_type:IMAGE"
  const parts = [typePart, search].filter(Boolean)
  return parts.join(" ").trim() || null
}

function mapFileNode(node) {
  if (!node) return null
  if (node.image?.url) {
    return {
      id: node.id,
      url: node.image.url,
      alt: node.alt || node.image.altText || "",
      width: node.image.width,
      height: node.image.height,
      createdAt: node.createdAt,
      mediaType: "image",
    }
  }
  if (node.originalSource?.url || node.preview?.image?.url) {
    return {
      id: node.id,
      url: node.originalSource?.url || "",
      previewUrl: node.preview?.image?.url || "",
      alt: node.alt || "",
      createdAt: node.createdAt,
      mediaType: "video",
    }
  }
  return null
}

async function waitForFileReady(client, fileId, attempts = 8) {
  for (let i = 0; i < attempts; i += 1) {
    const response = await client.request(FILE_STATUS_QUERY, { variables: { id: fileId } })
    const node = response.data?.node
    if (node?.fileStatus === "READY" || node?.image?.url || node?.originalSource?.url) {
      return node
    }
    await new Promise((resolve) => setTimeout(resolve, 500))
  }
  return null
}

router.get("/files", async (req, res) => {
  try {
    const session = res.locals.shopify?.session
    if (!session) {
      return res.status(401).json({ error: "Unauthorized" })
    }

    const first = Math.min(Number.parseInt(req.query.first || "24", 10) || 24, 50)
    const after = req.query.after || null
    const search = (req.query.query || "").trim()
    const mediaType = (req.query.mediaType || "image").toLowerCase()
    const queryFilter = mediaQueryFilter(mediaType, search)

    const client = new shopify.api.clients.Graphql({ session })
    const response = await client.request(FILES_QUERY, {
      variables: {
        first,
        after,
        query: queryFilter,
      },
    })

    const filesConnection = response.data?.files
    const files = (filesConnection?.edges || [])
      .map((edge) => mapFileNode(edge.node))
      .filter(Boolean)

    res.json({
      files,
      pageInfo: filesConnection?.pageInfo || { hasNextPage: false, endCursor: null },
    })
  } catch (error) {
    console.error("Error fetching Shopify files:", error)
    const message = String(error.message || "")
    const permission =
      message.includes("ACCESS_DENIED") ||
      message.includes("read_files") ||
      message.includes("write_files")
    res.status(permission ? 403 : 500).json({
      error: permission
        ? "Missing Files permission. Reinstall the app to grant read_files and write_files scopes."
        : "Failed to fetch Shopify files. Ensure the app has read_files access.",
      code: permission ? "FILES_PERMISSION" : "FILES_ERROR",
    })
  }
})

router.post("/files/upload", async (req, res) => {
  try {
    const session = res.locals.shopify?.session
    if (!session) {
      return res.status(401).json({ error: "Unauthorized" })
    }

    const { filename, mimeType, fileSize, fileBase64, alt = "" } = req.body || {}
    if (!filename || !mimeType || !fileBase64) {
      return res.status(400).json({ error: "filename, mimeType, and fileBase64 are required" })
    }

    const size = Number(fileSize) || Math.ceil((fileBase64.length * 3) / 4)
    if (size > 20 * 1024 * 1024) {
      return res.status(400).json({ error: "File must be 20MB or smaller" })
    }

    const isVideo = String(mimeType).startsWith("video/")
    const resource = isVideo ? "VIDEO" : "IMAGE"
    const client = new shopify.api.clients.Graphql({ session })

    const stagedResponse = await client.request(STAGED_UPLOADS_CREATE, {
      variables: {
        input: [
          {
            filename,
            mimeType,
            httpMethod: "POST",
            resource,
            fileSize: String(size),
          },
        ],
      },
    })

    const stagedErrors = stagedResponse.data?.stagedUploadsCreate?.userErrors || []
    if (stagedErrors.length) {
      return res.status(400).json({ error: stagedErrors[0].message })
    }

    const target = stagedResponse.data?.stagedUploadsCreate?.stagedTargets?.[0]
    if (!target?.url) {
      return res.status(500).json({ error: "Failed to create staged upload target" })
    }

    const binary = Buffer.from(fileBase64, "base64")
    const form = new FormData()
    for (const param of target.parameters || []) {
      form.append(param.name, param.value)
    }
    form.append("file", new Blob([binary], { type: mimeType }), filename)

    const uploadResponse = await fetch(target.url, {
      method: "POST",
      body: form,
    })

    if (!uploadResponse.ok) {
      const text = await uploadResponse.text().catch(() => "")
      console.error("Staged upload failed:", uploadResponse.status, text)
      return res.status(502).json({ error: "Failed to upload file to Shopify staging" })
    }

    const createResponse = await client.request(FILE_CREATE, {
      variables: {
        files: [
          {
            alt: alt || filename,
            contentType: isVideo ? "VIDEO" : "IMAGE",
            originalSource: target.resourceUrl,
          },
        ],
      },
    })

    const createErrors = createResponse.data?.fileCreate?.userErrors || []
    if (createErrors.length) {
      return res.status(400).json({ error: createErrors[0].message })
    }

    const created = createResponse.data?.fileCreate?.files?.[0]
    if (!created?.id) {
      return res.status(500).json({ error: "File create returned no file" })
    }

    const ready = (await waitForFileReady(client, created.id)) || created
    const mapped = mapFileNode({
      ...ready,
      createdAt: new Date().toISOString(),
    })

    if (!mapped?.url && !mapped?.previewUrl) {
      return res.status(202).json({
        id: created.id,
        mediaType: isVideo ? "video" : "image",
        alt: alt || filename,
        url: "",
        previewUrl: "",
        pending: true,
        message: "Upload accepted. File is still processing in Shopify Files.",
      })
    }

    res.status(201).json(mapped)
  } catch (error) {
    console.error("Error uploading file:", error)
    const message = String(error.message || "")
    const permission =
      message.includes("ACCESS_DENIED") ||
      message.includes("write_files") ||
      message.includes("read_files")
    res.status(permission ? 403 : 500).json({
      error: permission
        ? "Missing write_files permission. Reinstall the app to grant file upload access."
        : "Failed to upload file",
      code: permission ? "FILES_PERMISSION" : "UPLOAD_ERROR",
    })
  }
})

export default router
