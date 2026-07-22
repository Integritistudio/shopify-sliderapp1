import { DataTypes } from "sequelize"

// Migration tracking table
const createMigrationsTable = async (sequelize) => {
  const queryInterface = sequelize.getQueryInterface()

  try {
    await queryInterface.createTable("SequelizeMigrations", {
      name: {
        type: DataTypes.STRING,
        primaryKey: true,
      },
      executedAt: {
        type: DataTypes.DATE,
        defaultValue: sequelize.Sequelize.NOW,
      },
    })
  } catch (error) {
    // Table might already exist
    if (!error.message.includes("already exists")) {
      throw error
    }
  }
}

// Get executed migrations
const getExecutedMigrations = async (sequelize) => {
  try {
    const [results] = await sequelize.query('SELECT name FROM "SequelizeMigrations" ORDER BY name')
    return results.map((row) => row.name)
  } catch (error) {
    return []
  }
}

// Record migration as executed
const recordMigration = async (sequelize, migrationName) => {
  await sequelize.query('INSERT INTO "SequelizeMigrations" (name) VALUES (?)', {
    replacements: [migrationName],
    type: sequelize.Sequelize.QueryTypes.INSERT,
  })
}

// Migration definitions
const migrations = {
  "001-create-sliders-table": {
    up: async (queryInterface) => {
      await queryInterface.createTable("Sliders", {
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
        },
        createdAt: {
          type: DataTypes.DATE,
          allowNull: false,
        },
        updatedAt: {
          type: DataTypes.DATE,
          allowNull: false,
        },
      })

      // Add index for better query performance
      await queryInterface.addIndex("Sliders", ["shop"], {
        name: "sliders_shop_index",
      })
    },
    down: async (queryInterface) => {
      await queryInterface.dropTable("Sliders")
    },
  },

  "002-create-slides-table": {
    up: async (queryInterface) => {
      await queryInterface.createTable("Slides", {
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
            model: "Sliders",
            key: "id",
          },
          onDelete: "CASCADE",
        },
        createdAt: {
          type: DataTypes.DATE,
          allowNull: false,
        },
        updatedAt: {
          type: DataTypes.DATE,
          allowNull: false,
        },
      })

      // Add foreign key index
      await queryInterface.addIndex("Slides", ["SliderId"], {
        name: "slides_slider_id_index",
      })
    },
    down: async (queryInterface) => {
      await queryInterface.dropTable("Slides")
    },
  },

  "003-add-slider-type-column": {
    up: async (queryInterface) => {
      const columns = await queryInterface.describeTable("Sliders")

      if (!columns.sliderType) {
        await queryInterface.addColumn("Sliders", "sliderType", {
          type: DataTypes.STRING,
          allowNull: false,
          defaultValue: "center",
        })
        console.log("Added sliderType column to Sliders table")
      }
    },
    down: async (queryInterface) => {
      await queryInterface.removeColumn("Sliders", "sliderType")
    },
  },

  "004-add-shop-column": {
    up: async (queryInterface) => {
      const columns = await queryInterface.describeTable("Sliders")

      if (!columns.shop) {
        await queryInterface.addColumn("Sliders", "shop", {
          type: DataTypes.STRING,
          allowNull: false,
          defaultValue: "default-store", // Temporary default for existing records
        })
        console.log("Added shop column to Sliders table")

        // Add index for better performance
        await queryInterface.addIndex("Sliders", ["shop"], {
          name: "sliders_shop_index",
        })
        console.log("Added index on shop column")
      }
    },
    down: async (queryInterface) => {
      await queryInterface.removeIndex("Sliders", "sliders_shop_index")
      await queryInterface.removeColumn("Sliders", "shop")
    },
  },

  "005-enhance-slider-settings": {
    up: async (queryInterface) => {
      const columns = await queryInterface.describeTable("Sliders")

      if (!columns.settings) {
        await queryInterface.addColumn("Sliders", "settings", {
          type: DataTypes.JSONB,
          allowNull: false,
          defaultValue: {},
        })
      }

      if (!columns.status) {
        await queryInterface.addColumn("Sliders", "status", {
          type: DataTypes.STRING,
          allowNull: false,
          defaultValue: "published",
        })
      }

      if (!columns.sortOrder) {
        await queryInterface.addColumn("Sliders", "sortOrder", {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 0,
        })
      }
    },
    down: async (queryInterface) => {
      const columns = await queryInterface.describeTable("Sliders")
      if (columns.settings) await queryInterface.removeColumn("Sliders", "settings")
      if (columns.status) await queryInterface.removeColumn("Sliders", "status")
      if (columns.sortOrder) await queryInterface.removeColumn("Sliders", "sortOrder")
    },
  },

  "006-enhance-slide-fields": {
    up: async (queryInterface) => {
      const columns = await queryInterface.describeTable("Slides")
      const addIfMissing = async (name, definition) => {
        if (!columns[name]) {
          await queryInterface.addColumn("Slides", name, definition)
        }
      }

      await addIfMissing("heading", { type: DataTypes.STRING, allowNull: true, defaultValue: "" })
      await addIfMissing("subheading", { type: DataTypes.STRING, allowNull: true, defaultValue: "" })
      await addIfMissing("ctaText", { type: DataTypes.STRING, allowNull: true, defaultValue: "" })
      await addIfMissing("ctaUrl", { type: DataTypes.TEXT, allowNull: true, defaultValue: "" })
      await addIfMissing("ctaStyle", { type: DataTypes.STRING, allowNull: false, defaultValue: "primary" })
      await addIfMissing("textAlign", { type: DataTypes.STRING, allowNull: false, defaultValue: "center" })
      await addIfMissing("overlayColor", { type: DataTypes.STRING, allowNull: false, defaultValue: "#000000" })
      await addIfMissing("overlayOpacity", { type: DataTypes.FLOAT, allowNull: false, defaultValue: 0.3 })
      await addIfMissing("textColor", { type: DataTypes.STRING, allowNull: false, defaultValue: "#ffffff" })
      await addIfMissing("buttonBg", { type: DataTypes.STRING, allowNull: false, defaultValue: "#008060" })
      await addIfMissing("buttonTextColor", { type: DataTypes.STRING, allowNull: false, defaultValue: "#ffffff" })
      await addIfMissing("imageAlt", { type: DataTypes.STRING, allowNull: true, defaultValue: "" })
      await addIfMissing("shopifyFileId", { type: DataTypes.STRING, allowNull: true })
      await addIfMissing("position", { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 })
      await addIfMissing("isVisible", { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true })

      // Widen imageUrl for long CDN URLs
      try {
        await queryInterface.changeColumn("Slides", "imageUrl", {
          type: DataTypes.TEXT,
          allowNull: false,
        })
      } catch (error) {
        console.warn("Could not change imageUrl column type:", error.message)
      }

      try {
        await queryInterface.addIndex("Slides", ["SliderId", "position"], {
          name: "slides_slider_position_index",
        })
      } catch (error) {
        if (!String(error.message).includes("already exists")) {
          console.warn("Could not add slides position index:", error.message)
        }
      }
    },
    down: async (queryInterface) => {
      const columns = await queryInterface.describeTable("Slides")
      const removeIfExists = async (name) => {
        if (columns[name]) await queryInterface.removeColumn("Slides", name)
      }
      try {
        await queryInterface.removeIndex("Slides", "slides_slider_position_index")
      } catch {
        // ignore
      }
      for (const name of [
        "heading",
        "subheading",
        "ctaText",
        "ctaUrl",
        "ctaStyle",
        "textAlign",
        "overlayColor",
        "overlayOpacity",
        "textColor",
        "buttonBg",
        "buttonTextColor",
        "imageAlt",
        "shopifyFileId",
        "position",
        "isVisible",
      ]) {
        await removeIfExists(name)
      }
    },
  },

  "007-cta-resource-and-video": {
    up: async (queryInterface) => {
      const columns = await queryInterface.describeTable("Slides")
      const addIfMissing = async (name, definition) => {
        if (!columns[name]) {
          await queryInterface.addColumn("Slides", name, definition)
        }
      }

      await addIfMissing("ctaResourceType", { type: DataTypes.STRING, allowNull: true })
      await addIfMissing("ctaResourceId", { type: DataTypes.STRING, allowNull: true })
      await addIfMissing("ctaOpenInNewTab", {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      })
      await addIfMissing("mediaType", {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "image",
      })
      await addIfMissing("videoUrl", { type: DataTypes.TEXT, allowNull: true, defaultValue: "" })
      await addIfMissing("videoProvider", { type: DataTypes.STRING, allowNull: true })
    },
    down: async (queryInterface) => {
      const columns = await queryInterface.describeTable("Slides")
      for (const name of [
        "ctaResourceType",
        "ctaResourceId",
        "ctaOpenInNewTab",
        "mediaType",
        "videoUrl",
        "videoProvider",
      ]) {
        if (columns[name]) await queryInterface.removeColumn("Slides", name)
      }
    },
  },

  "008-brand-kit-onboarding-analytics": {
    up: async (queryInterface) => {
      const tables = await queryInterface.showAllTables()
      const normalized = tables.map((t) => (typeof t === "string" ? t : t.tableName || t.name))

      if (!normalized.includes("BrandKits")) {
        await queryInterface.createTable("BrandKits", {
          id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
          shop: { type: DataTypes.STRING, allowNull: false, unique: true },
          textColor: { type: DataTypes.STRING, allowNull: false, defaultValue: "#ffffff" },
          buttonBg: { type: DataTypes.STRING, allowNull: false, defaultValue: "#008060" },
          buttonTextColor: { type: DataTypes.STRING, allowNull: false, defaultValue: "#ffffff" },
          overlayColor: { type: DataTypes.STRING, allowNull: false, defaultValue: "#000000" },
          overlayOpacity: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 0.35 },
          borderRadius: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 12 },
          fontNote: { type: DataTypes.STRING, allowNull: true, defaultValue: "" },
          createdAt: { type: DataTypes.DATE, allowNull: false },
          updatedAt: { type: DataTypes.DATE, allowNull: false },
        })
      }

      if (!normalized.includes("ShopOnboardings")) {
        await queryInterface.createTable("ShopOnboardings", {
          id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
          shop: { type: DataTypes.STRING, allowNull: false, unique: true },
          createdSlider: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
          addedSlide: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
          publishedSlider: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
          embeddedTheme: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
          dismissed: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
          createdAt: { type: DataTypes.DATE, allowNull: false },
          updatedAt: { type: DataTypes.DATE, allowNull: false },
        })
      }

      if (!normalized.includes("AnalyticsEvents")) {
        await queryInterface.createTable("AnalyticsEvents", {
          id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
          shop: { type: DataTypes.STRING, allowNull: false },
          sliderId: { type: DataTypes.INTEGER, allowNull: false },
          slideId: { type: DataTypes.INTEGER, allowNull: true },
          eventType: { type: DataTypes.STRING, allowNull: false },
          createdAt: { type: DataTypes.DATE, allowNull: false },
        })
        try {
          await queryInterface.addIndex("AnalyticsEvents", ["shop", "sliderId", "eventType"], {
            name: "analytics_shop_slider_type_index",
          })
        } catch (error) {
          if (!String(error.message).includes("already exists")) {
            console.warn("Could not add analytics index:", error.message)
          }
        }
      }
    },
    down: async (queryInterface) => {
      await queryInterface.dropTable("AnalyticsEvents")
      await queryInterface.dropTable("ShopOnboardings")
      await queryInterface.dropTable("BrandKits")
    },
  },

  "009-slide-variant-id": {
    up: async (queryInterface) => {
      const columns = await queryInterface.describeTable("Slides")
      if (!columns.variantId) {
        await queryInterface.addColumn("Slides", "variantId", {
          type: DataTypes.STRING,
          allowNull: true,
          defaultValue: null,
        })
      }
    },
    down: async (queryInterface) => {
      const columns = await queryInterface.describeTable("Slides")
      if (columns.variantId) {
        await queryInterface.removeColumn("Slides", "variantId")
      }
    },
  },
}

