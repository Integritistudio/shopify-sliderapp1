import dotenv from "dotenv";
dotenv.config();
import { join } from "path"
import { readFileSync } from "fs"
import express from "express"
import serveStatic from "serve-static"
import { Sequelize, DataTypes } from "sequelize"
import shopify from "./shopify.js"
import productCreator from "./product-creator.js"
import PrivacyWebhookHandlers from "./privacy.js"

const PORT = Number.parseInt(process.env.BACKEND_PORT || process.env.PORT || "3000", 10)
const STATIC_PATH =
  process.env.NODE_ENV === "production" ? `${process.cwd()}/frontend/dist` : `${process.cwd()}/frontend/`
// Initialize Sequelize with PostgreSQL connection
const sequelize = new Sequelize({
  database: process.env.DB_NAME,
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  dialect: process.env.DB_DIALECT,
  logging: console.log,
});

// Define Slider model with shop field
const Slider = sequelize.define(
  "Slider",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    sliderType: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "center",
    },
    isExpanded: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    shop: {
      type: DataTypes.STRING,
      allowNull: false,
      index: true, // Add index for better query performance
    },
  },
  {
    tableName: "Sliders",
    timestamps: true,
  },
)

// Define Slide model
const Slide = sequelize.define(
  "Slide",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    imageUrl: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    SliderId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Slider,
        key: "id",
      },
    },
  },
  {
    tableName: "Slides",
    timestamps: true,
  },
)

// Define relationships
Slider.hasMany(Slide, {
  foreignKey: "SliderId",
  onDelete: "CASCADE",
  as: "slides",
})

Slide.belongsTo(Slider, {
  foreignKey: "SliderId",
  as: "slider",
})

// Sync models with database
async function syncDatabase() {
  try {
    await sequelize.authenticate()
    console.log("Database connection established successfully.")
    await sequelize.sync({ alter: true })
    console.log("Database synced successfully")
  } catch (error) {
    console.error("Error syncing database:", error)
  }
}

// Migration for existing databases
async function migrateDatabase() {
  try {
    const queryInterface = sequelize.getQueryInterface()
    const columns = await queryInterface.describeTable("Sliders")

    if (!columns.sliderType) {
      await queryInterface.addColumn("Sliders", "sliderType", {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "center",
      })
      console.log("Added sliderType column to Sliders table")
    }

    if (!columns.shop) {
      await queryInterface.addColumn("Sliders", "shop", {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "default-store", // Temporary default for existing records
      })
      console.log("Added shop column to Sliders table")
      
      // Add index for better performance
      await queryInterface.addIndex("Sliders", ["shop"], {
        name: "sliders_shop_index"
      })
      console.log("Added index on shop column")
    }
  } catch (error) {
    console.error("Migration error:", error)
  }
}

const app = express()

// Set up Shopify authentication and webhook handling
app.get(shopify.config.auth.path, shopify.auth.begin())
app.get(shopify.config.auth.callbackPath, shopify.auth.callback(), shopify.redirectToShopifyOrAppRoot())
app.post(shopify.config.webhooks.path, shopify.processWebhooks({ webhookHandlers: PrivacyWebhookHandlers }))

// Sync and migrate database when server starts
syncDatabase().then(migrateDatabase)

app.use(express.json())

