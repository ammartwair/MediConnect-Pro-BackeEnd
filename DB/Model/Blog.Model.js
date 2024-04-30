import mongoose, { Schema, Types, model } from "mongoose";

const blogSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      unique: true,
      min: 4,
      max: 100,
    },
    slug: {
      type: String,
      required: true,
    },
    blogText: {
      type: String,
      required: true,
      min: 5,
      max: 5000000000,
    },
    images: [
      {
        type: Object,
        required: true,
      },
    ],
    createdBy: { type: Types.ObjectId, ref: "Doctor", required: true },
    updatedBy: { type: Types.ObjectId, ref: "Doctor", required: true },
  },
  {
    timestamps: true,
  }
);

const blogModel = mongoose.model.Blog || model("Blog", blogSchema);

export default blogModel;
