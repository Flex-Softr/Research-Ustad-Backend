import { z } from "zod";

const categoryValidationPost = z.object({
  body: z.object({
    name: z.string().min(1, "Category name is required").max(50, "Category name cannot exceed 50 characters"),
    description: z.string().optional(),
    status: z.enum(["active", "inactive"]).optional().default("active")
  })
});

const categoryValidationUpdate = z.object({
  body: z.object({
    name: z.string().min(1, "Category name is required").max(50, "Category name cannot exceed 50 characters").optional(),
    description: z.string().optional(),
    status: z.enum(["active", "inactive"]).optional()
  })
});

export const ValidationCategory = {
  categoryValidationPost,
  categoryValidationUpdate
}; 