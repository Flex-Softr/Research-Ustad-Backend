import { z } from "zod";

const blogValidationPost = z.object({
  // body: z.object({
  //   title: z.string().min(1, { message: "Title is required" }),
  //   author: z.string().refine((id) => /^[0-9a-fA-F]{24}$/.test(id), {
  //     message: "Invalid author ID format",
  //   }).optional(),
  //   imageUrl: z.string().optional(),
  //   category: z.string().min(1, { message: "Category is required" }),
  //   content: z.string().min(1, { message: "Content is required" }),
  //   publishedDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
  //     message: "Invalid published date format",
  //   }).optional(),
  // }),
});

const blogValidationUpdate = z.object({
  // body: z.object({
  //   title: z.string().min(1, { message: "Title is required" }).optional(),
  //   author: z.string().refine((id) => /^[0-9a-fA-F]{24}$/.test(id), {
  //     message: "Invalid author ID format",
  //   }).optional(),
  //   imageUrl: z.string().optional(),
  //   category: z.string().min(1, { message: "Category is required" }).optional(),
  //   content: z.string().min(1, { message: "Content is required" }).optional(),
  //   publishedDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
  //     message: "Invalid published date format",
  //   }).optional(),
  // }),
});

export const Validationblog = {
  blogValidationPost,
  blogValidationUpdate,
};
