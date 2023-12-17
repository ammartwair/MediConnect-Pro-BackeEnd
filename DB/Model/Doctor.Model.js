import mongoose, { Schema, Types, model } from "mongoose";

const doctorSchema = new Schema(
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
    licenseNumber: {
      type: String,
    },
    yearsOfExperience: {
      type: Number,
    },
    consultationFees: {
      type: Number,
    },
    bio: {
      type: String,
      min: 10,
      max: 15000,
    },
    patientList: [
      {
        type: Types.ObjectId,
        ref: "patientModel",
      },
    ],
    specialty: {
      type: Types.ObjectId,
      ref: "specialtyModel",
    },
    role: {
      type: String,
      required: true,
      enum: ["Doctor"],
    },
    sendCode: {
      type: String,
      length: 4,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const doctorModel = mongoose.models.Doctor || model("Doctor", doctorSchema);

export default doctorModel;
