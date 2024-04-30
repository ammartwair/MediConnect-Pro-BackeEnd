import mongoose, { Schema, model, Types } from "mongoose";

const paymentSchema = new Schema(
  {
    patientId: {
      type: Types.ObjectId,
      ref: "Patient",
      required: true,
    },
    appointmentId: {
      type: Types.ObjectId,
      ref: "Appointment",
      required: true,
    },
    invoiceNumber: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      valid: ["unpaid", "paid", "cancelled", "failed"],
      required: true,
    },
    paymentDate: {
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

const paymentModel = mongoose.model.Payment || model("Payment", paymentSchema);

export default paymentModel;
