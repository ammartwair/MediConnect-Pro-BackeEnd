import mongoose, { Schema, model } from "mongoose";

const specialtySchema = new Schema();

const specialtyModel =
  mongoose.models.Specialty || model("Specialty", specialtySchema);

export default specialtyModel;
