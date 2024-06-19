import { Router } from "express";
import * as BlogController from "./blog.controller.js";
import { asyncHandler } from "../../middleware/errorHandling.js";
import { validation } from "../../middleware/validation.js";
import * as validators from "./blog.validation.js";
import fileUpload, { fileValidation } from "../../services/multer.js";
import { auth, roles } from "../../middleware/auth.js";
import { endPoints } from "./blog.endPoint.js";

const router = Router();

//Crete Blog:
router.post(
  "/createBlog",
  asyncHandler(auth(endPoints.create)),
  fileUpload(fileValidation.image).array("file", 4),
  validation(validators.createBlog),
  asyncHandler(BlogController.createBlog)
);

//Get Blogs:
router.get(
  "/",
  asyncHandler(auth(Object.values(roles))),
  validation(validators.getBlogs),
  asyncHandler(BlogController.getBlogs)
);

//Get Specific Blog By Name:
router.get(
  "/getBlogByName/:title",
  asyncHandler(auth(Object.values(roles))),
  validation(validators.getBlogByName),
  asyncHandler(BlogController.getBlogByName)
);

//Update Blog:
router.patch(
  "/updateBlog/:blogId",
  asyncHandler(auth(endPoints.update)),
  fileUpload(fileValidation.image).array("images", 4),
  validation(validators.updateBlog),
  asyncHandler(BlogController.updateBlog)
);

//Delete Specific Blog:
router.delete(
  "/deleteBlog/:blogId",
  asyncHandler(auth(endPoints.delete)),
  asyncHandler(BlogController.deleteBlog)
);

//Delete All Blogs:
router.delete(
  "/deleteBlogs",
  asyncHandler(auth(endPoints.delete)),
  asyncHandler(BlogController.deleteBlogs)
);
export default router;
