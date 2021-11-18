import mongoose from "mongoose";

const PartnerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  logo: {
    type: String,
  },
  url: {
    type: String,
  },
});

const Partner = mongoose.model("Partner", PartnerSchema);
export default Partner;
