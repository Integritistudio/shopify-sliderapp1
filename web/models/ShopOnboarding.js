import { DataTypes } from "sequelize"
import { sequelize } from "../config/database.js"

const ShopOnboarding = sequelize.define(
  "ShopOnboarding",
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
    createdSlider: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    addedSlide: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    publishedSlider: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    embeddedTheme: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    dismissed: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    tableName: "ShopOnboardings",
    timestamps: true,
  },
)

export default ShopOnboarding
