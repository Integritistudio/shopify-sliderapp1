// import { DeliveryMethod } from "@shopify/shopify-api";

// /**
//  * @type {{[key: string]: import("@shopify/shopify-api").WebhookHandler}}
//  */
// export default {
//   /**
//    * Customers can request their data from a store owner. When this happens,
//    * Shopify invokes this privacy webhook.
//    *
//    * https://shopify.dev/docs/apps/webhooks/configuration/mandatory-webhooks#customers-data_request
//    */
//   CUSTOMERS_DATA_REQUEST: {
//     deliveryMethod: DeliveryMethod.Http,
//     callbackUrl: "/api/webhooks",
//     callback: async (topic, shop, body, webhookId) => {
//       const payload = JSON.parse(body);
//       // Payload has the following shape:
//       // {
//       //   "shop_id": 954889,
//       //   "shop_domain": "{shop}.myshopify.com",
//       //   "orders_requested": [
//       //     299938,
//       //     280263,
//       //     220458
//       //   ],
//       //   "customer": {
//       //     "id": 191167,
//       //     "email": "john@example.com",
//       //     "phone": "555-625-1199"
//       //   },
//       //   "data_request": {
//       //     "id": 9999
//       //   }
//       // }
//     },
//   },

//   /**
//    * Store owners can request that data is deleted on behalf of a customer. When
//    * this happens, Shopify invokes this privacy webhook.
//    *
//    * https://shopify.dev/docs/apps/webhooks/configuration/mandatory-webhooks#customers-redact
//    */
//   CUSTOMERS_REDACT: {
//     deliveryMethod: DeliveryMethod.Http,
//     callbackUrl: "/api/webhooks",
//     callback: async (topic, shop, body, webhookId) => {
//       const payload = JSON.parse(body);
//       // Payload has the following shape:
//       // {
//       //   "shop_id": 954889,
//       //   "shop_domain": "{shop}.myshopify.com",
//       //   "customer": {
//       //     "id": 191167,
//       //     "email": "john@example.com",
//       //     "phone": "555-625-1199"
//       //   },
//       //   "orders_to_redact": [
//       //     299938,
//       //     280263,
//       //     220458
//       //   ]
//       // }
//     },
//   },

//   /**
//    * 48 hours after a store owner uninstalls your app, Shopify invokes this
//    * privacy webhook.
//    *
//    * https://shopify.dev/docs/apps/webhooks/configuration/mandatory-webhooks#shop-redact
//    */
//   SHOP_REDACT: {
//     deliveryMethod: DeliveryMethod.Http,
//     callbackUrl: "/api/webhooks",
//     callback: async (topic, shop, body, webhookId) => {
//       const payload = JSON.parse(body);
//       // Payload has the following shape:
//       // {
//       //   "shop_id": 954889,
//       //   "shop_domain": "{shop}.myshopify.com"
//       // }
//     },
//   },
// };
import { DeliveryMethod } from "@shopify/shopify-api"
import { Slider } from "./models/Slider.js"
import { Op } from "sequelize"

/**
 * @type {{[key: string]: import("@shopify/shopify-api").WebhookHandler}}
 */
export default {
  CUSTOMERS_DATA_REQUEST: {
    deliveryMethod: DeliveryMethod.Http,
    callbackUrl: "/api/webhooks",
    callback: async (topic, shop, body, webhookId) => {
      const payload = JSON.parse(body)
      console.log("CUSTOMERS_DATA_REQUEST received:", payload)
      console.log(`Customer data request for ${payload.customer.email} in shop ${payload.shop_domain}`)
    },
  },

  CUSTOMERS_REDACT: {
    deliveryMethod: DeliveryMethod.Http,
    callbackUrl: "/api/webhooks",
    callback: async (topic, shop, body, webhookId) => {
      const payload = JSON.parse(body)
      console.log("CUSTOMERS_REDACT received:", payload)
      console.log(`Redacting customer ${payload.customer.email} in shop ${payload.shop_domain}`)
    },
  },

  SHOP_REDACT: {
    deliveryMethod: DeliveryMethod.Http,
    callbackUrl: "/api/webhooks",
    callback: async (topic, shop, body, webhookId) => {
      const payload = JSON.parse(body)
      console.log("SHOP_REDACT received:", payload)

      const shopDomain = payload.shop_domain

      try {
        const deletedCount = await Slider.destroy({
          where: { shop: shopDomain },
          cascade: true,
        })

        console.log(`Deleted ${deletedCount} sliders for shop ${shopDomain}`)
      } catch (error) {
        console.error("Error redacting shop data:", error)
      }
    },
  },
}
