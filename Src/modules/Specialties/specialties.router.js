import { Router } from "express";
import { asyncHandler } from "../../middleware/errorHandling.js";
import * as specialtiesController from "./specailties.controller.js"

const router = Router();

// Get A Specialty Doctors:
router.get(
  "/:specialtyName/getDoctors",
  asyncHandler(specialtiesController.getDoctors)
);

export default router;
