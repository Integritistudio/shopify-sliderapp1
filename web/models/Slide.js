import { DataTypes } from "sequelize"
import { sequelize } from "../config/database.js"
import Slider from "./Slider.js"

// Define Slide model
const Slide = sequelize.define(
  "Slide",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    imageUrl: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    SliderId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Slider,
        key: "id",
      },
    },
  },
  {
    tableName: "Slides",
    timestamps: true,
  },
)

export default Slide
