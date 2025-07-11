import dotenv from "dotenv"
dotenv.config()
import { Sequelize } from "sequelize"
import { runMigrations } from "../utils/migration.js"

// Initialize Sequelize with PostgreSQL connection
const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: "postgres",
  protocol: "postgres",
  logging: false, // Or true for debugging
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false, // Required by Render
    },
  },
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

// Migration for existing databases using new migration system
async function migrateDatabase() {
  try {
    await runMigrations(sequelize)
  } catch (error) {
    console.error("Migration error:", error)
  }
}

export { sequelize, syncDatabase, migrateDatabase }
