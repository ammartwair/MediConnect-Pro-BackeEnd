import mongoose, { Schema, Types, model } from "mongoose";

// Appointment Reminder
const notificationSchema = new Schema(
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
    message: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["unread", "read"],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const notificationModel =
  mongoose.model.Notification || model("Notification", notificationSchema);

export default notificationModel;
