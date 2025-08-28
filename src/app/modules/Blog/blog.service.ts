import { Types } from 'mongoose';
import AppError from '../../errors/AppError';
import { IBlog } from './blog.interface';
import { Blog } from './blog.model';
import { User } from '../user/user.model';
import { blogCategoryModel } from '../BlogCategory/BlogCategory.model';

const Getblog = async () => {
  // Only return approved blogs for public view, sorted by latest first
  const result = await Blog.find({ status: 'approved' })
    .populate('author', 'fullName email image designation')
    .populate('category', 'name description')
    .sort({ createdAt: -1 }); // Sort by creation time, latest first

  return result;
};

const Authorblog = async (id: string) => {
  // Validate that id is a valid ObjectId string
  if (!id || !Types.ObjectId.isValid(id)) {
    throw new AppError(400, 'Invalid user ID');
  }

  try {
    const result = await Blog.find({ author: new Types.ObjectId(id) })
      .populate('author', 'fullName email image designation')
      .populate('category', 'name description')
      .sort({ createdAt: -1 }); // Sort by creation time, latest first
    return result;
  } catch (error) {
    throw new AppError(500, 'Failed to fetch user blogs');
  }
};

// Get all blogs for admin (including pending and rejected)
const GetAllBlogsForAdmin = async () => {
  const result = await Blog.find()
    .populate('author', 'fullName email image designation')
    .populate('category', 'name description')
    .sort({ createdAt: -1 }); // Sort by creation time, latest first
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
  
  // Update blog count in category
  await updateBlogCategoryCount(body.category);
  
  return result;
};

const Updateblog = async (id: string, body: IBlog) => {
  const oldBlog = await Blog.findById(id);
  const result = await Blog.findByIdAndUpdate(id, body, { new: true });
  
  // If category changed, update counts for both old and new categories
  if (oldBlog && body.category && oldBlog.category.toString() !== body.category.toString()) {
    await updateBlogCategoryCount(oldBlog.category);
    await updateBlogCategoryCount(body.category);
  }
  
  return result;
};

const Deletedblog = async (id: string) => {
  const blog = await Blog.findById(id);
  if (!blog) {
    throw new AppError(404, 'This blog is not found');
  }
  
  const result = await Blog.findByIdAndDelete(id);
  
  // Update blog count in category
  await updateBlogCategoryCount(blog.category);
  
  return result;
};

const Getblogsingle = async (id: string) => {
  const result = await Blog.findById(id)
    .populate('author', 'fullName email image designation')
    .populate('category', 'name description');

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
  )
    .populate('author', 'fullName email image designation')
    .populate('category', 'name description');

  if (!result) {
    throw new AppError(404, 'This blog is not found');
  }

  return result;
};

// Helper function to update blog count in category
const updateBlogCategoryCount = async (categoryId: Types.ObjectId) => {
  try {
    const blogCount = await Blog.countDocuments({ category: categoryId });
    await blogCategoryModel.findByIdAndUpdate(
      categoryId,
      { blogCount }
    );
  } catch (error) {
    console.error('Error updating blog category count:', error);
  }
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
