import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import authRoutes from "./routes/auth.js";
import jobRoutes from "./routes/jobs.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;
const mongoUri = process.env.MONGO_URI;

app.use(cors());
app.use(express.json());

app.get("/api/health", async (req, res) => {
  const state = mongoose.connection.readyState;
  const statusMap = {
    0: "disconnected",
    1: "connected",
    2: "connecting",
    3: "disconnecting",
  };
  res.json({ status: "ok", db: statusMap[state] || "unknown" });
});

app.use("/api/auth", authRoutes);
app.use("/api/jobs", jobRoutes);

app.use((err, req, res, next) => {
  const status = err.status || 500;
  res.status(status).json({ message: err.message || "Server error" });
});

if (!mongoUri) {
  console.error("MONGO_URI is missing in .env");
  process.exit(1);
}

mongoose
  .connect(mongoUri)
  .then(() => {
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  })
  .catch((error) => {
    console.error("Mongo connection failed", error);
    process.exit(1);
  });
