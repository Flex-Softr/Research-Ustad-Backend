import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { courseService } from './Course.service';

// get all courses
const GetCourse = catchAsync(async (req, res) => {
  const result = await courseService.GetCourse();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Course is retrieved successfully',
    data: result,
  });
});

// get single course
const GetSingleCourse = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await courseService.GetSingleCourse(id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Course is retrieved successfully',
    data: result,
  });
});

//   Post Courses
const PostCourse = catchAsync(async (req, res) => {
  const body = req.body;
  const files = req.files as any;
  const result = await courseService.PostCourse(body, files);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Course is created successfully',
    data: result,
  });
});

// update courses
const UpdateCourse = catchAsync(async (req, res) => {
  const body = req.body;
  const { id } = req.params;
  const files = req.files as any;
  const result = await courseService.UpdateCourse(id, body, files);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Course is updated successfully',
    data: result,
  });
});

// delete courses
const DeletedCourse = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await courseService.DeletedCourse(id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Course is deleted successfully',
    data: result,
  });
});

export const courseController = {
  GetCourse,
  GetSingleCourse,
  PostCourse,
  UpdateCourse,
  DeletedCourse,
};
