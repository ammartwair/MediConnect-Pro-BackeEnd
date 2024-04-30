import { roles } from "../../middleware/auth.js";

export const endPoints = {
  create: [roles.Doctor],
  update: [roles.Doctor],
  delete: [roles.Admin],
};
