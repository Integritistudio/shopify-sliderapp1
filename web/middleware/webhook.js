import crypto from "crypto"

export function verifyShopifyWebhook(req, res, next) {
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
