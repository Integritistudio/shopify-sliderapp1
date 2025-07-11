import express from "express"
import { join } from "path"
import { readFileSync } from "fs"
import { corsHeaders } from "../middleware/cors.js"

const router = express.Router()

// Serve the CDN script file
router.get("/slider-cdn.js", corsHeaders, (req, res) => {
  try {
    console.log("Serving slider-cdn.js")
    res.header("Content-Type", "application/javascript")

    // ✅ Correct path - points to web/frontend/public/slider-cdn.js
    const scriptPath = join(process.cwd(), "frontend", "public", "slider-cdn.js")
    const scriptContent = readFileSync(scriptPath, "utf8")
    res.send(scriptContent)
  } catch (error) {
    console.error("Error serving CDN script:", error)
    res.status(404).send("// CDN script not found")
  }
})

export default router
