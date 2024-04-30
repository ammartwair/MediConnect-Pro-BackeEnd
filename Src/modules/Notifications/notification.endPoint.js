import { roles } from "../../middleware/auth.js";

export const endPoints = {
  getNotification: [roles.Admin, roles.Patient],
  getAllNotifications: [roles.Admin, roles.Patient],

  create: [roles.Admin],

  markAsRead: [roles.Patient],
  markAllAsRead: [roles.Patient],

  deleteNotification: [roles.Admin, roles.Patient],
  deleteAllNotifications: [roles.Admin, roles.Patient],
};
