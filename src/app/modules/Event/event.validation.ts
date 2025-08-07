import { z } from 'zod';

const speakerSchema = z.object({
  name: z.string().min(1, 'Speaker name is required'),
  bio: z.string().min(1, 'Speaker bio is required'),
  imageUrl: z.string().optional().default(''),
});

const eventValidationPost = z.object({
  title: z.string().min(1, { message: 'Title is required' }),
  description: z.string().min(1, { message: 'Description is required' }),
  agenda: z.string().min(1, { message: 'Agenda is required' }),
  startDate: z.string().min(1, { message: 'Start date is required' }),
  endDate: z.string().min(1, { message: 'End date is required' }),
  location: z.string().min(1, { message: 'Location is required' }),
  imageUrl: z.string().optional(),
  registrationLink: z.string().min(1, { message: 'Registration link is required' }),
  speakers: z.array(speakerSchema).min(1, 'At least one speaker is required'),
  category: z.string().min(1, { message: 'Category is required' }),
  status: z.enum(['upcoming', 'ongoing', 'finished']).default('upcoming'),
  eventDuration: z.number().min(1, { message: 'Event duration is required' }),
  maxAttendees: z.number().min(1, { message: 'Max attendees is required' }),
  registrationFee: z.number().min(0, { message: 'Registration fee must be 0 or greater' }),
});

const eventValidationUpdate = z.object({
  title: z.string().min(1, { message: 'Title is required' }).optional(),
  description: z.string().min(1, { message: 'Description is required' }).optional(),
  agenda: z.string().min(1, { message: 'Agenda is required' }).optional(),
  startDate: z.string().min(1, { message: 'Start date is required' }).optional(),
  endDate: z.string().min(1, { message: 'End date is required' }).optional(),
  location: z.string().min(1, { message: 'Location is required' }).optional(),
  speakers: z.array(speakerSchema).optional(),
  imageUrl: z.string().optional(),
  registrationLink: z.string().min(1, { message: 'Registration link is required' }).optional(),
  category: z.string().min(1, { message: 'Category is required' }).optional(),
  status: z.enum(['upcoming', 'ongoing', 'finished']).optional(),
  eventDuration: z.number().min(1, { message: 'Event duration is required' }).optional(),
  maxAttendees: z.number().min(1, { message: 'Max attendees is required' }).optional(),
});

export const Validationevent = {
  eventValidationPost,
  eventValidationUpdate,
};
