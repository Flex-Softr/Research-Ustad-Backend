import { Types } from 'mongoose';
import AppError from '../../errors/AppError';
import { IBlog } from './blog.interface';
import { Blog } from './blog.model';

const Getblog = async () => {
  const result = await Blog.find().populate('author', 'fullName email image designation');

  return result;
};
const Authorblog = async (id: string) => {
  const result = await Blog.find({ author: new Types.ObjectId(id) }).populate('author', 'fullName email image designation');
  return result;
};
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const Postblog = async (body: IBlog, id: Types.ObjectId) => {

  
  body.author = id;
  
  const result = await Blog.create(body);
  return result;
};
const Updateblog = async (id: string, body: IBlog) => {
  const result = await Blog.findByIdAndUpdate(id, body, { new: true });
  return result;
};
const Deletedblog = async (id: string) => {
  const result = await Blog.findByIdAndDelete(id);
  if (!result) {
    throw new AppError(404, 'This blog is not found');
  }
  return result;
};
const Getblogsingle = async (id: string) => {

  
  const result = await Blog.findById(id).populate('author', 'fullName email image designation');

  
  if (!result) {
    throw new AppError(404, 'This blog is not found');
  }
  
  return result;
};
export const blogService = {
  Getblog,
  Postblog,
  Updateblog,
  Deletedblog,
  Authorblog,
  Getblogsingle,
};
