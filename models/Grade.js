import mongoose from "mongoose";

const GradeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  title: {
    type: String,
    required: true,
  },
  average: {
    type: Number,
    required: true,
  },
  scale: {
    type: Number,
    required: true,
  },
});

const Grade = mongoose.model("Grade", GradeSchema);
export default Grade;
