import dotenv from "dotenv"
import path from "path"
import { fileURLToPath } from "url"
import express from "express"
import serveStatic from "serve-static"
import { readFileSync } from "fs"
import shopify from "./shopify.js"
import PrivacyWebhookHandlers from "./privacy.js"
import { syncDatabase, migrateDatabase } from "./config/database.js"
import "./models/index.js"
import cdnRoutes from "./routes/cdn.js"
import publicRoutes from "./routes/public.js"
import sliderRoutes from "./routes/sliders.js"
import slideRoutes from "./routes/slides.js"
import filesRoutes from "./routes/files.js"
import collectionsRoutes from "./routes/collections.js"
import shopRoutes from "./routes/shop.js"
import webhookRoutes from "./routes/webhooks.js"
import { requestLogger, errorHandler, notFoundHandler, handleOptions } from "./utils/index.js"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.resolve(__dirname, "../.env") })

const PORT = Number.parseInt(process.env.BACKEND_PORT || process.env.PORT || "3000", 10)
const STATIC_PATH =
  process.env.NODE_ENV === "production" ? `${process.cwd()}/frontend/dist` : `${process.cwd()}/frontend/`

const app = express()

express.raw({ type: "application/json" })

// Set up Shopify authentication and webhook handling
app.get(shopify.config.auth.path, shopify.auth.begin())
app.get(shopify.config.auth.callbackPath, shopify.auth.callback(), shopify.redirectToShopifyOrAppRoot())
app.post(shopify.config.webhooks.path, shopify.processWebhooks({ webhookHandlers: PrivacyWebhookHandlers }))

// Sync and migrate database when server starts
syncDatabase().then(migrateDatabase)

app.use(express.json({ limit: "25mb" }))
app.use(requestLogger)

// IMPORTANT: Public API endpoints BEFORE authentication middleware
app.use("/", cdnRoutes)
app.use("/", publicRoutes)

// Handle OPTIONS requests for CORS
app.options("/api/public/*", handleOptions)

// NOW apply authentication middleware to protected routes
app.use("/api/*", shopify.validateAuthenticatedSession())

// API Routes
app.use("/api", sliderRoutes)
app.use("/api", slideRoutes)
app.use("/api", filesRoutes)
app.use("/api", collectionsRoutes)
app.use("/api", shopRoutes)
app.use("/api", webhookRoutes)

app.use(shopify.cspHeaders())
app.use(serveStatic(STATIC_PATH, { index: false }))

app.use("/*", shopify.ensureInstalledOnShop(), async (_req, res, _next) => {
  return res
    .status(200)
    .set("Content-Type", "text/html")
    .send(
      readFileSync(path.join(STATIC_PATH, "index.html"))
        .toString()
        .replace("%VITE_SHOPIFY_API_KEY%", process.env.SHOPIFY_API_KEY || ""),
    )
})

// Error handling middleware (must be last)
app.use(notFoundHandler)
app.use(errorHandler)

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
