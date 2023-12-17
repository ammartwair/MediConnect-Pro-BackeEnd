import mongoose, { Schema, Types, model } from "mongoose";

const appointmentSchema = new Schema(
  {
    date: { type: Date, required: true },
    doctor: { type: Types.ObjectId, ref: "Doctor" },
  },
  {
    timestamps: true,
  }
);

const appointmentModel =
  mongoose.models.Appointment || model("Appointment", appointmentSchema);

export default appointmentModel;
