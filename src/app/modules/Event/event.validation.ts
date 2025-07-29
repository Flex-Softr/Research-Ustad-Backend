import { z } from 'zod';

// const speakerSchema = z.object({
//   name: z.string().min(1, 'Speaker name is required'),
//   bio: z.string().min(1, 'Speaker bio is required'),
//   imageUrl: z
//     .string()
//     .url('Invalid image URL')
//     .or(z.literal('').transform(() => '')), // allow empty string here
// });

const eventValidationPost = z.object({
  // title: z.string().min(1, { message: 'Title is required' }),
  // description: z.string().min(1, { message: 'Description is required' }),
  // startDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
  //   message: 'Invalid start date format',
  // }),
  // location: z.string().min(1, { message: 'Location is required' }),
  // imageUrl: z
  //   .string()
  //   .url({ message: 'Invalid event image URL format' })
  //   .or(z.literal('').transform(() => ''))
  //   .optional(), // allow empty string here
  // registrationLink: z
  //   .string()
  //   .url({ message: 'Invalid registration link format' })
  //   .or(z.literal('').transform(() => '')), // allow empty string here
  // speakers: z.array(speakerSchema).min(1, 'At least one speaker is required'),
  // category: z.string().min(1, { message: 'Category is required' }),
  // status: z.enum(['upcoming', 'ongoing', 'finished']).optional(),
  // eventDuration: z.number().min(1, { message: 'eventDuration is required' }),
});

const eventValidationUpdate = z.object({
  // body: z.object({
  //   title: z.string().min(1, { message: 'Title is required' }).optional(),
  //   description: z
  //     .string()
  //     .min(1, { message: 'Description is required' })
  //     .optional(),
  //   startDate: z
  //     .string()
  //     .refine((val) => !isNaN(Date.parse(val)), {
  //       message: 'Invalid start date format',
  //     })
  //     .optional(),
  //   endDate: z
  //     .string()
  //     .refine((val) => !isNaN(Date.parse(val)), {
  //       message: 'Invalid end date format',
  //     })
  //     .optional(),
  //   location: z.string().min(1, { message: 'Location is required' }).optional(),
  //   speakers: z
  //     .array(
  //       z
  //         .object({
  //           name: z
  //             .string()
  //             .min(1, { message: 'Speaker name is required' })
  //             .optional(),
  //           bio: z
  //             .string()
  //             .min(1, { message: 'Speaker bio is required' })
  //             .optional(),
  //           imageUrl: z.string().url('Invalid image URL'),
  //         })
  //         .optional(),
  //     )
  //     .optional(),
  //   // imageUrl: z.string().url({ message: "Invalid event image URL format" }).optional(),
  //   imageUrl: z.string().url({ message: 'Invalid event image URL format' }).optional(),
  //   registrationLink: z
  //     .string()
  //     .url({ message: 'Invalid registration link format' }),

  //   category: z.string().min(1, { message: 'Category is required' }).optional(),
  //   status: z.enum(['upcoming', 'ongoing', 'finished']).optional(),
  //   eventDuration: z
  //     .number()
  //     .min(1, { message: 'eventDuration is required' })
  //     .optional(),
  // }),
});
export const Validationevent = {
  eventValidationPost,
  eventValidationUpdate,
};
