import { DataTypes } from "sequelize"
import { sequelize } from "../config/database.js"

/**
 * Shop identity + affiliate attribution.
 * Affiliate lock survives uninstall/reinstall — never clear affiliateCode on APP_UNINSTALLED.
 */
const ShopAffiliate = sequelize.define(
  "ShopAffiliate",
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
    shopifyShopId: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
    },
    shopName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    affiliateCode: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    affiliateLockedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    /** Last known subscription plan id for plan_changed detection */
    lastPlanId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    /** Last known Shopify subscription GID */
    lastSubscriptionId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    tableName: "ShopAffiliates",
    timestamps: true,
  },
)

export default ShopAffiliate
