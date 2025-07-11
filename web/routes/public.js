import express from "express"
import { Slider, Slide } from "../models/index.js"
import { corsHeaders } from "../middleware/cors.js"

const router = express.Router()

// Public API endpoint for CDN script (no authentication required)
router.get("/api/public/slider/:sliderId", corsHeaders, async (req, res) => {
  try {
    const { sliderId } = req.params
    console.log(`Public API: Fetching slider ${sliderId}`)

    const slider = await Slider.findByPk(sliderId, {
      include: [
        {
          model: Slide,
          as: "slides",
          attributes: ["id", "imageUrl", "title", "description"],
          required: false,
        },
      ],
    })

    if (!slider) {
      console.log(`Slider ${sliderId} not found`)
      return res.status(404).json({ error: "Slider not found" })
    }

    // Return only necessary data for the widget
    const response = {
      id: slider.id,
      name: slider.name,
      sliderType: slider.sliderType,
      slides: slider.slides || [],
    }

    console.log(`Returning slider data:`, response)
    res.json(response)
  } catch (error) {
    console.error("Error fetching public slider:", error)
    res.status(500).json({ error: "Failed to fetch slider", details: error.message })
  }
})

export default router
