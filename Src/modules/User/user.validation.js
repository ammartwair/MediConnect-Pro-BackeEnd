import { generalFields } from "../../middleware/validation.js";
import joi from "joi";

export const profilePic = joi.object({
  file: generalFields.file.required(),
});

export const updatePassword = joi.object({
  oldPassword: generalFields.password,
  newPassword: generalFields.password.invalid(joi.ref("oldPassword")),
  cPassword: generalFields.password.valid(joi.ref("newPassword")),
});

export const uploadPatientExcel = joi.object({
  file: generalFields.file.required(),
});