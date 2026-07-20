import { DataTypes } from "sequelize"
import { sequelize } from "../config/database.js"
import Slider from "./Slider.js"

const Slide = sequelize.define(
  "Slide",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    imageUrl: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: "",
    },
    heading: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: "",
    },
    subheading: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: "",
    },
    ctaText: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: "",
    },
    ctaUrl: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: "",
    },
    ctaStyle: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "primary",
    },
    ctaResourceType: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    ctaResourceId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    ctaOpenInNewTab: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    mediaType: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "image",
    },
    videoUrl: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: "",
    },
    videoProvider: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    textAlign: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "center",
    },
    overlayColor: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "#000000",
    },
    overlayOpacity: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0.3,
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
    imageAlt: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: "",
    },
    shopifyFileId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    position: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    isVisible: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
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
