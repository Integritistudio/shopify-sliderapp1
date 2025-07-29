import shopify from "../shopify.js"

// Shopify authentication middleware
export const validateShopifySession = shopify.validateAuthenticatedSession()

// Middleware to extract shop from session
export const extractShop = (req, res, next) => {
  try {
    console.log("extractShop middleware called")
    console.log("res.locals:", res.locals)
    console.log("res.locals.shopify:", res.locals.shopify)
    
    if (res.locals.shopify && res.locals.shopify.session) {
      req.shop = res.locals.shopify.session.shop
      console.log(`Request from shop: ${req.shop}`)
    } else {
      console.log("No shopify session found in res.locals")
    }
    next()
  } catch (error) {
    console.error("Error extracting shop:", error)
    res.status(500).json({ error: "Authentication error" })
  }
}
