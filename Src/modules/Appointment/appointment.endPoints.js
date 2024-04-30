import { roles } from "../../middleware/auth.js";

export const endPoints = {
  getPatientAppointments: [roles.Patient],
  getDoctorAppointments: [roles.Doctor],
  getAppointmentDetails: [roles.Doctor, roles.Patient],

  book: [roles.Patient],
  cancel: [roles.Patient],
  update: [roles.Patient],

  changeAppointmentStatus: [roles.Admin],
  changePaymentStatus: [roles.Admin],

  getAppointmentReview: [roles.Admin, roles.Doctor],
};
