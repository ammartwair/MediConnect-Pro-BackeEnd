import { Router } from "express";
import * as medicalRecordController from "./medicalRecord.controller.js";
import * as validators from "./medicalRecord.validation.js";
import { endPoint } from "./medicalRecord.endPoints.js";
import { validation } from "../../middleware/validation.js";
import { asyncHandler } from "../../middleware/errorHandling.js";
import { auth } from "../../middleware/auth.js";

const router = new Router();

// Get All Medical Record for All Patients
router.get(
  "/getMedicalHistoryRecords",
  asyncHandler(auth(endPoint.getMedicalHistoryRecords)),
  validation(validators.getMedicalHistoryRecords),
  asyncHandler(medicalRecordController.getMedicalHistoryRecords)
);

// Get Medical History Record by ID
router.get(
  "/getRecordById/:medicalHistoryId",
  asyncHandler(auth(endPoint.getMedicalHistoryById)),
  validation(validators.getMedicalHistoryById),
  asyncHandler(medicalRecordController.getMedicalHistoryById)
);

// Get Medical History Record by patientId
router.get(
  "/getPatientRecords/:patientId",
  asyncHandler(auth(endPoint.getMedicalHistory)),
  validation(validators.getMedicalHistory),
  asyncHandler(medicalRecordController.getMedicalHistory)
);

// create a new patient medical history record
router.post(
  "/:patientId",
  asyncHandler(auth(endPoint.createMedicalRecord)),
  validation(validators.createMedicalRecord),
  asyncHandler(medicalRecordController.createMedicalRecord)
);

// update patient Medical Record
router.patch(
  "/:medicalHistoryId",
  asyncHandler(auth(endPoint.updateMedicalRecord)),
  validation(validators.updateMedicalRecord),
  asyncHandler(medicalRecordController.updateMedicalRecord)
);

// Delete a specific medical history record by its ID
router.delete(
  "/deleteRecord/:medicalHistoryId",
  asyncHandler(auth(endPoint.deleteMedicalHistoryRecord)),
  validation(validators.deleteMedicalHistoryRecord),
  asyncHandler(medicalRecordController.deleteMedicalHistoryRecord)
);

// Delete all medical history records for a patient
router.delete(
  "/deletePatientRecords/:patientId",
  asyncHandler(auth(endPoint.deleteMedicalHistory)),
  validation(validators.deleteMedicalHistory),
  asyncHandler(medicalRecordController.deleteMedicalHistory)
);

export default router;
