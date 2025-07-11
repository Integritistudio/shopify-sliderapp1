import shopify from "../shopify.js"

// Shopify authentication middleware
export const validateShopifySession = shopify.validateAuthenticatedSession()

// Middleware to extract shop from session
export const extractShop = (req, res, next) => {
  try {
    if (res.locals.shopify && res.locals.shopify.session) {
      req.shop = res.locals.shopify.session.shop
      console.log(`Request from shop: ${req.shop}`)
    }
    next()
  } catch (error) {
    console.error("Error extracting shop:", error)
    res.status(500).json({ error: "Authentication error" })
  }
}
