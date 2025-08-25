import { ICategory } from './Category.Interface';
import { categoryModel } from './Category.model';
import { io } from '../../utils/socket';
import AppError from '../../errors/AppError';

const GetCategories = async () => {
  // Use aggregation to get categories with course counts
  const result = await categoryModel.aggregate([
    {
      $lookup: {
        from: 'courses', // Collection name for courses
        localField: '_id',
        foreignField: 'category',
        as: 'courses'
      }
    },
    {
      $addFields: {
        courseCount: { $size: '$courses' }
      }
    },
    {
      $project: {
        courses: 0 // Remove the courses array from the result
      }
    },
    {
      $sort: { createdAt: -1 }
    }
  ]);
  
  return result;
};

const GetSingleCategory = async (id: string) => {
  const result = await categoryModel.findById(id);
  if (!result) {
    throw new AppError(404, 'Category not found');
  }
  return result;
};

const PostCategory = async (body: ICategory) => {
  // Check if category with same name already exists
  const existingCategory = await categoryModel.findOne({ name: body.name });
  if (existingCategory) {
    throw new AppError(409, 'Category with this name already exists');
  }

  const result = await categoryModel.create(body);
  
  // Emit updated categories list
  const categories = await GetCategories();
  io.emit('categoryUpdate', categories);
  
  return result;
};

const UpdateCategory = async (id: string, body: Partial<ICategory>) => {
  // Check if name is being updated and if it conflicts with existing category
  if (body.name) {
    const existingCategory = await categoryModel.findOne({ 
      name: body.name, 
      _id: { $ne: id } 
    });
    if (existingCategory) {
      throw new AppError(409, 'Category with this name already exists');
    }
  }

  const result = await categoryModel.findByIdAndUpdate(id, body, { new: true });
  if (!result) {
    throw new AppError(404, 'Category not found');
  }
  
  // Emit updated categories list
  const categories = await GetCategories();
  io.emit('categoryUpdate', categories);
  
  return result;
};

const DeleteCategory = async (id: string) => {
  const result = await categoryModel.findByIdAndDelete(id);
  if (!result) {
    throw new AppError(404, 'This category is not found');
  }
  
  // Emit updated categories list
  const categories = await GetCategories();
  io.emit('categoryUpdate', categories);
  
  return result;
};

// Update category stats when courses are added/removed
const UpdateCategoryStats = async () => {
  // Use aggregation to update course counts for all categories
  const categoriesWithCounts = await categoryModel.aggregate([
    {
      $lookup: {
        from: 'courses',
        localField: '_id',
        foreignField: 'category',
        as: 'courses'
      }
    },
    {
      $addFields: {
        courseCount: { $size: '$courses' }
      }
    },
    {
      $project: {
        _id: 1,
        courseCount: 1
      }
    }
  ]);

  // Update each category with its course count
  for (const category of categoriesWithCounts) {
    await categoryModel.findByIdAndUpdate(
      category._id, 
      { courseCount: category.courseCount }
    );
  }
};

// Get categories with course statistics
const GetCategoryStats = async () => {
  const stats = await categoryModel.aggregate([
    {
      $lookup: {
        from: 'courses',
        localField: '_id',
        foreignField: 'category',
        as: 'courses'
      }
    },
    {
      $addFields: {
        courseCount: { $size: '$courses' },
        totalEnrollments: {
          $sum: '$courses.enrolled'
        },
        averageRating: {
          $cond: {
            if: { $gt: [{ $size: '$courses' }, 0] },
            then: { $avg: '$courses.rating' },
            else: 0
          }
        },
        totalRevenue: {
          $sum: {
            $map: {
              input: '$courses',
              as: 'course',
              in: {
                $cond: {
                  if: { $eq: ['$$course.isFree', false] },
                  then: { $multiply: ['$$course.fee', '$$course.enrolled'] },
                  else: 0
                }
              }
            }
          }
        }
      }
    },
    {
      $project: {
        courses: 0
      }
    },
    {
      $sort: { courseCount: -1 }
    }
  ]);

  return stats;
};

export const categoryService = {
  GetCategories,
  GetSingleCategory,
  PostCategory,
  UpdateCategory,
  DeleteCategory,
  UpdateCategoryStats,
  GetCategoryStats,
}; 