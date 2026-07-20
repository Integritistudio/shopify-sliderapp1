import { DataTypes } from "sequelize"
import { sequelize } from "../config/database.js"

const AnalyticsEvent = sequelize.define(
  "AnalyticsEvent",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    shop: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    sliderId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    slideId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    eventType: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    tableName: "AnalyticsEvents",
    timestamps: true,
    updatedAt: false,
  },
)

export default AnalyticsEvent
