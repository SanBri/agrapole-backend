import dotenv from "dotenv";
import express from "express";
import cors from "cors";

dotenv.config();

// Start Express Server
const PORT = process.env.PORT || 5000;
const app = express();
app.listen(PORT, () => {
  console.log(`Express Server started on PORT ${PORT}`);
});

// Init Middleware
app.use(express.json());
app.use(cors());
