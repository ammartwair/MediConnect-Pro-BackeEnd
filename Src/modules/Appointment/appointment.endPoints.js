import { roles } from "../../middleware/auth.js";

export const endPoints = {
  getPatientAppointments: [roles.Patient],
  getAppointments:[roles.Admin],
  getDoctorAppointments: [roles.Doctor],
  getAppointmentDetails: [roles.Doctor, roles.Patient , roles.Admin],

  book: [roles.Patient],
  cancel: [roles.Patient],
  update: [roles.Patient],

  changeAppointmentStatus: [roles.Admin, roles.Doctor],
};
