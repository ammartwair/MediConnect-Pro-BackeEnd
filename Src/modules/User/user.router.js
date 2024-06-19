import { Router } from "express";
import * as userController from "./user.controller.js";
import { auth, roles } from "../../middleware/auth.js";
import { asyncHandler } from "../../middleware/errorHandling.js";
import fileUpload, { fileValidation } from "../../services/multer.js";
import * as validators from "./user.validation.js";
import { validation } from "../../middleware/validation.js";
import { endPoints } from "./user.endpoint.js";

const router = Router();


// Accept Doctors:
router.patch(
  "/acceptDoctors",
  asyncHandler(auth(endPoints.acceptDoctors)),
  asyncHandler(userController.acceptDoctors)
);

// Get Doctors:
router.get(
  "/doctors",
  // asyncHandler(auth(Object.values(roles))),
  asyncHandler(userController.getDoctors)
);

// Get Patients:
router.get(
  "/patients",
  asyncHandler(auth(Object.values(roles))),
  asyncHandler(userController.getPatients)
);

// Get UnAccepted Doctors:
router.get(
  "/doctorsUnAccepted",
  asyncHandler(auth(endPoints.getUnAccepted)),
  asyncHandler(userController.doctorsUnAccepted)
);

// Get Accepted Doctors:
router.get(
  "/doctorsAccepted",
  // asyncHandler(auth(endPoints.getAccepted)),
  asyncHandler(userController.doctorsAccepted)
); 

//Make a user as an admin
router.post(
  "/userAdmin",
  asyncHandler(auth(endPoints.userAdmin)),
  asyncHandler(userController.userAdmin)
);


// Get User:
router.get(
  "/:id",
  asyncHandler(userController.getUser)
);

//Delete User:
router.delete(
  "/delete/:role/:user_id",
  asyncHandler(auth(endPoints.deleteUser)),
  asyncHandler(userController.deleteUser)
);

// Update User Profile Picture:
router.patch(
  "/profilePic",
  asyncHandler(auth(endPoints.profilePic)),
  fileUpload(fileValidation.image).single("image"),
  validation(validators.profilePic),
  asyncHandler(userController.profilePic)
);

///Update Password:
router.patch(
  "/updatePassword",
  asyncHandler(auth(endPoints.updatePassword)),
  validation(validators.updatePassword),
  asyncHandler(userController.updatePassword)
);

//Share Profile:
router.get(
  "/profile",
  asyncHandler(auth(endPoints.getProfile)),
  asyncHandler(userController.getProfile)
);

// create pdf file with patients information
router.get("/getUsers", asyncHandler(userController.getUsers));

export default router;
