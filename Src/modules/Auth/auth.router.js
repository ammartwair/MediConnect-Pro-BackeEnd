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

router.post(
  "/login",
  validation(validators.login),
  asyncHandler(AuthController.login)
);

router.get(
  "/confirmEmail/:role/:token",
  validation(validators.confirmEmail),
  asyncHandler(AuthController.confirmEmail)
);

router.patch(
  "/sendCode",
  validation(validators.sendCode),
  asyncHandler(AuthController.sendCode)
);

router.post(
  "/forgotPassword",
  validation(validators.forgotPassword),
  asyncHandler(AuthController.forgotPassword)
);

router.delete(
  "/invalidConfirmDoctor",
  asyncHandler(AuthController.deleteInvalidConfirmDoctors)
);

router.delete(
  "/invalidConfirmPatient",
  asyncHandler(AuthController.deleteInvalidConfirmPatients)
);
export default router;
