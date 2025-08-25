import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { blogCategoryService } from './BlogCategory.service';

// Get all blog categories
const GetBlogCategories = catchAsync(async (req, res) => {
  const result = await blogCategoryService.GetBlogCategories();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Blog categories retrieved successfully',
    data: result,
  });
});

// Get single blog category
const GetSingleBlogCategory = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await blogCategoryService.GetSingleBlogCategory(id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Blog category retrieved successfully',
    data: result,
  });
});

// Create blog category
const PostBlogCategory = catchAsync(async (req, res) => {
  const body = req.body;
  const result = await blogCategoryService.PostBlogCategory(body);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Blog category created successfully',
    data: result,
  });
});

// Update blog category
const UpdateBlogCategory = catchAsync(async (req, res) => {
  const body = req.body;
  const { id } = req.params;
  const result = await blogCategoryService.UpdateBlogCategory(id, body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Blog category updated successfully',
    data: result,
  });
});

// Delete blog category
const DeleteBlogCategory = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await blogCategoryService.DeleteBlogCategory(id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Blog category deleted successfully',
    data: result,
  });
});

export const blogCategoryController = {
  GetBlogCategories,
  GetSingleBlogCategory,
  PostBlogCategory,
  UpdateBlogCategory,
  DeleteBlogCategory,
};
