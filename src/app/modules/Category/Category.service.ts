import { ICategory } from './Category.Interface';
import { categoryModel } from './Category.model';
import { io } from '../../utils/socket';
import AppError from '../../errors/AppError';

const GetCategories = async () => {
  const result = await categoryModel.find().sort({ createdAt: -1 });
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
  const categories = await categoryModel.find().sort({ createdAt: -1 });
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
  
  const categories = await categoryModel.find().sort({ createdAt: -1 });
  io.emit('categoryUpdate', categories);
  return result;
};

const DeleteCategory = async (id: string) => {
  const result = await categoryModel.findByIdAndDelete(id);
  if (!result) {
    throw new AppError(404, 'This category is not found');
  }
  const categories = await categoryModel.find().sort({ createdAt: -1 });
  io.emit('categoryUpdate', categories);
  return result;
};

// Update category stats when courses are added/removed
const UpdateCategoryStats = async () => {
  const categories = await categoryModel.find();
  
  for (const category of categories) {
    // This would be called when courses are added/removed
    // For now, we'll just return the categories as is
    // In a real implementation, you'd aggregate course data here
  }
};

export const categoryService = {
  GetCategories,
  GetSingleCategory,
  PostCategory,
  UpdateCategory,
  DeleteCategory,
  UpdateCategoryStats,
}; 