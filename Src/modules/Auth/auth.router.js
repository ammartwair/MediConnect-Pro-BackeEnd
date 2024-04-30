import { Router } from "express";
import * as AuthController from "./auth.controller.js";
import { asyncHandler } from "../../middleware/errorHandling.js";
import { validation } from "../../middleware/validation.js";
import * as validators from "./auth.validation.js";
import fileUpload, { fileValidation } from "../../services/multer.js";
import { auth, roles } from "../../middleware/auth.js";

const router = Router();

// Doctor Signup:
router.post(
  "/doctorSignup",
  fileUpload(fileValidation.image).single("image"),
  validation(validators.doctorSignup),
  asyncHandler(AuthController.signup)
);

// Patient Signup:
router.post(
  "/signup",
  fileUpload(fileValidation.image).single("image"),
  validation(validators.signup),
  asyncHandler(AuthController.signup)
);

// Adding Doctor Working Hours:
router.post(
  "/addWorkingHours",
  asyncHandler(auth(roles.Doctor)),
  validation(validators.addWorkingHours),
  asyncHandler(AuthController.addWorkingHours)
);

// Log in
router.post(
  "/login",
  validation(validators.login),
  asyncHandler(AuthController.login)
);

// Confirm Email
router.get(
  "/confirmEmail/:role/:token",
  validation(validators.confirmEmail),
  asyncHandler(AuthController.confirmEmail)
);

// Send Code
router.patch(
  "/sendCode",
  validation(validators.sendCode),
  asyncHandler(AuthController.sendCode)
);

// Forgot Password
router.post(
  "/forgotPassword",
  validation(validators.forgotPassword),
  asyncHandler(AuthController.forgotPassword)
);

// Delete Invalid Confrim Email for Doctors
router.delete(
  "/invalidConfirmDoctor",
  asyncHandler(auth(roles.Admin)),
  asyncHandler(AuthController.deleteInvalidConfirmDoctors)
);

// Delete Invalid Confrim Email for Patients
router.delete(
  "/invalidConfirmPatient",
  asyncHandler(auth(roles.Admin)),
  asyncHandler(AuthController.deleteInvalidConfirmPatients)
);
export default router;
