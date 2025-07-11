import Slider from "./Slider.js"
import Slide from "./Slide.js"

// Define relationships
Slider.hasMany(Slide, {
  foreignKey: "SliderId",
  onDelete: "CASCADE",
  as: "slides",
})

Slide.belongsTo(Slider, {
  foreignKey: "SliderId",
  as: "slider",
})

export { Slider, Slide }
