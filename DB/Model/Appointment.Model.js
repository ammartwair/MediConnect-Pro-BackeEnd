import mongoose, { Schema, Types, model } from "mongoose";

const appointmentSchema = new Schema(
  {
    date: {
      type: Date,
      required: true,
    },
    doctorId: {
      type: Types.ObjectId,
      ref: "Doctor",
    },
    patientId: {
      type: Types.ObjectId,
      ref: "Patient",
    },
    startTime: {
      type: Date,
      required: true,
    },
    endTime: {
      type: Date,
      required: true,
    },
    duration: {
      type: Number,
    },
    reasonForVisit: {
      type: String,
      min: 3,
      max: 100,
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: ["pending", "confirmed", "complete", "cancelled"],
    },
    notes: {
      type: String,
    },
    paymentStatus: {
      type: String,
      required: true,
      enum: ["paid", "pending", "failed", "cancelled"],
    },
    createdBy: {
      type: Types.ObjectId,
      ref: "Patient",
    },
    updateBy: {
      type: Types.ObjectId,
      ref: "Patient",
    },
  },
  {
    timestamps: true,
  }
);

const appointmentModel =
  mongoose.models.Appointment || model("Appointment", appointmentSchema);

export default appointmentModel;
