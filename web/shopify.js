import dotenv from "dotenv"
dotenv.config()
import { LATEST_API_VERSION } from "@shopify/shopify-api";
import { shopifyApp } from "@shopify/shopify-app-express";
import { SQLiteSessionStorage } from "@shopify/shopify-app-session-storage-sqlite";
import { restResources } from "@shopify/shopify-api/rest/admin/2024-10";
import { PostgreSQLSessionStorage } from "@shopify/shopify-app-session-storage-postgresql";




// Path to your SQLite database file
// const DB_PATH = `${process.cwd()}/database.sqlite`;


const shopify = shopifyApp({
  api: {
    apiVersion: LATEST_API_VERSION,
    restResources,
    future: {
      customerAddressDefaultFix: true,
      lineItemBilling: true,
      unstable_managedPricingSupport: true,
    },
    billing: undefined, // App is free — no billing
  },
  auth: {
    path: "/api/auth",
    callbackPath: "/api/auth/callback",
  },
  webhooks: {
    path: "/api/webhooks",
  },
  // Using SQLite for session storage (you can change to PostgreSQL or MySQL later)
  sessionStorage: new PostgreSQLSessionStorage(process.env.DATABASE_URL)
});

export default shopify;
