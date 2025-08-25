import { IBlogCategory } from './BlogCategory.Interface';
import { blogCategoryModel } from './BlogCategory.model';
import { io } from '../../utils/socket';
import AppError from '../../errors/AppError';

const GetBlogCategories = async () => {
  // Use aggregation to get categories with blog counts
  const result = await blogCategoryModel.aggregate([
    {
      $lookup: {
        from: 'blogs', // Collection name for blogs
        localField: '_id',
        foreignField: 'category',
        as: 'blogs'
      }
    },
    {
      $addFields: {
        blogCount: { $size: '$blogs' }
      }
    },
    {
      $project: {
        blogs: 0 // Remove the blogs array from the result
      }
    },
    {
      $sort: { createdAt: -1 }
    }
  ]);
  
  return result;
};

const GetSingleBlogCategory = async (id: string) => {
  const result = await blogCategoryModel.findById(id);
  if (!result) {
    throw new AppError(404, 'Blog category not found');
  }
  return result;
};

const PostBlogCategory = async (body: IBlogCategory) => {
  // Check if category with same name already exists
  const existingCategory = await blogCategoryModel.findOne({ name: body.name });
  if (existingCategory) {
    throw new AppError(409, 'Blog category with this name already exists');
  }

  const result = await blogCategoryModel.create(body);
  
  // Emit updated categories list
  const categories = await GetBlogCategories();
  io.emit('blogCategoryUpdate', categories);
  
  return result;
};

const UpdateBlogCategory = async (id: string, body: Partial<IBlogCategory>) => {
  // Check if name is being updated and if it conflicts with existing category
  if (body.name) {
    const existingCategory = await blogCategoryModel.findOne({ 
      name: body.name, 
      _id: { $ne: id } 
    });
    if (existingCategory) {
      throw new AppError(409, 'Blog category with this name already exists');
    }
  }

  const result = await blogCategoryModel.findByIdAndUpdate(id, body, { new: true });
  if (!result) {
    throw new AppError(404, 'Blog category not found');
  }
  
  // Emit updated categories list
  const categories = await GetBlogCategories();
  io.emit('blogCategoryUpdate', categories);
  
  return result;
};

const DeleteBlogCategory = async (id: string) => {
  const result = await blogCategoryModel.findByIdAndDelete(id);
  if (!result) {
    throw new AppError(404, 'Blog category not found');
  }
  
  // Emit updated categories list
  const categories = await GetBlogCategories();
  io.emit('blogCategoryUpdate', categories);
  
  return result;
};

const UpdateBlogCategoryStats = async () => {
  // Use aggregation to update blog counts for all categories
  const categoriesWithCounts = await blogCategoryModel.aggregate([
    {
      $lookup: {
        from: 'blogs',
        localField: '_id',
        foreignField: 'category',
        as: 'blogs'
      }
    },
    {
      $addFields: {
        blogCount: { $size: '$blogs' }
      }
    },
    {
      $project: {
        _id: 1,
        blogCount: 1
      }
    }
  ]);

  // Update each category with its blog count
  for (const category of categoriesWithCounts) {
    await blogCategoryModel.findByIdAndUpdate(
      category._id, 
      { blogCount: category.blogCount }
    );
  }
};

// Get categories with blog statistics
const GetBlogCategoryStats = async () => {
  const stats = await blogCategoryModel.aggregate([
    {
      $lookup: {
        from: 'blogs',
        localField: '_id',
        foreignField: 'category',
        as: 'blogs'
      }
    },
    {
      $addFields: {
        blogCount: { $size: '$blogs' },
        activeBlogs: {
          $size: {
            $filter: {
              input: '$blogs',
              cond: { $eq: ['$$this.status', 'approved'] }
            }
          }
        },
        pendingBlogs: {
          $size: {
            $filter: {
              input: '$blogs',
              cond: { $eq: ['$$this.status', 'pending'] }
            }
          }
        }
      }
    },
    {
      $project: {
        blogs: 0
      }
    },
    {
      $sort: { blogCount: -1 }
    }
  ]);

  return stats;
};

export const blogCategoryService = {
  GetBlogCategories,
  GetSingleBlogCategory,
  PostBlogCategory,
  UpdateBlogCategory,
  DeleteBlogCategory,
  UpdateBlogCategoryStats,
  GetBlogCategoryStats,
};
