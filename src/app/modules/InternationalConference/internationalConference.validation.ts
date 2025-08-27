import { z } from "zod";

const createInternationalConferenceSchema = z.object({
  body: z.object({
    title: z
      .string({ required_error: "Title is required" })
      .min(1, "Title cannot be empty"),
    description: z
      .string({ required_error: "Description is required" })
      .min(1, "Description cannot be empty"),
    imageUrl: z
      .string({ required_error: "Image is required" })
      .min(1, "Image is required"),
  }),
});

const updateInternationalConferenceSchema = z.object({
  body: z.object({
    title: z.string().min(1, "Title cannot be empty").optional(),
    description: z.string().min(1, "Description cannot be empty").optional(),
    imageUrl: z.string().min(1, "Image is required").optional(),
  }),
});

export const InternationalConferenceValidation = {
  createInternationalConferenceSchema,
  updateInternationalConferenceSchema,
};
