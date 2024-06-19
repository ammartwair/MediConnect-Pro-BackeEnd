import joi from "joi";
import { Types } from "mongoose";

export const validationObjectId = (value, helper) => {
  if (Types.ObjectId.isValid(value)) {
    return true;
  }
  return helper.message();
};

export const generalFields = {
  id: joi.string().min(24).max(24).custom(validationObjectId),
  userName: joi.string().min(3).max(20),
  email: joi.string().email().min(5).message({
    "string.email": "Please enter a valid email",
    "string.empty": "Email is required",
  }),
  password: joi.string().min(3).message({
    "string.empty": "Password is required",
  }),
  file: joi.object({
    size: joi.number().positive().required(),
    path: joi.string().required(),
    filename: joi.string().required(),
    destination: joi.string().required(),
    mimetype: joi.string().required(),
    encoding: joi.string().required(),
    originalname: joi.string().required(),
    fieldname: joi.string().required(),
  }),
  token: joi.string(),
  gender: joi.string().valid("Male", "Female"),
  address: joi.string().min(3).max(20),
  phoneNumber: joi.string().length(13),
  role: joi.string().valid("Doctor", "Patient"),
};

export const validation = (schema) => {
  return (req, res, next) => {
    if (req.body.specialties) {
      let specialties = JSON.parse(req.body.specialties);
      req.body.specialties = specialties;
    }
    // if (req.body.images) {
    //   let images = JSON.parse(req.body.images);
    //   req.body.images = images;
    // }
    const inputsData = { ...req.body, ...req.params, ...req.query };
    if (req.file || req.files) {
      inputsData.file = req.file || req.files;
    }
    const validationResult = schema.validate(inputsData, { abortEarly: false });
    if (validationResult.error?.details) {
      return res.status(400).json({
        message: "validation error",
        validationError: validationResult.error.details,
      });
    }
    next();
  };
};
