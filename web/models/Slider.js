import { DataTypes } from "sequelize"
import { sequelize } from "../config/database.js"

// Define Slider model with shop field
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
    isExpanded: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    shop: {
      type: DataTypes.STRING,
      allowNull: false,
      index: true, // Add index for better query performance
    },
  },
  {
    tableName: "Sliders",
    timestamps: true,
  },
)

export default Slider
