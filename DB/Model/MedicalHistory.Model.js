import mongoose, { Schema, model } from "mongoose";

const medicalHistorySchema = new Schema();

const medicalHistoryModel =
  mongoose.models.MedicalHistory ||
  model("MedicalHistory", medicalHistorySchema);

export default medicalHistoryModel;
