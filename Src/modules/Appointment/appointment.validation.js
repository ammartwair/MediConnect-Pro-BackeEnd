import joi from "joi";
import { generalFields } from "../../middleware/validation.js";

export const bookAppointment = joi.object({
  doctorId: generalFields.id.required(),
  date: joi.date().required(),
  startTime: joi.date().iso().required(),
  endTime: joi.date().iso().min(joi.ref("startTime")).required(),
  reasonForVisit: joi.string().min(3).max(100).required(),
  notes: joi.string(),
});

export const updateAppointment = joi.object({
  appointmentId: generalFields.id.required(),
  doctorId: generalFields.id.required(),
  date: joi.date().required(),
  startTime: joi.date().iso().required(),
  endTime: joi.date().iso().min(joi.ref("startTime")).required(),
  reasonForVisit: joi.string().min(3).max(100),
  notes: joi.string(),
});

export const getPatientAppointments = joi.object({
  page: joi.number().min(1),
  limit: joi.number().min(1).max(10),
});

export const getDoctorAppointments = joi.object({
  page: joi.number().min(1),
  limit: joi.number().min(1).max(10),
});

export const getAppointments = joi.object({
  page: joi.number().min(1),
  limit: joi.number().min(1).max(10),
  role: joi.string().valid("Doctor", "Patient").required(),
  id: generalFields.id.required(),
});

export const cancelAppointment = joi.object({
  appointmentId: generalFields.id.required(),
});

export const changeAppointmentStatus = joi.object({
  appointmentId: generalFields.id.required(),
  status: joi.string().valid("confirmed", "completed", "cancelled", "completed and reviewed").required(),
});