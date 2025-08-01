import { DataTypes } from "sequelize"
import { sequelize } from "../config/database.js"

// Define Slider model with shop field
const Slider = sequelize.define(
  "Slider",
   {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      isExpanded: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      collectionId: {
        // New field to store the Shopify collection ID
        type: DataTypes.STRING,
        allowNull: true, // Allow null as not all slider types will have a collection
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
