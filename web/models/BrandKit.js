import { DataTypes } from "sequelize"
import { sequelize } from "../config/database.js"

const BrandKit = sequelize.define(
  "BrandKit",
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
    textColor: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "#ffffff",
    },
    buttonBg: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "#1a2f4a",
    },
    buttonTextColor: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "#ffffff",
    },
    overlayColor: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "#000000",
    },
    overlayOpacity: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0.35,
    },
    borderRadius: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 12,
    },
    fontNote: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: "",
    },
  },
  {
    tableName: "BrandKits",
    timestamps: true,
  },
)

export default BrandKit
