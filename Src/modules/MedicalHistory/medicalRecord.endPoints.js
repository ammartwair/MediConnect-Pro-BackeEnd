import { roles } from "../../middleware/auth.js";

export const endPoint = {
  getMedicalHistoryRecords: [roles.Doctor],
  getMedicalHistoryById: [roles.Doctor, roles.Patient],
  getMedicalHistory: [roles.Doctor, roles.Patient],
  createMedicalRecord: [roles.Doctor],
  updateMedicalRecord: [roles.Doctor],
  deleteMedicalHistoryRecord: [roles.Doctor],
  deleteMedicalHistory: [roles.Doctor],
};
