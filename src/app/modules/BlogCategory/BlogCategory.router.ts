import { Router } from "express";
import { blogCategoryController } from "./BlogCategory.controller";
import validateRequest from "../../middlewares/validateRequest";
import { ValidationBlogCategory } from "./BlogCategory.validation";
import { USER_ROLE } from "../user/user.constant";
import auth from "../../middlewares/auth";

const router = Router();

// Get all blog categories
router.get('/', blogCategoryController.GetBlogCategories);

// Get single blog category
router.get('/:id', blogCategoryController.GetSingleBlogCategory);

// Create blog category
router.post(
  '/',
  auth(USER_ROLE.superAdmin, USER_ROLE.admin),
  validateRequest(ValidationBlogCategory.blogCategoryValidationPost),
  blogCategoryController.PostBlogCategory
);

// Update blog category
router.patch(
  '/:id',
  auth(USER_ROLE.superAdmin, USER_ROLE.admin),
  validateRequest(ValidationBlogCategory.blogCategoryValidationUpdate),
  blogCategoryController.UpdateBlogCategory
);

// Delete blog category
router.delete(
  '/:id',
  auth(USER_ROLE.superAdmin, USER_ROLE.admin),
  blogCategoryController.DeleteBlogCategory
);

export const BlogCategoryRouter = router;
