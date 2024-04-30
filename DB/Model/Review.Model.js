import mongoose, { Schema, Types, model } from "mongoose";

const reviewSchema = new Schema(
  {
    appointmentId: {
      type: Types.ObjectId,
      ref: "Appointment",
      required: true,
    },
    comment: {
      type: String,
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    createdBy: {
      type: Types.ObjectId,
      ref: "Patient",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const reviewModel = mongoose.models.Review || model("Review", reviewSchema);

export default reviewModel;
