import mongoose from "mongoose";

const PDFCardSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  PDF: {
    type: String,
    required: true,
  },
  block: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

const PDFCard = mongoose.model("PDFCard", PDFCardSchema);

export default PDFCard;
