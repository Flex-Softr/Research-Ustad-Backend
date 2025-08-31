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
  curriculum: { 
    type: String, 
    required: [true, "Curriculum is required"] 
  },
  location: { 
    type: String, 
    required: [true, "Location is required"],
    enum: {
      values: ["Online", "Offline"],
      message: "Location must be Online or Offline"
    }
  },
  offlineLocation: { 
    type: String,
    required: function() {
      return this.location === "Offline";
    },
    validate: {
      validator: function(this: Icourse, value: string) {
        if (this.location === "Offline") {
          return value && value.trim()?.length > 0;
        }
        return true;
      },
      message: "Offline location is required when location is Offline"
    }
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
    type: mongoose.Schema.Types.ObjectId,
    ref: 'category',
    required: [true, "Category is required"] 
  },
  fee: { 
    type: Number, 
    required: function() {
      return !this.isFree;
    },
    min: [0, "Fee cannot be negative"],
    validate: {
      validator: function(this: Icourse, value: number) {
        if (!this.isFree && (value === undefined || value === null)) {
          return false;
        }
        return true;
      },
      message: "Fee is required when course is not free"
    }
  },
  isFree: { 
    type: Boolean, 
    default: false 
  },
  enrolled: { 
    type: Number, 
    default: 0, 
    min: [0, "Enrolled cannot be negative"] 
  },
  capacity: { 
    type: Number, 
    required: [true, "Capacity is required"], 
    min: [1, "Capacity must be at least 1"],
    validate: {
      validator: function(this: Icourse, value: number): boolean {
        return value >= this.enrolled;
      },
      message: "Capacity cannot be less than enrolled students"
    }
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
  enrollLink: { 
    type: String, 
    required: [true, "Enroll link is required"],
    validate: {
      validator: function(value: string) {
        try {
          new URL(value);
          return true;
        } catch {
          return false;
        }
      },
      message: "Enroll link must be a valid URL"
    }
  },
  imageUrl: { 
    type: String, 
    required: [true, "Image URL is required"] 
  },
  instructors: { 
    type: [instructorSchema], 
    required: [true, "At least one instructor is required"],
    validate: {
      validator: function(instructors: Array<{
        name: string;
        imageUrl: string;
        specialization: string;
        experience: string;
        rating: number;
        students: number;
      }>) {
        return instructors && instructors?.length > 0;
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
      values: ["upcoming", "ongoing"], 
      message: "Status must be upcoming or ongoing"
    },
    default: "upcoming" 
  }
}, { timestamps: true });

// Add indexes for better performance
courseSchema.index({ category: 1 });
courseSchema.index({ status: 1 });

// Pre-save middleware to set status based on dates
courseSchema.pre("save", function(next) {
  const now = new Date();
  
  // If we have startDate, calculate status
  if (this.startDate) {
    const startDate = new Date(this.startDate);
    
    // If no endDate is provided, calculate it based on duration
    if (!this.endDate && this.duration) {
      // Parse duration string (e.g., "3 months", "6 weeks", "30 days")
      const durationMatch = this.duration.match(/(\d+)\s*(day|days|week|weeks|month|months|year|years)/i);
      if (durationMatch) {
        const amount = parseInt(durationMatch[1]);
        const unit = durationMatch[2].toLowerCase();
        
        const endDate = new Date(startDate);
        switch (unit) {
          case 'day':
          case 'days':
            endDate.setDate(endDate.getDate() + amount);
            break;
          case 'week':
          case 'weeks':
            endDate.setDate(endDate.getDate() + (amount * 7));
            break;
          case 'month':
          case 'months':
            endDate.setMonth(endDate.getMonth() + amount);
            break;
          case 'year':
          case 'years':
            endDate.setFullYear(endDate.getFullYear() + amount);
            break;
        }
        this.endDate = endDate;
      }
    }
    
    // Calculate status based on dates - only upcoming and ongoing
    if (now < startDate) {
      this.status = "upcoming";
    } else {
      this.status = "ongoing";
    }
  }
  
  next();
});

// Pre-update middleware
courseSchema.pre("findOneAndUpdate", function(next) {
  const update = this.getUpdate() as Partial<Icourse>;
  if (!update) return next();

  const now = new Date();
  
  // If we have startDate, calculate status
  if (update.startDate) {
    const startDate = new Date(update.startDate);
    
    // If no endDate is provided, calculate it based on duration
    if (!update.endDate && update.duration) {
      // Parse duration string (e.g., "3 months", "6 weeks", "30 days")
      const durationMatch = update.duration.match(/(\d+)\s*(day|days|week|weeks|month|months|year|years)/i);
      if (durationMatch) {
        const amount = parseInt(durationMatch[1]);
        const unit = durationMatch[2].toLowerCase();
        
        const endDate = new Date(startDate);
        switch (unit) {
          case 'day':
          case 'days':
            endDate.setDate(endDate.getDate() + amount);
            break;
          case 'week':
          case 'weeks':
            endDate.setDate(endDate.getDate() + (amount * 7));
            break;
          case 'month':
          case 'months':
            endDate.setMonth(endDate.getMonth() + amount);
            break;
          case 'year':
          case 'years':
            endDate.setFullYear(endDate.getFullYear() + amount);
            break;
        }
        update.endDate = endDate;
      }
    }
    
    // Calculate status based on dates - only upcoming and ongoing
    if (now < startDate) {
      update.status = "upcoming";
    } else {
      update.status = "ongoing";
    }
  }

  next();
});

export const courseModel = mongoose.model('course', courseSchema);