import express from "express"
import shopify from "../shopify.js"
import productCreator from "../product-creator.js"

const router = express.Router()

// Products API
router.get("/products/count", async (_req, res) => {
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

router.post("/products", async (_req, res) => {
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

export default router
