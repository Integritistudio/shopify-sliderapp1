import Slider from "./Slider.js"
import Slide from "./Slide.js"
import BrandKit from "./BrandKit.js"
import ShopOnboarding from "./ShopOnboarding.js"
import AnalyticsEvent from "./AnalyticsEvent.js"
import ShopPlan from "./ShopPlan.js"

Slider.hasMany(Slide, {
  foreignKey: "SliderId",
  onDelete: "CASCADE",
  as: "slides",
})

Slide.belongsTo(Slider, {
  foreignKey: "SliderId",
  as: "slider",
})

export { Slider, Slide, BrandKit, ShopOnboarding, AnalyticsEvent, ShopPlan }
