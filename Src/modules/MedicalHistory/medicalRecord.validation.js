import joi from "joi";
import { generalFields } from "../../middleware/validation.js";

export const getMedicalHistoryRecords = joi.object({
  page: joi.number().min(1),
  limit: joi.number().min(1).max(10),
  sort: joi.string().valid("DiagnosisDate", "createdBy"),
  search: joi.string(),
  select: joi
    .string()
    .valid(
      "patientId",
      "diagnoses",
      "treatments",
      "medications",
      "allergies",
      "labReport",
      "DiagnosisDate",
      "createdBy"
    ),
});

export const getMedicalHistoryById = joi.object({
  medicalHistoryId: generalFields.id.required(),
});

export const getMedicalHistory = joi.object({
  patientId: generalFields.id.required(),
  page: joi.number().min(1),
  limit: joi.number().min(1).max(10),
});

export const createMedicalRecord = joi.object({
  patientId: generalFields.id.required(),
  diagnoses: joi.array().items(joi.string()).required().min(1),
  treatments: joi.array().items(joi.string()),
  medications: joi.array().items(joi.string()),
  allergies: joi.array().items(joi.string()),
  labResult: joi.array().items(joi.string()),
});

export const updateMedicalRecord = joi.object({
  medicalHistoryId: generalFields.id.required(),
  diagnoses: joi.array().items(joi.string()),
  treatments: joi.array().items(joi.string()),
  medications: joi.array().items(joi.string()),
  allergies: joi.array().items(joi.string()),
  labResult: joi.array().items(joi.string()),
});

export const deleteMedicalHistoryRecord = joi.object({
  medicalHistoryId: generalFields.id.required(),
});

export const deleteMedicalHistory = joi.object({
  patientId: generalFields.id.required(),
});
