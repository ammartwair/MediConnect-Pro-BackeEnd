import { Router } from "express";
import * as notificationController from "./notification.controller.js";
import * as validators from "./notification.validation.js";
import { endPoints } from "./notification.endPoint.js";
import { asyncHandler } from "../../middleware/errorHandling.js";
import { auth } from "../../middleware/auth.js";
import { validation } from "../../middleware/validation.js";

const router = new Router();

// Get a notification
router.get(
  "/getNotification/:notificationId",
  asyncHandler(auth(endPoints.getNotification)),
  validation(validators.getNotification),
  asyncHandler(notificationController.getNotification)
);

// Get all notifications for a patient
router.get(
  "/getAllNotifications/:patientId",
  asyncHandler(auth(endPoints.getAllNotifications)),
  validation(validators.getAllNotifications),
  asyncHandler(notificationController.getAllNotifications)
);

// Craete a new notification
router.post(
  "/createNotification/:patientId",
  asyncHandler(auth(endPoints.create)),
  validation(validators.create),
  asyncHandler(notificationController.createNotification)
);

// Mark a notification as read
router.get(
  "/markAsRead/:notificationId",
  asyncHandler(auth(endPoints.markAsRead)),
  validation(validators.markAsRead),
  asyncHandler(notificationController.markAsRead)
);

// Mark all notifications for a patient as read
router.get(
  "/markAllAsRead/:patientId",
  asyncHandler(auth(endPoints.markAllAsRead)),
  validation(validators.markAllAsRead),
  asyncHandler(notificationController.markAllAsRead)
);

// Delete a notification
router.delete(
  "/deleteNotification/:notificationId",
  asyncHandler(auth(endPoints.deleteNotification)),
  validation(validators.deleteNotification),
  asyncHandler(notificationController.deleteNotification)
);

// Delete a Patient notifications
router.delete(
  "/deleteAllNotifications/:patientId",
  asyncHandler(auth(endPoints.deleteAllNotifications)),
  validation(validators.deleteAllNotifications),
  asyncHandler(notificationController.deleteAllNotifications)
);
export default router;
