import { Router } from "express";
import { asyncHandler } from "../../middleware/errorHandling.js";
import { auth } from "../../middleware/auth.js";
import { validation } from "../../middleware/validation.js";
import { endPoint } from "./review.endPoint.js";
import * as validators from "./review.validation.js";
import * as reviewController from "./review.controller.js";

const router = Router({ mergeParams: true });

// Create a new Review
router.post(
  "/",
  asyncHandler(auth(endPoint.create)),
  validation(validators.create),
  asyncHandler(reviewController.create)
);

export default router;