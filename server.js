import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";
import cors from "cors";

import usersRoute from "./routes/api/users.js";
import authRoute from "./routes/api/auth.js";
import pdfCardsRoute from "./routes/api/pdfCards.js";
import pdfFilesRoute from "./routes/api/pdfFiles.js";
import heroRoute from "./routes/api/hero.js";
import partnersRoute from "./routes/api/partners.js";
import gradeRoute from "./routes/api/grade.js";

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
app.use("/api/pdfFiles", pdfFilesRoute);
app.use("/api/hero", heroRoute);
app.use("/api/partners", partnersRoute);
app.use("/api/grade", gradeRoute);
