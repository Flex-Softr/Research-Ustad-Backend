import { z } from 'zod';

// const speakerSchema = z.object({
//   // name: z.string().min(1, 'Speaker name is required'),
//   // bio: z.string().min(1, 'Speaker bio is required'),
//   // imageUrl: z.string().optional(),
// });

const eventValidationPost = z.object({
  // title: z.string().min(1, { message: 'Title is required' }),
  // description: z.string().min(1, { message: 'Description is required' }),
  // startDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
  //   message: 'Invalid start date format',
  // }),
  // endDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
  //   message: 'Invalid end date format',
  // }),
  // location: z.string().min(1, { message: 'Location is required' }),
  // imageUrl: z.string().optional(),
  // registrationLink: z.string().min(1, { message: 'Registration link is required' }),
  // speakers: z.array(speakerSchema).min(1, 'At least one speaker is required'),
  // category: z.string().min(1, { message: 'Category is required' }),
  // status: z.enum(['upcoming', 'ongoing', 'finished']).optional(),
  // eventDuration: z.number().min(1, { message: 'Event duration is required' }),
  // maxAttendees: z.number().min(1, { message: 'Max attendees is required' }).optional(),
});

const eventValidationUpdate = z.object({
  // title: z.string().min(1, { message: 'Title is required' }).optional(),
  // description: z.string().min(1, { message: 'Description is required' }).optional(),
  // startDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
  //   message: 'Invalid start date format',
  // }).optional(),
  // endDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
  //   message: 'Invalid end date format',
  // }).optional(),
  // location: z.string().min(1, { message: 'Location is required' }).optional(),
  // speakers: z.array(speakerSchema).optional(),
  // imageUrl: z.string().optional(),
  // registrationLink: z.string().min(1, { message: 'Registration link is required' }).optional(),
  // category: z.string().min(1, { message: 'Category is required' }).optional(),
  // status: z.enum(['upcoming', 'ongoing', 'finished']).optional(),
  // eventDuration: z.number().min(1, { message: 'Event duration is required' }).optional(),
  // maxAttendees: z.number().min(1, { message: 'Max attendees is required' }).optional(),
});

export const Validationevent = {
  eventValidationPost,
  eventValidationUpdate,
};
