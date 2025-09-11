import { z } from 'zod';

const speakerSchema = z.object({
  name: z.string().min(1, 'Speaker name is required'),
  bio: z.string().min(1, 'Speaker bio is required'),
  imageUrl: z.string().min(1, 'Speaker image is required'),
});

const speakerUpdateSchema = z.object({
  name: z.string().min(1, 'Speaker name is required'),
  bio: z.string().min(1, 'Speaker bio is required'),
  imageUrl: z.string().optional(), // Make imageUrl optional for updates
});

const eventValidationPost = z.object({
  title: z.string().min(1, { message: 'Title is required' }), 
  description: z.string().min(1, { message: 'Description is required' }),
  agenda: z.string().min(1, { message: 'Agenda is required' }),
  startDate: z.string().min(1, { message: 'Start date is required' }),
  endDate: z.string().min(1, { message: 'End date is required' }),
  location: z.string().min(1, { message: 'Location is required' }),
  imageUrl: z.string().min(1, { message: 'Event image is required' }),
  registrationLink: z.string().min(1, { message: 'Registration link is required' }),
  speakers: z.array(speakerSchema).min(1, 'At least one speaker is required'),
  status: z.enum(['upcoming', 'ongoing', 'finished']).default('upcoming'),
  eventDuration: z.number().min(1, { message: 'Event duration is required' }),
  maxAttendees: z.number().min(1, { message: 'Max attendees is required' }),
  registered: z.number().min(0, { message: 'Registered count cannot be negative' }).default(0),
  registrationFee: z.number().min(0, { message: 'Registration fee must be 0 or greater' }),
}).superRefine((data, ctx) => {
  if (data.maxAttendees < data.registered) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Max attendees cannot be less than current registered attendees',
      path: ['maxAttendees'],
    });
  }

  // Validate event image is not empty
  if (data.imageUrl && data.imageUrl.trim()?.length === 0) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Event image is required',
      path: ['imageUrl'],
    });
  }

  // Validate all speaker images are not empty
  data.speakers.forEach((speaker, index) => {
    if (speaker.imageUrl && speaker.imageUrl.trim()?.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Speaker image is required',
        path: ['speakers', index, 'imageUrl'],
      });
    }
  });
});

const eventValidationUpdate = z.object({
  title: z.string().min(1, { message: 'Title is required' }).optional(),
  description: z.string().min(1, { message: 'Description is required' }).optional(),
  agenda: z.string().min(1, { message: 'Agenda is required' }).optional(),
  startDate: z.string().min(1, { message: 'Start date is required' }).optional(),
  endDate: z.string().min(1, { message: 'End date is required' }).optional(),
  location: z.string().min(1, { message: 'Location is required' }).optional(),
  speakers: z.array(speakerUpdateSchema).optional(),
  imageUrl: z.string().min(1, { message: 'Event image is required' }).optional(),
  registrationLink: z.string().min(1, { message: 'Registration link is required' }).optional(),
  status: z.enum(['upcoming', 'ongoing', 'finished']).optional(),
  eventDuration: z.number().min(1, { message: 'Event duration is required' }).optional(),
  maxAttendees: z.number().min(1, { message: 'Max attendees is required' }).optional(),
  registered: z.number().min(0, { message: 'Registered count cannot be negative' }).optional(),
}).superRefine((data, ctx) => {
  // Only validate if both fields are present
  if (data.maxAttendees !== undefined && data.registered !== undefined) {
    if (data.maxAttendees < data.registered) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Max attendees cannot be less than current registered attendees',
        path: ['maxAttendees'],
      });
    }
  }

  // Validate event image is not empty if provided
  if (data.imageUrl !== undefined && data.imageUrl.trim()?.length === 0) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Event image is required',
      path: ['imageUrl'],
    });
  }

  // For updates, we don't validate speaker images in superRefine since imageUrl is optional
  // The router will handle setting the correct imageUrl from uploaded files
});

export const Validationevent = {
  eventValidationPost,
  eventValidationUpdate,
};
