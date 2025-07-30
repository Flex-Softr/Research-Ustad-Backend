import { Types } from 'mongoose';
import AppError from '../../errors/AppError';
import { IBlog } from './blog.interface';
import { Blog } from './blog.model';

const Getblog = async () => {
  console.log('Getblog Service - Starting');
  const result = await Blog.find().populate('author', 'fullName email image designation');
  console.log('Getblog Service - Found blogs:', result?.length || 0);
  return result;
};
const Authorblog = async (id: string) => {
  const result = await Blog.find({ author: id }).populate('author', 'fullName email image designation');
  return result;
};
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const Postblog = async (body: IBlog, id: Types.ObjectId) => {
  console.log('Postblog Service - Body:', body);
  console.log('Postblog Service - User ID:', id);
  
  body.author = id;
  console.log('Postblog Service - Final body:', body);
  
  const result = await Blog.create(body);
  console.log('Postblog Service - Created result:', result);
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
  console.log('Getblogsingle Service - Starting with ID:', id);
  
  const result = await Blog.findById(id).populate('author', 'fullName email image designation');
  console.log('Getblogsingle Service - Found blog:', result ? 'Yes' : 'No');
  
  if (!result) {
    console.log('Getblogsingle Service - Blog not found for ID:', id);
    throw new AppError(404, 'This blog is not found');
  }
  
  console.log('Getblogsingle Service - Returning blog:', result._id);
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
