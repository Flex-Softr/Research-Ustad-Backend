import mongoose, { Schema } from "mongoose";
import { ICategory } from "./Category.Interface";

const categorySchema = new Schema<ICategory>({
  name: { 
    type: String, 
    required: [true, "Category name is required"],
    unique: true,
    trim: true
  },
  description: { 
    type: String, 
    default: "" 
  },
  courseCount: { 
    type: Number, 
    default: 0,
    min: [0, "Course count cannot be negative"]
  },
  totalEnrollments: { 
    type: Number, 
    default: 0,
    min: [0, "Total enrollments cannot be negative"]
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

// Pre-save middleware to update course count
categorySchema.pre("save", function(next) {
  // This will be updated when courses are added/removed
  next();
});

export const categoryModel = mongoose.model('category', categorySchema); 