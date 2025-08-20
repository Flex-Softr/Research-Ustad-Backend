import { z } from "zod";

const blogValidationPost = z.object({
  title: z.string().min(1, { message: "Title is required" }).max(200, { message: "Title cannot exceed 200 characters" }),
  imageUrl: z.string().optional(),
  category: z.string().min(1, { message: "Category is required" }),
  content: z.string().min(10, { message: "Content must be at least 10 characters long" }),
  publishedDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid published date format",
  }).optional(),
  status: z.enum(["pending", "approved", "rejected"]).optional(),
}).superRefine((data, ctx) => {
  // Additional validation if needed
  if (data.title && data.title.trim().length === 0) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Title cannot be empty",
      path: ['title'],
    });
  }
  
  if (data.content && data.content.trim().length === 0) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Content cannot be empty",
      path: ['content'],
    });
  }
});

const blogValidationUpdate = z.object({
  title: z.string().min(1, { message: "Title is required" }).max(200, { message: "Title cannot exceed 200 characters" }).optional(),
  imageUrl: z.string().optional(),
  category: z.string().min(1, { message: "Category is required" }).optional(),
  content: z.string().min(10, { message: "Content must be at least 10 characters long" }).optional(),
  publishedDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid published date format",
  }).optional(),
  status: z.enum(["pending", "approved", "rejected"]).optional(),
}).superRefine((data, ctx) => {
  // Additional validation if needed
  if (data.title !== undefined && data.title.trim().length === 0) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Title cannot be empty",
      path: ['title'],
    });
  }
  
  if (data.content !== undefined && data.content.trim().length === 0) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Content cannot be empty",
      path: ['content'],
    });
  }
});

// Validation for status update
const blogStatusValidation = z.object({
  status: z.enum(["pending", "approved", "rejected"], {
    // message: "Status must be pending, approved, or rejected"
    required_error: "Status is required",
    invalid_type_error: "Status must be pending, approved, or rejected",
  }),
});

export const Validationblog = {
  blogValidationPost,
  blogValidationUpdate,
  blogStatusValidation,
};
