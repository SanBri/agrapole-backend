import mongoose from "mongoose";

const FooterSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    default: "footer",
  },
  mail: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
});

const Footer = mongoose.model("Footer", FooterSchema);
export default Footer;
