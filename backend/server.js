import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

import connectDB from "./config/db.js";
import { notFound, errorHandler } from "./middleware/errorMiddleware.js";
import { startReminderScheduler } from "./utils/reminderScheduler.js";

import authRoutes from "./routes/authRoutes.js";
import prescriptionRoutes from "./routes/prescriptionRoutes.js";
import medicineRoutes from "./routes/medicineRoutes.js";
import reminderRoutes from "./routes/reminderRoutes.js";
import wellnessRoutes from "./routes/wellnessRoutes.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

connectDB();

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL || "*", credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/", (req, res) => res.send("MedAI API is running..."));

app.use("/api/auth", authRoutes);
app.use("/api/prescriptions", prescriptionRoutes);
app.use("/api/medicines", medicineRoutes);
app.use("/api/reminders", reminderRoutes);
app.use("/api/wellness", wellnessRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 MedAI server running on port ${PORT}`);
  startReminderScheduler();
});
