import joi from "joi";
import { generalFields } from "../../middleware/validation.js";

export const create = joi.object({
  appointmentId: generalFields.id.required(),
  comment: joi.string().required(),
  rating: joi.number().min(1).max(5).required(),
});
