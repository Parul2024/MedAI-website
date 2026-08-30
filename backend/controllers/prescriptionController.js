import asyncHandler from "express-async-handler";
import Prescription from "../models/Prescription.js";
import { extractTextFromImage, parseMedicinesFromText } from "../utils/ocrService.js";

// @route POST /api/prescriptions/upload
export const uploadPrescription = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error("Please upload a prescription image");
  }

const prescription = await Prescription.create({
  user: req.user._id,
  imageUrl: "",
  status: "processing",
});



  try {
    const rawText = await extractTextFromImage(req.file.path);
    const medicines = await parseMedicinesFromText(rawText);

    prescription.rawText = rawText;
    prescription.medicines = medicines;
    prescription.status = "done";
    await prescription.save();
  } catch (err) {
    prescription.status = "failed";
    await prescription.save();
    console.error("OCR processing failed:", err.message);
  }

  res.status(201).json(prescription);
});

// @route GET /api/prescriptions
export const getPrescriptions = asyncHandler(async (req, res) => {
  const prescriptions = await Prescription.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json(prescriptions);
});

// @route GET /api/prescriptions/:id
export const getPrescriptionById = asyncHandler(async (req, res) => {
  const prescription = await Prescription.findOne({ _id: req.params.id, user: req.user._id });
  if (!prescription) {
    res.status(404);
    throw new Error("Prescription not found");
  }
  res.json(prescription);
});

// @route DELETE /api/prescriptions/:id
export const deletePrescription = asyncHandler(async (req, res) => {
  const prescription = await Prescription.findOneAndDelete({ _id: req.params.id, user: req.user._id });
  if (!prescription) {
    res.status(404);
    throw new Error("Prescription not found");
  }
  res.json({ message: "Prescription deleted" });
});
