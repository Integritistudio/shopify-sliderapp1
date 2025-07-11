import express from "express"
import { Slider, Slide } from "../models/index.js"
import { extractShop } from "../middleware/auth.js"

const router = express.Router()

router.use(extractShop)

// Sliders API - NOW SCOPED TO SHOP
router.get("/sliders", async (req, res) => {
  try {
    const shop = req.shop
    console.log(`Fetching sliders for shop: ${shop}`)

    const sliders = await Slider.findAll({
      where: {
        shop: shop,
      },
      include: [
        {
          model: Slide,
          as: "slides",
          attributes: ["id", "imageUrl", "title", "description", "createdAt"],
          required: false,
        },
      ],
      order: [
        ["id", "ASC"],
        [{ model: Slide, as: "slides" }, "id", "ASC"],
      ],
    })

    console.log(`Found ${sliders.length} sliders for shop ${shop}`)

    const response = sliders.map((slider) => {
      const sliderData = slider.get({ plain: true })
      console.log(`Slider ${sliderData.id} has ${sliderData.slides?.length || 0} slides`)
      return {
        ...sliderData,
        slides: sliderData.slides || [],
      }
    })

    res.json(response)
  } catch (error) {
    console.error("Error fetching sliders:", error)
    res.status(500).json({
      error: "Failed to fetch sliders",
      details: error.message,
    })
  }
})

router.post("/sliders", async (req, res) => {
  try {
    const { name, sliderType } = req.body
    const shop = req.shop
    console.log(`Creating slider for shop ${shop}:`, { name, sliderType })

    const slider = await Slider.create({
      name,
      sliderType: sliderType || "center",
      shop: shop,
    })

    console.log(`Created slider ${slider.id} for shop ${shop}`)
    res.status(201).json(slider)
  } catch (error) {
    console.error("Error creating slider:", error)
    res.status(500).json({ error: "Failed to create slider" })
  }
})

router.put("/sliders/:id", async (req, res) => {
  try {
    const { id } = req.params
    const { name, isExpanded, sliderType } = req.body
    const shop = req.shop
    console.log(`Updating slider ${id} for shop ${shop}:`, { name, isExpanded, sliderType })

    const slider = await Slider.findOne({
      where: {
        id: id,
        shop: shop,
      },
    })

    if (!slider) {
      return res.status(404).json({ error: "Slider not found" })
    }

    if (name !== undefined) slider.name = name
    if (isExpanded !== undefined) slider.isExpanded = isExpanded
    if (sliderType !== undefined) slider.sliderType = sliderType

    await slider.save()
    console.log(`Updated slider ${id} for shop ${shop}`)
    res.json(slider)
  } catch (error) {
    console.error("Error updating slider:", error)
    res.status(500).json({ error: "Failed to update slider" })
  }
})

router.delete("/sliders/:id", async (req, res) => {
  try {
    const { id } = req.params
    const shop = req.shop
    console.log(`Deleting slider ${id} for shop ${shop}`)

    const slider = await Slider.findOne({
      where: {
        id: id,
        shop: shop,
      },
    })

    if (!slider) {
      return res.status(404).json({ error: "Slider not found" })
    }

    await slider.destroy()
    console.log(`Deleted slider ${id} for shop ${shop}`)
    res.status(204).end()
  } catch (error) {
    console.error("Error deleting slider:", error)
    res.status(500).json({ error: "Failed to delete slider" })
  }
})

export default router
