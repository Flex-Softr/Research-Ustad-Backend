import { z } from "zod";

// Instructor validation schema
const instructorValidation = z.object({
  name: z.string().min(1, "Instructor name is required"),
  imageUrl: z.string().min(1, "Instructor image URL is required"),
  specialization: z.string().min(1, "Specialization is required"),
  experience: z.string().min(1, "Experience is required"),
  rating: z.number().min(0).max(5, "Rating must be between 0 and 5"),
  students: z.number().min(0, "Students count cannot be negative")
});

const courseValidationPost = z.object({
  body: z.object({
    title: z.string().min(1, "Title is required"),
    description: z.string().min(1, "Description is required"),
    location: z.enum(["Online", "Offline"], {
      errorMap: () => ({ message: "Location must be Online or Offline" })
    }),
    offlineLocation: z.string().optional(),
    duration: z.string().min(1, "Duration is required"),
    level: z.enum(["Beginner", "Intermediate", "Advanced"], {
      errorMap: () => ({ message: "Level must be Beginner, Intermediate, or Advanced" })
    }),
    category: z.string().min(1, "Category is required"),
    fee: z.number().min(0, "Fee cannot be negative").optional(),
    isFree: z.boolean().default(false),
    enrolled: z.number().min(0).optional().default(0),
    capacity: z.number().min(1, "Capacity must be at least 1"),
    rating: z.number().min(0).max(5).optional().default(0),
    totalReviews: z.number().min(0).optional().default(0),
    language: z.string().min(1, "Language is required"),
    certificate: z.boolean().optional().default(true),
    lifetimeAccess: z.boolean().optional().default(true),
    imageUrl: z.string().min(1, "Image URL is required"),
    instructors: z.array(instructorValidation).min(1, "At least one instructor is required"),
    tags: z.array(z.string()).optional().default([]),
    whatYouWillLearn: z.array(z.string()).optional().default([]),
    requirements: z.array(z.string()).optional().default([]),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    status: z.enum(["upcoming", "ongoing"]).optional()
  }).refine((data) => {
    if (data.location === "Offline" && (!data.offlineLocation || data.offlineLocation.trim() === "")) {
      return false;
    }
    return true;
  }, {
    message: "Offline location is required when location is Offline",
    path: ["offlineLocation"]
  }).refine((data) => {
    if (!data.isFree && (data.fee === undefined || data.fee === null)) {
      return false;
    }
    return true;
  }, {
    message: "Fee is required when course is not free",
    path: ["fee"]
  })
});

const courseValidationUpdate = z.object({
  body: z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    location: z.enum(["Online", "Offline"]).optional(),
    offlineLocation: z.string().optional(),
    duration: z.string().optional(),
    level: z.enum(["Beginner", "Intermediate", "Advanced"]).optional(),
    category: z.string().optional(),
    fee: z.number().min(0).optional(),
    isFree: z.boolean().optional(),
    enrolled: z.number().min(0).optional(),
    capacity: z.number().min(1).optional(),
    rating: z.number().min(0).max(5).optional(),
    totalReviews: z.number().min(0).optional(),
    language: z.string().optional(),
    certificate: z.boolean().optional(),
    lifetimeAccess: z.boolean().optional(),
    imageUrl: z.string().optional(),
    instructors: z.array(instructorValidation).optional(),
    tags: z.array(z.string()).optional(),
    whatYouWillLearn: z.array(z.string()).optional(),
    requirements: z.array(z.string()).optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    status: z.enum(["upcoming", "ongoing"]).optional()
  }).refine((data) => {
    if (data.location === "Offline" && (!data.offlineLocation || data.offlineLocation.trim() === "")) {
      return false;
    }
    return true;
  }, {
    message: "Offline location is required when location is Offline",
    path: ["offlineLocation"]
  }).refine((data) => {
    if (data.isFree === false && (data.fee === undefined || data.fee === null)) {
      return false;
    }
    return true;
  }, {
    message: "Fee is required when course is not free",
    path: ["fee"]
  })
});

export const ValidationCourse = {
  courseValidationPost,
  courseValidationUpdate
};