// IMPORTANT: Public API endpoints BEFORE authentication middleware
// Public API endpoint for CDN script (no authentication required)
app.get("/api/public/slider/:sliderId", async (req, res) => {
  try {
    const { sliderId } = req.params

    console.log(`Public API: Fetching slider ${sliderId}`)

    // Add CORS headers for cross-origin requests
    res.header("Access-Control-Allow-Origin", "*")
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept")
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")

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

// Serve the CDN script file
app.get("/slider-cdn.js", (req, res) => {
  try {
    console.log("Serving slider-cdn.js")

    // Add CORS headers
    res.header("Access-Control-Allow-Origin", "*")
    res.header("Content-Type", "application/javascript")

    // Read the CDN script file
    const scriptPath = join(process.cwd(), "public", "slider-cdn.js")
    const scriptContent = readFileSync(scriptPath, "utf8")

    res.send(scriptContent)
  } catch (error) {
    console.error("Error serving CDN script:", error)
    res.status(404).send("// CDN script not found")
  }
})

// Handle OPTIONS requests for CORS
app.options("/api/public/*", (req, res) => {
  res.header("Access-Control-Allow-Origin", "*")
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept")
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
  res.sendStatus(200)
})

// NOW apply authentication middleware to protected routes
app.use("/api/*", shopify.validateAuthenticatedSession())

// Products API
app.get("/api/products/count", async (_req, res) => {
  const client = new shopify.api.clients.Graphql({
    session: res.locals.shopify.session,
  })

  const countData = await client.request(`
    query shopifyProductCount {
      productsCount {
        count
      }
    }
  `)

  res.status(200).send({ count: countData.data.productsCount.count })
})

app.post("/api/products", async (_req, res) => {
  let status = 200
  let error = null

  try {
    await productCreator(res.locals.shopify.session)
  } catch (e) {
    console.log(`Failed to process products/create: ${e.message}`)
    status = 500
    error = e.message
  }
  res.status(status).send({ success: status === 200, error })
})

// Sliders API - NOW SCOPED TO SHOP
app.get("/api/sliders", async (req, res) => {
  try {
    const shop = res.locals.shopify.session.shop
    console.log(`Fetching sliders for shop: ${shop}`)
    
    const sliders = await Slider.findAll({
      where: {
        shop: shop
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

app.post("/api/sliders", async (req, res) => {
  try {
    const { name, sliderType } = req.body
    const shop = res.locals.shopify.session.shop
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

app.put("/api/sliders/:id", async (req, res) => {
  try {
    const { id } = req.params
    const { name, isExpanded, sliderType } = req.body
    const shop = res.locals.shopify.session.shop
    console.log(`Updating slider ${id} for shop ${shop}:`, { name, isExpanded, sliderType })

    const slider = await Slider.findOne({
      where: {
        id: id,
        shop: shop
      }
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

app.delete("/api/sliders/:id", async (req, res) => {
  try {
    const { id } = req.params
    const shop = res.locals.shopify.session.shop
    console.log(`Deleting slider ${id} for shop ${shop}`)

    const slider = await Slider.findOne({
      where: {
        id: id,
        shop: shop
      }
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

// Slides API - NOW SCOPED TO SHOP
app.post("/api/sliders/:sliderId/slides", async (req, res) => {
  try {
    const { sliderId } = req.params
    const { imageUrl, title, description } = req.body
    const shop = res.locals.shopify.session.shop
    console.log(`Adding slide to slider ${sliderId} for shop ${shop}:`, { imageUrl, title, description })

    // Verify slider belongs to this shop
    const slider = await Slider.findOne({
      where: {
        id: sliderId,
        shop: shop
      }
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

app.put("/api/sliders/:sliderId/slides/:slideId", async (req, res) => {
  try {
    const { sliderId, slideId } = req.params
    const { imageUrl, title, description } = req.body
    const shop = res.locals.shopify.session.shop
    console.log(`Updating slide ${slideId} in slider ${sliderId} for shop ${shop}`)

    // Verify slider belongs to this shop first
    const slider = await Slider.findOne({
      where: {
        id: sliderId,
        shop: shop
      }
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

app.delete("/api/sliders/:sliderId/slides/:slideId", async (req, res) => {
  try {
    const { sliderId, slideId } = req.params
    const shop = res.locals.shopify.session.shop
    console.log(`Deleting slide ${slideId} from slider ${sliderId} for shop ${shop}`)

    // Verify slider belongs to this shop first
    const slider = await Slider.findOne({
      where: {
        id: sliderId,
        shop: shop
      }
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

app.use(shopify.cspHeaders())
app.use(serveStatic(STATIC_PATH, { index: false }))

app.use("/*", shopify.ensureInstalledOnShop(), async (_req, res, _next) => {
  return res
    .status(200)
    .set("Content-Type", "text/html")
    .send(
      readFileSync(join(STATIC_PATH, "index.html"))
        .toString()
        .replace("%VITE_SHOPIFY_API_KEY%", process.env.SHOPIFY_API_KEY || ""),
    )
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})