import express from "express"
import crypto from "crypto"
import PrivacyWebhookHandlers from "../privacy.js"

const router = express.Router()

function verifyShopifyWebhook(req, res, next) {
  const hmacHeader = req.get("X-Shopify-Hmac-Sha256")
  const generatedHash = crypto
    .createHmac("sha256", process.env.SHOPIFY_WEBHOOK_SECRET)
    .update(req.rawBody, "utf8")
    .digest("base64")

  if (generatedHash !== hmacHeader) {
    return res.status(401).send("Unauthorized – HMAC verification failed")
  }

  next()
}

// Shopify expects the raw body to calculate the HMAC
router.post(
  "/webhooks",
  express.raw({ type: "application/json" }), // Preserve raw body for HMAC verification
  verifyShopifyWebhook, // Your middleware from index.js
  async (req, res) => {
    const topic = req.get("X-Shopify-Topic")
    const shop = req.get("X-Shopify-Shop-Domain")
    const webhookId = req.get("X-Shopify-Webhook-Id")
    const body = req.body.toString("utf8")

    // Match the topic to the PrivacyWebhookHandlers keys
    const handlerKey = topic?.toUpperCase().replace(/\//g, "_") // e.g., CUSTOMERS_DATA_REQUEST
    const handler = PrivacyWebhookHandlers[handlerKey]

    if (handler?.callback) {
      try {
        await handler.callback(topic, shop, body, webhookId)
        res.status(200).send("Webhook processed")
      } catch (err) {
        console.error("Webhook handler error:", err)
        res.status(500).send("Webhook error")
      }
    } else {
      console.warn(`No handler for webhook topic: ${topic}`)
      res.status(200).send("No handler for this topic")
    }
  },
)

export default router
