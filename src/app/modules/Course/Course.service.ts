import { Icourse } from './Course.Interface';
import { courseModel } from './Course.model';
import { io } from '../../utils/socket'; // Socket emitter
import AppError from '../../errors/AppError';
import config from '../../config';

// Type for multer files
interface MulterFiles {
  [fieldname: string]: Array<{
    filename: string;
    path: string;
    mimetype: string;
  }>;
}

const GetCourse = async () => {
  const result = await courseModel.find().sort({ createdAt: -1 });
  return result;
};

const GetSingleCourse = async (id: string) => {
  const result = await courseModel.findById(id);
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
    const baseUrl = backendUrl.endsWith('/') ? backendUrl.slice(0, -1) : backendUrl;
    body.imageUrl = `${baseUrl}/upload/${files['file'][0].filename}`;
  }

  // Handle instructor images
  if (files && files['instructorFiles'] && body.instructors) {
    const instructorFiles = files['instructorFiles'];
    const backendUrl = config.backend_url || '';
    const baseUrl = backendUrl.endsWith('/') ? backendUrl.slice(0, -1) : backendUrl;
    
    body.instructors = body.instructors.map((instructor, index) => ({
      ...instructor,
      imageUrl: instructorFiles[index] 
        ? `${baseUrl}/upload/${instructorFiles[index].filename}`
        : instructor.imageUrl || ''
    }));
  }

  // Set default values
  if (!body.startDate) {
    body.startDate = new Date();
  }
  if (!body.status) {
    body.status = 'upcoming';
  }

  const result = await courseModel.create(body);
  const courses = await courseModel.find().sort({ createdAt: -1 });
  io.emit('courseUpdate', courses);
  return result;
};

const UpdateCourse = async (id: string, body: Partial<Icourse>, files?: MulterFiles) => {
  // Handle main course image update
  if (files && files['file'] && files['file'][0]) {
    const backendUrl = config.backend_url || '';
    const baseUrl = backendUrl.endsWith('/') ? backendUrl.slice(0, -1) : backendUrl;
    body.imageUrl = `${baseUrl}/upload/${files['file'][0].filename}`;
  }

  // Handle instructor images update
  if (files && files['instructorFiles'] && body.instructors) {
    const instructorFiles = files['instructorFiles'];
    const backendUrl = config.backend_url || '';
    const baseUrl = backendUrl.endsWith('/') ? backendUrl.slice(0, -1) : backendUrl;
    
    body.instructors = body.instructors.map((instructor, index) => ({
      ...instructor,
      imageUrl: instructorFiles[index] 
        ? `${baseUrl}/upload/${instructorFiles[index].filename}`
        : instructor.imageUrl || ''
    }));
  }

  const result = await courseModel.findByIdAndUpdate(id, body, { new: true });
  if (!result) {
    throw new AppError(404, 'Course not found');
  }
  
  const courses = await courseModel.find().sort({ createdAt: -1 });
  io.emit('courseUpdate', courses);
  return result;
};

const DeletedCourse = async (id: string) => {
  const result = await courseModel.findByIdAndDelete(id);
  if (!result) {
    throw new AppError(404, 'This course is not found');
  }
  const courses = await courseModel.find().sort({ createdAt: -1 });
  io.emit('courseUpdate', courses);
  return result;
};

export const courseService = {
  GetCourse,
  GetSingleCourse,
  PostCourse,
  UpdateCourse,
  DeletedCourse,
};
