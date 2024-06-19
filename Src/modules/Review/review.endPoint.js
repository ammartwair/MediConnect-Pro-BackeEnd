import { roles } from "../../middleware/auth.js";

export const endPoint = {
  create: roles.Patient,
  getAppointmentReview: [roles.Admin, roles.Doctor],

};
