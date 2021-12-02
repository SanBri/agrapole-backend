import mongoose from "mongoose";

const HeroSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    default: "hero",
  },
  title: {
    type: String,
    required: true,
  },
  catchphrase: {
    type: String,
    required: true,
  },
  PDF: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
});

const Hero = mongoose.model("Hero", HeroSchema);
export default Hero;
