import mongoose, { Schema, Types, model } from "mongoose";

const patientSchema = new Schema(
  {
    userName: {
      type: String,
      required: true,
      min: 3,
      max: 20,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    confirmEmail: {
      type: Boolean,
      required: true,
      default: false,
    },
    password: {
      type: String,
      min: 7,
      max: 20,
      required: true,
    },
    image: {
      type: Object,
      required: true,
    },
    address: {
      type: String,
      min: 3,
      max: 20,
      required: true,
    },
    phoneNumber: {
      type: String,
      length: 13,
      required: true,
    },
    gender: {
      type: String,
      required: true,
      enum: ["Male", "Female"],
    },
    role: {
      type: String,
      required: true,
      enum: ["Patient"],
    },
    medicalHistoryId: {
      type: Types.ObjectId,
      ref: "MedicalHistory",
    },
    currentAppointments: [
      {
        type: Types.ObjectId,
        ref: "Appointment",
      },
    ],
    sendCode: {
      type: String,
      length: 4,
      default: null,
    },
    changePasswordTime: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

const patientModel = mongoose.models.Patient || model("Patient", patientSchema);

export default patientModel;
