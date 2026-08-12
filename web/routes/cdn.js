import express from "express"
import { join } from "path"
import { readFileSync } from "fs"
import { corsHeaders } from "../middleware/cors.js"

const router = express.Router()

function servePublicScript(filename, res) {
  try {
    res.header("Content-Type", "application/javascript; charset=utf-8")
    res.header("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0")
    res.header("Pragma", "no-cache")
    const scriptPath = join(process.cwd(), "frontend", "public", filename)
    const scriptContent = readFileSync(scriptPath, "utf8")
    res.send(scriptContent)
  } catch (error) {
    console.error(`Error serving ${filename}:`, error)
    res.status(404).send(`// ${filename} not found`)
  }
}

// Serve the CDN script file
router.get("/slider-cdn.js", corsHeaders, (req, res) => {
  console.log("Serving slider-cdn.js")
  servePublicScript("slider-cdn.js", res)
})

router.get("/premium-coverflow.js", corsHeaders, (req, res) => {
  servePublicScript("premium-coverflow.js", res)
})

router.get("/premium-circular.js", corsHeaders, (req, res) => {
  servePublicScript("premium-circular.js", res)
})

router.get("/collection-carousel.js", corsHeaders, (req, res) => {
  servePublicScript("collection-carousel.js", res)
})

export default router
