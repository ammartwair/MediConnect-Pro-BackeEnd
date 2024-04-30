import { roles } from "../../middleware/auth.js";

export const endPoint = {
  getAll: [roles.Admin],
  getOne: [roles.Admin, roles.Patient],
  getAllForPatient: [roles.Admin, roles.Patient],

  create: [roles.Admin],

  updateInvoice: [roles.Admin],
  payInvoice: [roles.Patient],

  deleteInvoice: [roles.Admin],
  deleteAll: [roles.Admin],
  deleteAllforPatient: [roles.Admin],

  printInvoice: [roles.Admin, roles.Patient],
  printAllforPatient: [roles.Admin, roles.Patient],
  printAllInvoices: [roles.Admin],
};