// Run pending migrations
export const runMigrations = async (sequelize) => {
  try {
    console.log("Starting migrations...")

    await createMigrationsTable(sequelize)
    const executedMigrations = await getExecutedMigrations(sequelize)

    // Get all migration names and sort them
    const migrationNames = Object.keys(migrations).sort()

    for (const migrationName of migrationNames) {
      if (executedMigrations.includes(migrationName)) {
        console.log(`Migration ${migrationName} already executed, skipping...`)
        continue
      }

      console.log(`Running migration: ${migrationName}`)

      try {
        const migration = migrations[migrationName]
        const queryInterface = sequelize.getQueryInterface()

        await migration.up(queryInterface)
        await recordMigration(sequelize, migrationName)

        console.log(`Migration ${migrationName} completed successfully`)
      } catch (error) {
        console.error(`Migration ${migrationName} failed:`, error)
        throw error
      }
    }

    console.log("All migrations completed successfully")
  } catch (error) {
    console.error("Migration error:", error)
    throw error
  }
}

// Rollback last migration (optional utility)
export const rollbackMigration = async (sequelize, migrationName) => {
  try {
    console.log(`Rolling back migration: ${migrationName}`)

    const migration = migrations[migrationName]
    if (!migration) {
      throw new Error(`Migration ${migrationName} not found`)
    }

    const queryInterface = sequelize.getQueryInterface()
    await migration.down(queryInterface)

    // Remove from migrations table
    await sequelize.query('DELETE FROM "SequelizeMigrations" WHERE name = ?', {
      replacements: [migrationName],
      type: sequelize.Sequelize.QueryTypes.DELETE,
    })

    console.log(`Migration ${migrationName} rolled back successfully`)
  } catch (error) {
    console.error(`Rollback failed for ${migrationName}:`, error)
    throw error
  }
}
