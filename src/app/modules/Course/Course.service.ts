import { Icourse } from './Course.Interface';
import { courseModel } from './Course.model';
import { io } from '../../utils/socket'; // Socket emitter
import AppError from '../../errors/AppError';
import { sendImageToCloudinary } from '../../utils/upload';

const GetCourse = async () => {
  const result = await courseModel.find();
  return result;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const PostCourse = async (body: Icourse, file: any) => {
  if (file) {
    const imageName = `${body.title}${body?.instruction}`;
    const path = file?.path;
    const { secure_url } = await sendImageToCloudinary(imageName, path);
    body.image = secure_url as string;
  }
  const result = await courseModel.create(body);
  const course = await courseModel.find();
  io.emit('courseUpdate', course);
  return result;
};
const UpdateCourse = async (id: string, body: Icourse) => {
  const result = await courseModel.findByIdAndUpdate(id, body, { new: true });
  const courses = await courseModel.find();
  io.emit('courseUpdate', courses);
  return result;
};
const DeletedCourse = async (id: string) => {
  const result = await courseModel.findByIdAndDelete(id);
  if (!result) {
    throw new AppError(404, 'This course is not found');
  }
  const courses = await courseModel.find();
  io.emit('courseUpdate', courses);
  return result;
};
export const courseService = {
  GetCourse,
  PostCourse,
  UpdateCourse,
  DeletedCourse,
};
