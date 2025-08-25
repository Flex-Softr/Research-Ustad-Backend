import mongoose, { Schema } from "mongoose";
import { IBlogCategory } from "./BlogCategory.Interface";

const blogCategorySchema = new Schema<IBlogCategory>({
  name: { 
    type: String, 
    required: [true, "Blog category name is required"],
    unique: true,
    trim: true
  },
  description: { 
    type: String, 
    default: "" 
  },
  blogCount: { 
    type: Number, 
    default: 0,
    min: [0, "Blog count cannot be negative"]
  },
  status: { 
    type: String, 
    enum: {
      values: ["active", "inactive"],
      message: "Status must be either 'active' or 'inactive'"
    },
    default: "active"
  }
}, { timestamps: true });

// Pre-save middleware to update blog count
blogCategorySchema.pre("save", function(next) {
  // This will be updated when blogs are added/removed
  next();
});



export const blogCategoryModel = mongoose.model('blogCategory', blogCategorySchema);
