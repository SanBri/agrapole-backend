import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";
import cors from "cors";

dotenv.config();

// Start Express Server
const PORT = process.env.PORT || 5000;
const app = express();
app.listen(PORT, () => {
  console.log(`Express server started on PORT ${PORT}`);
});

// Connect Database
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB);
    console.log("DATABASE CONNECTED");
  } catch (err) {
    console.log(err.message);
    process.exit(1);
  }
};
connectDB();

// Init Middleware
app.use(express.json());
app.use(cors());
