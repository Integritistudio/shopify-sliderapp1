import { DataTypes } from "sequelize"
import { sequelize } from "../config/database.js"

/**
 * Cached Managed Pricing plan for storefront enforcement (no Admin session on CDN).
 * Updated whenever the merchant opens the app billing endpoint.
 */
const ShopPlan = sequelize.define(
  "ShopPlan",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    shop: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    planId: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "free",
    },
    placementAnyPage: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    tableName: "ShopPlans",
    timestamps: true,
  },
)

export default ShopPlan
