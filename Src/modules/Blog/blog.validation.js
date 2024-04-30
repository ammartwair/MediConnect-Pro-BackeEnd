import joi from "joi";
import { generalFields } from "../../middleware/validation.js";

export const createBlog = joi.object({
  title: joi.string().min(4).max(100).required(),
  blogText: joi.string().min(5).max(5000000000).required(),
  file: joi.array().items(generalFields.file),
});

export const getBlogs = joi.object({
  page: joi.number().min(1),
  limit: joi.number().min(1).max(10),
});

export const getBlogByName = joi.object({
  title: joi.string().min(4).max(100).required(),
});

export const updateBlog = joi.object({
  blogId: generalFields.id.required(),
  title: joi.string().min(4).max(100),
  blogText: joi.string().min(5).max(5000000000),
  file: joi.array().items(generalFields.file),
});
