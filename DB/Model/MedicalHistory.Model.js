import mongoose, { Schema, Types, model } from "mongoose";

const medicalHistorySchema = new Schema(
  {
    patientId: {
      type: Types.ObjectId,
      ref: "Patient",
      required: true,
    },
    diagnoses: [
      // تشخيصات
      {
        type: String,
        required: true,
      },
    ],
    treatments: [
      // علاجات
      {
        type: String,
      },
    ],
    medications: [
      // أدوية
      {
        type: String,
      },
    ],
    allergies: [
      // حساسبة
      {
        type: String,
      },
    ],
    labResult: [
      // نتائج المختبر
      {
        type: String,
      },
    ],
    DiagnosisDate: {
      // تاريخ التشخيص
      type: Date,
      required: true,
    },
    createdBy: {
      type: Types.ObjectId,
      ref: "Doctor",
      required: true,
    },
    updatedBy: {
      type: Types.ObjectId,
      ref: "Doctor",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const medicalHistoryModel =
  mongoose.models.MedicalHistory ||
  model("MedicalHistory", medicalHistorySchema);

export default medicalHistoryModel;
