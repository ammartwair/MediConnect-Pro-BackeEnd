import joi from "joi";
import { generalFields } from "../../middleware/validation.js";

export const getNotification = joi.object({
  notificationId: generalFields.id.required(),
});

export const getAllNotifications = joi.object({
  patientId: generalFields.id.required(),
  page: joi.number().min(1),
  limit: joi.number().min(1),
});

export const create = joi.object({
  patientId: generalFields.id.required(),
});

export const markAsRead = joi.object({
  notificationId: generalFields.id.required(),
});

export const markAllAsRead = joi.object({
  patientId: generalFields.id.required(),
});

export const deleteNotification = joi.object({
  notificationId: generalFields.id.required(),
});

export const deleteAllNotifications = joi.object({
  patientId: generalFields.id.required(),
});
