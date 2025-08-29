import { z } from 'zod';

const createContactSchema = z.object({
  body: z.object({
    name: z
      .string({ required_error: 'Name is required' })
      .min(2, 'Name must be at least 2 characters')
      .max(50, 'Name cannot exceed 50 characters'),
    email: z
      .string({ required_error: 'Email is required' })
      .email('Invalid email format'),
    subject: z
      .string({ required_error: 'Subject is required' })
      .min(5, 'Subject must be at least 5 characters')
      .max(100, 'Subject cannot exceed 100 characters'),
    message: z
      .string({ required_error: 'Message is required' })
      .min(10, 'Message must be at least 10 characters')
      .max(1000, 'Message cannot exceed 1000 characters'),
  }),
});

export const ContactValidation = {
  createContactSchema,
};
