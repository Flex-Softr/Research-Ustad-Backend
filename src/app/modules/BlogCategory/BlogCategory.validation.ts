import { z } from "zod";

const blogCategoryValidationPost = z.object({
  body: z.object({
    name: z.string().min(1, "Blog category name is required"),
    description: z.string().optional(),
    status: z.enum(["active", "inactive"]).optional().default("active")
  })
});

const blogCategoryValidationUpdate = z.object({
  body: z.object({
    name: z.string().min(1, "Blog category name is required").optional(),
    description: z.string().optional(),
    status: z.enum(["active", "inactive"]).optional()
  })
});

export const ValidationBlogCategory = {
  blogCategoryValidationPost,
  blogCategoryValidationUpdate
};
