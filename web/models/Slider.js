import { DataTypes } from "sequelize"
import { sequelize } from "../config/database.js"
import { settingsFromPreset } from "../utils/sliderDefaults.js"

const Slider = sequelize.define(
  "Slider",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    sliderType: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "center",
    },
    settings: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: settingsFromPreset("center"),
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "published",
    },
    sortOrder: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    isExpanded: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    shop: {
      type: DataTypes.STRING,
      allowNull: false,
      index: true,
    },
  },
  {
    tableName: "Sliders",
    timestamps: true,
  },
)

export default Slider
