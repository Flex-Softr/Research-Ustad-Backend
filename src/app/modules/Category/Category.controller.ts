import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { categoryService } from './Category.service';

// Get all categories
const GetCategories = catchAsync(async (req, res) => {
  const result = await categoryService.GetCategories();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Categories retrieved successfully',
    data: result,
  });
});

// Get single category
const GetSingleCategory = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await categoryService.GetSingleCategory(id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Category retrieved successfully',
    data: result,
  });
});

// Create category
const PostCategory = catchAsync(async (req, res) => {
  const body = req.body;
  const result = await categoryService.PostCategory(body);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Category created successfully',
    data: result,
  });
});

// Update category
const UpdateCategory = catchAsync(async (req, res) => {
  const body = req.body;
  const { id } = req.params;
  const result = await categoryService.UpdateCategory(id, body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Category updated successfully',
    data: result,
  });
});

// Delete category
const DeleteCategory = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await categoryService.DeleteCategory(id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Category deleted successfully',
    data: result,
  });
});

// Get category statistics
const GetCategoryStats = catchAsync(async (req, res) => {
  const result = await categoryService.GetCategoryStats();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Category statistics retrieved successfully',
    data: result,
  });
});

export const categoryController = {
  GetCategories,
  GetSingleCategory,
  PostCategory,
  UpdateCategory,
  DeleteCategory,
  GetCategoryStats,
}; 