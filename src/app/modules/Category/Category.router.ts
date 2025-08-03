import { Router } from "express";
import { categoryController } from "./Category.controller";
import validateRequest from "../../middlewares/validateRequest";
import { ValidationCategory } from "./Category.validation";
import { USER_ROLE } from "../user/user.constant";
import auth from "../../middlewares/auth";

const router = Router();

// Get all categories
router.get('/', categoryController.GetCategories);

// Get single category
router.get('/:id', categoryController.GetSingleCategory);

// Create category
router.post(
  '/',
  auth(USER_ROLE.superAdmin, USER_ROLE.admin),
  validateRequest(ValidationCategory.categoryValidationPost),
  categoryController.PostCategory
);

// Update category
router.patch(
  '/:id',
  auth(USER_ROLE.superAdmin, USER_ROLE.admin),
  validateRequest(ValidationCategory.categoryValidationUpdate),
  categoryController.UpdateCategory
);

// Delete category
router.delete(
  '/:id',
  auth(USER_ROLE.superAdmin, USER_ROLE.admin),
  categoryController.DeleteCategory
);

export const CategoryRouter = router; 