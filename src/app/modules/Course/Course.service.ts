import { Icourse } from './Course.Interface';
import { courseModel } from './Course.model';
import { categoryModel } from '../Category/Category.model';
import { io } from '../../utils/socket'; // Socket emitter
import AppError from '../../errors/AppError';
import config from '../../config';
import { Types } from 'mongoose';

// Type for multer files
interface MulterFiles {
  [fieldname: string]: Array<{
    filename: string;
    path: string;
    mimetype: string;
  }>;
}

const GetCourse = async () => {
  const result = await courseModel
    .find()
    .populate('category', 'name description')
    .sort({ createdAt: -1 });
  return result;
};

const GetSingleCourse = async (id: string) => {
  const result = await courseModel
    .findById(id)
    .populate('category', 'name description');
  if (!result) {
    throw new AppError(404, 'Course not found');
  }
  return result;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const PostCourse = async (body: Icourse, files: MulterFiles) => {
  // Handle main course image
  if (files && files['file'] && files['file'][0]) {
    const backendUrl = config.backend_url || '';
    const baseUrl = backendUrl.endsWith('/')
      ? backendUrl.slice(0, -1)
      : backendUrl;
    body.imageUrl = `${baseUrl}/upload/${files['file'][0].filename}`;
  }

  // Handle instructor images
  if (files && files['instructorFiles'] && body.instructors) {
    const instructorFiles = files['instructorFiles'];
    const backendUrl = config.backend_url || '';
    const baseUrl = backendUrl.endsWith('/')
      ? backendUrl.slice(0, -1)
      : backendUrl;

    body.instructors = body.instructors.map((instructor, index) => ({
      ...instructor,
      imageUrl: instructorFiles[index]
        ? `${baseUrl}/upload/${instructorFiles[index].filename}`
        : instructor.imageUrl || '',
    }));
  }

  // Set default values
  if (!body.startDate) {
    body.startDate = new Date();
  }
  // Remove manual status setting - let the pre-save middleware handle it
  // if (!body.status) {
  //   body.status = 'upcoming';
  // }

  const result = await courseModel.create(body);

  // Update course count in category
  await updateCourseCategoryCount(body.category);

  const courses = await courseModel
    .find()
    .populate('category', 'name description')
    .sort({ createdAt: -1 });
  io.emit('courseUpdate', courses);
  return result;
};

const UpdateCourse = async (
  id: string,
  body: Partial<Icourse>,
  files?: MulterFiles,
) => {
  // Handle main course image update
  if (files && files['file'] && files['file'][0]) {
    const backendUrl = config.backend_url || '';
    const baseUrl = backendUrl.endsWith('/')
      ? backendUrl.slice(0, -1)
      : backendUrl;
    body.imageUrl = `${baseUrl}/upload/${files['file'][0].filename}`;
  }

  // Handle instructor images update
  if (files && files['instructorFiles'] && body.instructors) {
    const instructorFiles = files['instructorFiles'];
    const backendUrl = config.backend_url || '';
    const baseUrl = backendUrl.endsWith('/')
      ? backendUrl.slice(0, -1)
      : backendUrl;

    body.instructors = body.instructors.map((instructor, index) => ({
      ...instructor,
      imageUrl: instructorFiles[index]
        ? `${baseUrl}/upload/${instructorFiles[index].filename}`
        : instructor.imageUrl || '',
    }));
  }

  const oldCourse = await courseModel.findById(id);
  const result = await courseModel
    .findByIdAndUpdate(id, body, { new: true })
    .populate('category', 'name description');
  if (!result) {
    throw new AppError(404, 'Course not found');
  }

  // If category changed, update counts for both old and new categories
  if (
    oldCourse &&
    body.category &&
    oldCourse.category.toString() !== body.category.toString()
  ) {
    await updateCourseCategoryCount(oldCourse.category);
    await updateCourseCategoryCount(body.category);
  }

  const courses = await courseModel
    .find()
    .populate('category', 'name description')
    .sort({ createdAt: -1 });
  io.emit('courseUpdate', courses);
  return result;
};

const DeletedCourse = async (id: string) => {
  const course = await courseModel.findById(id);
  if (!course) {
    throw new AppError(404, 'This course is not found');
  }

  const result = await courseModel.findByIdAndDelete(id);

  // Update course count in category
  await updateCourseCategoryCount(course.category);

  const courses = await courseModel
    .find()
    .populate('category', 'name description')
    .sort({ createdAt: -1 });
  io.emit('courseUpdate', courses);
  return result;
};

// Helper function to update course count in category
const updateCourseCategoryCount = async (categoryId: Types.ObjectId) => {
  try {
    const courseCount = await courseModel.countDocuments({
      category: categoryId,
    });
    await categoryModel.findByIdAndUpdate(categoryId, { courseCount });
  } catch (error) {
    console.error('Error updating course category count:', error);
  }
};

export const courseService = {
  GetCourse,
  GetSingleCourse,
  PostCourse,
  UpdateCourse,
  DeletedCourse,
};
