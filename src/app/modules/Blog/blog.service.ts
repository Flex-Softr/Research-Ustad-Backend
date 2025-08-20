import { Types } from 'mongoose';
import AppError from '../../errors/AppError';
import { IBlog } from './blog.interface';
import { Blog } from './blog.model';
import { User } from '../user/user.model';

const Getblog = async () => {
  // Only return approved blogs for public view
  const result = await Blog.find({ status: 'approved' }).populate(
    'author',
    'fullName email image designation',
  );

  return result;
};

const Authorblog = async (id: string) => {
  // Validate that id is a valid ObjectId string
  if (!id || !Types.ObjectId.isValid(id)) {
    throw new AppError(400, 'Invalid user ID');
  }

  try {
    const result = await Blog.find({ author: new Types.ObjectId(id) }).populate(
      'author',
      'fullName email image designation',
    );
    return result;
  } catch (error) {
    throw new AppError(500, 'Failed to fetch user blogs');
  }
};

// Get all blogs for admin (including pending and rejected)
const GetAllBlogsForAdmin = async () => {
  const result = await Blog.find().populate(
    'author',
    'fullName email image designation',
  );
  return result;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const Postblog = async (body: IBlog, id: Types.ObjectId) => {
  body.author = id;

  // Set status based on user role - users get pending, admins get approved
  if (!body.status) {
    body.status = 'pending';
  }

  const result = await Blog.create(body);
  
  // Add the blog to the user's blogs array
  await User.findByIdAndUpdate(
    id,
    { $push: { blogs: result._id } },
    { new: true }
  );
  
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
  const result = await Blog.findById(id).populate(
    'author',
    'fullName email image designation',
  );

  if (!result) {
    throw new AppError(404, 'This blog is not found');
  }

  return result;
};

// Approve or reject blog
const UpdateBlogStatus = async (
  id: string,
  status: 'approved' | 'rejected',
) => {
  const result = await Blog.findByIdAndUpdate(
    id,
    { status },
    { new: true },
  ).populate('author', 'fullName email image designation');

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
  GetAllBlogsForAdmin,
  UpdateBlogStatus,
};
