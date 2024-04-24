import { Router } from "express";
import { auth, roles } from "../../middleware/auth.js";
import { asyncHandler } from "../../middleware/errorHandling.js";
import * as appointmentController from "./appointment.controller.js";
import { validation } from "../../middleware/validation.js";
import * as validators from "./appointment.validation.js";
import { endPoints } from "./appointment.endPoints.js";
const router = Router();

// Book Appointment
router.post(
  "/bookAppointment",
  asyncHandler(auth(endPoints.book)),
  validation(validators.bookAppointment),
  asyncHandler(appointmentController.bookAppointment)
);

// Get Patient Appointments
router.get(
  "/getPatientAppointments",
  asyncHandler(auth(endPoints.getPatientAppointments)),
  asyncHandler(appointmentController.getPatientAppointments)
);

// Get Doctor Appointments
router.get(
  "/getDoctorAppointments",
  asyncHandler(auth(endPoints.getDoctorAppointments)),
  asyncHandler(appointmentController.getDoctorAppointments)
);

// Get Appointment Details
router.get(
  "/getAppointmentDetails/:id",
  asyncHandler(auth(endPoints.getAppointmentDetails)),
  asyncHandler(appointmentController.getAppointmentDetails)
);

// Cancel Appointment
router.delete(
  "/cancelAppointment/:appointmentId",
  asyncHandler(auth(endPoints.cancel)),
  validation(validators.cancelAppointment),
  asyncHandler(appointmentController.cancelAppointment)
);

// Update Appointment
router.patch(
  "/updateAppointment/:appointmentId",
  asyncHandler(auth(endPoints.update)),
  validation(validators.updateAppointment),
  asyncHandler(appointmentController.updateAppointment)
);

// Change Appointment Status
router.patch(
  "/changeAppointmentStatus/:appointmentId",
  asyncHandler(auth(endPoints.changeAppointmentStatus)),
  validation(validators.changeAppointmentStatus),
  asyncHandler(appointmentController.changeAppointmentStatus)
);

// Change Appointment Payment Status
router.patch(
  "/changePaymentStatus/:appointmentId",
  asyncHandler(auth(endPoints.changePaymentStatus)),
  validation(validators.changePaymentStatus),
  asyncHandler(appointmentController.changePaymentStatus)
);


export default router;