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
