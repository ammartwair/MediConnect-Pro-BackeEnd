import { Router } from "express";
import * as AuthController from "./auth.controller.js";
import { asyncHandler } from "../../middleware/errorHandling.js";
import { validation } from "../../middleware/validation.js";
import * as validators from "./auth.validation.js";
import fileUpload, { fileValidation } from "../../services/multer.js";

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

router.post(
  "/login",
  validation(validators.login),
  asyncHandler(AuthController.login)
);

router.get(
  "/confirmEmail/:token/:role",
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
  "/invalidConfirm",
  validation(validators.deleteInvalidConfirm),
  asyncHandler(AuthController.deleteInvalidConfirm)
);
export default router;
