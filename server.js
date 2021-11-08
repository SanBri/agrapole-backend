import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";
import cors from "cors";

import usersRoute from "./routes/api/users.js";
import authRoute from "./routes/api/auth.js";
import pdfCardsRoute from "./routes/api/pdfCards.js";

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

// Define Routes
app.use("/api/users", usersRoute);
app.use("/api/auth", authRoute);
app.use("/api/pdfCards", pdfCardsRoute);
