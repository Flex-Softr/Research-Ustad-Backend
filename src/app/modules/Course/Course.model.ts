import mongoose, { Schema } from "mongoose";
import { Icourse } from "./Course.Interface";

// Instructor schema
const instructorSchema = new Schema({
  name: { type: String, required: true },
  imageUrl: { type: String, required: true },
  specialization: { type: String, required: true },
  experience: { type: String, required: true },
  rating: { type: Number, required: true, min: 0, max: 5 },
  students: { type: Number, required: true, min: 0 }
}, { _id: false });

const courseSchema = new Schema<Icourse>({
  title: { 
    type: String, 
    required: [true, "Title is required"] 
  },
  description: { 
    type: String, 
    required: [true, "Description is required"] 
  },
  location: { 
    type: String, 
    required: [true, "Location is required"] 
  },
  duration: { 
    type: String, 
    required: [true, "Duration is required"] 
  },
  level: { 
    type: String, 
    required: [true, "Level is required"],
    enum: {
      values: ["Beginner", "Intermediate", "Advanced"],
      message: "Level must be Beginner, Intermediate, or Advanced"
    }
  },
  category: { 
    type: String, 
    required: [true, "Category is required"] 
  },
  fee: { 
    type: Number, 
    required: [true, "Fee is required"], 
    min: [0, "Fee cannot be negative"] 
  },
  enrolled: { 
    type: Number, 
    default: 0, 
    min: [0, "Enrolled cannot be negative"] 
  },
  capacity: { 
    type: Number, 
    required: [true, "Capacity is required"], 
    min: [1, "Capacity must be at least 1"] 
  },
  rating: { 
    type: Number, 
    default: 0, 
    min: [0, "Rating cannot be negative"], 
    max: [5, "Rating cannot exceed 5"] 
  },
  totalReviews: { 
    type: Number, 
    default: 0, 
    min: [0, "Total reviews cannot be negative"] 
  },
  language: { 
    type: String, 
    required: [true, "Language is required"] 
  },
  certificate: { 
    type: Boolean, 
    default: true 
  },
  lifetimeAccess: { 
    type: Boolean, 
    default: true 
  },
  imageUrl: { 
    type: String, 
    required: [true, "Image URL is required"] 
  },
  instructors: { 
    type: [instructorSchema], 
    required: [true, "At least one instructor is required"],
    validate: {
      validator: function(instructors: any[]) {
        return instructors && instructors.length > 0;
      },
      message: "At least one instructor is required"
    }
  },
  tags: { 
    type: [String], 
    default: [] 
  },
  whatYouWillLearn: { 
    type: [String], 
    default: [] 
  },
  requirements: { 
    type: [String], 
    default: [] 
  },
  startDate: { 
    type: Date, 
    default: Date.now 
  },
  endDate: { 
    type: Date 
  },
  status: { 
    type: String, 
    enum: {
      values: ["upcoming", "ongoing", "completed"], 
      message: "Status must be upcoming, ongoing, or completed"
    },
    default: "upcoming" 
  }
}, { timestamps: true });

// Pre-save middleware to set status based on dates
courseSchema.pre("save", function(next) {
  const now = new Date();
  if (this.startDate && this.endDate) {
    if (now < this.startDate) {
      this.status = "upcoming";
    } else if (now >= this.startDate && now <= this.endDate) {
      this.status = "ongoing";
    } else {
      this.status = "completed";
    }
  }
  next();
});

// Pre-update middleware
courseSchema.pre("findOneAndUpdate", function(next) {
  const update = this.getUpdate() as Partial<Icourse>;
  if (!update) return next();

  const now = new Date();
  if (update.startDate && update.endDate) {
    if (now < update.startDate) {
      update.status = "upcoming";
    } else if (now >= update.startDate && now <= update.endDate) {
      update.status = "ongoing";
    } else {
      update.status = "completed";
    }
  }

  next();
});

export const courseModel = mongoose.model('course', courseSchema);