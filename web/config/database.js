import dotenv from "dotenv"
import path from "path"
import { fileURLToPath } from "url"
import { Sequelize } from "sequelize"
import { runMigrations } from "../utils/migration.js"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.resolve(__dirname, "../../.env") })

const databaseUrl = process.env.DATABASE_URL
if (!databaseUrl) {
  throw new Error(
    "DATABASE_URL is not set. Add it to the project root .env file (e.g. postgresql://user:pass@localhost:5432/dbname)."
  )
}

const useSsl = process.env.DB_SSL === "true"

// Initialize Sequelize with PostgreSQL connection
const sequelize = new Sequelize(databaseUrl, {
  dialect: "postgres",
  protocol: "postgres",
  logging: false, // Or true for debugging
  dialectOptions: useSsl
    ? {
        ssl: {
          require: true,
          rejectUnauthorized: false, // Required by Render
        },
      }
    : {},
})

// Authenticate and ensure base tables exist; schema changes come from migrations
async function syncDatabase() {
  try {
    await sequelize.authenticate()
    console.log("Database connection established successfully.")
    // Avoid alter:true in production — use additive migrations instead
    await sequelize.sync()
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
