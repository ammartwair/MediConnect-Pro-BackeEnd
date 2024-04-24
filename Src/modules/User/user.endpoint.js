import { roles } from "../../middleware/auth.js";

export const endPoints = {
  deleteUser: [roles.Admin],
  profilePic: [roles.Doctor, roles.Patient],
  updatePassword: [roles.Doctor, roles.Patient],
  getProfile: [roles.Doctor, roles.Patient],
  upload: [roles.Admin],
};
