import express from "express"
import { Slider, Slide } from "../models/index.js"
import { extractShop } from "../middleware/auth.js"

const router = express.Router()

router.use(extractShop)

// Slides API - NOW SCOPED TO SHOP
router.post("/sliders/:sliderId/slides", async (req, res) => {
  try {
    const { sliderId } = req.params
    const { imageUrl, title, description } = req.body
    const shop = req.shop
    console.log(`Adding slide to slider ${sliderId} for shop ${shop}:`, { imageUrl, title, description })

    // Verify slider belongs to this shop
    const slider = await Slider.findOne({
      where: {
        id: sliderId,
        shop: shop,
      },
    })

    if (!slider) {
      return res.status(404).json({ error: "Slider not found" })
    }

    const slide = await Slide.create({
      imageUrl,
      title,
      description,
      SliderId: Number.parseInt(sliderId),
    })

    console.log(`Created slide ${slide.id} for slider ${sliderId} in shop ${shop}`)
    res.status(201).json(slide)
  } catch (error) {
    console.error("Error creating slide:", error)
    res.status(500).json({ error: "Failed to create slide", details: error.message })
  }
})

router.put("/sliders/:sliderId/slides/:slideId", async (req, res) => {
  try {
    const { sliderId, slideId } = req.params
    const { imageUrl, title, description } = req.body
    const shop = req.shop
    console.log(`Updating slide ${slideId} in slider ${sliderId} for shop ${shop}`)

    // Verify slider belongs to this shop first
    const slider = await Slider.findOne({
      where: {
        id: sliderId,
        shop: shop,
      },
    })

    if (!slider) {
      return res.status(404).json({ error: "Slider not found" })
    }

    const slide = await Slide.findOne({
      where: {
        id: slideId,
        SliderId: sliderId,
      },
    })

    if (!slide) {
      return res.status(404).json({ error: "Slide not found" })
    }

    if (imageUrl !== undefined) slide.imageUrl = imageUrl
    if (title !== undefined) slide.title = title
    if (description !== undefined) slide.description = description

    await slide.save()
    console.log(`Updated slide ${slideId} for shop ${shop}`)
    res.json(slide)
  } catch (error) {
    console.error("Error updating slide:", error)
    res.status(500).json({ error: "Failed to update slide" })
  }
})

router.delete("/sliders/:sliderId/slides/:slideId", async (req, res) => {
  try {
    const { sliderId, slideId } = req.params
    const shop = req.shop
    console.log(`Deleting slide ${slideId} from slider ${sliderId} for shop ${shop}`)

    // Verify slider belongs to this shop first
    const slider = await Slider.findOne({
      where: {
        id: sliderId,
        shop: shop,
      },
    })

    if (!slider) {
      return res.status(404).json({ error: "Slider not found" })
    }

    const slide = await Slide.findOne({
      where: {
        id: slideId,
        SliderId: sliderId,
      },
    })

    if (!slide) {
      return res.status(404).json({ error: "Slide not found" })
    }

    await slide.destroy()
    console.log(`Deleted slide ${slideId} for shop ${shop}`)
    res.status(204).end()
  } catch (error) {
    console.error("Error deleting slide:", error)
    res.status(500).json({ error: "Failed to delete slide" })
  }
})

export default router
