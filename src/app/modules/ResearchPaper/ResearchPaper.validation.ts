import { z } from 'zod';

const authorSchema = z
  .object({
    // For registered users (preferred) - handle both string and object
    user: z
      .union([
        z.string(), // ObjectId as string
        z.object({ _id: z.string() }).transform((obj) => obj._id), // User object with _id
        z.object({ id: z.string() }).transform((obj) => obj.id), // User object with id
      ])
      .optional(),

    // For custom authors (when no user ObjectId)
    name: z
      .string()
      .min(2, 'Author name must be at least 2 characters')
      .optional(),

    // Role for both registered and custom authors
    role: z.string().min(1, 'Author role is required'),

    // Additional metadata
    isRegisteredUser: z.boolean().optional(),
  })
  .refine(
    (data) => {
      // Either user ObjectId or name must be provided
      return data.user || data.name;
    },
    {
      message: 'Each author must have either a user reference or a name',
      path: ['name'],
    },
  );

// More flexible author schema for updates
const authorUpdateSchema = z
  .object({
    // For registered users (preferred) - handle both string and object
    user: z
      .union([
        z.string(), // ObjectId as string
        z.object({ _id: z.string() }).transform((obj) => obj._id), // User object with _id
        z.object({ id: z.string() }).transform((obj) => obj.id), // User object with id
      ])
      .optional(),

    // For custom authors (when no user ObjectId)
    name: z
      .string()
      .min(2, 'Author name must be at least 2 characters')
      .optional(),

    // Role for both registered and custom authors
    role: z.string().min(1, 'Author role is required').optional(),

    // Additional metadata
    isRegisteredUser: z.boolean().optional(),
  })
  .refine(
    (data) => {
      // Either user ObjectId or name must be provided
      return data.user || data.name;
    },
    {
      message: 'Each author must have either a user reference or a name',
      path: ['name'],
    },
  );

// Preprocess function to handle potential data format issues
const preprocessAuthors = (authors: unknown) => {
  if (!Array.isArray(authors)) return authors;

  return authors?.map((author) => {
    // Handle case where author might be a string
    if (typeof author === 'string') {
      return {
        name: author,
        role: 'Author',
        isRegisteredUser: false,
      };
    }

    // Handle case where author might be an object but missing required fields
    if (typeof author === 'object' && author !== null) {
      const authorObj = author as Record<string, unknown>;

      // Handle user field - extract ID if it's an object
      let userId: string | undefined;
      if (authorObj.user) {
        if (typeof authorObj.user === 'string') {
          userId = authorObj.user;
        } else if (
          typeof authorObj.user === 'object' &&
          authorObj.user !== null
        ) {
          const userObj = authorObj.user as Record<string, unknown>;
          userId = (userObj._id || userObj.id) as string;
        }
      }

      return {
        user: userId,
        name: authorObj.name || undefined,
        role: authorObj.role || 'Author',
        isRegisteredUser: authorObj.isRegisteredUser || !!userId,
      };
    }

    return author;
  });
};

export const researchPaperSchema = z.object({
  body: z.object({
    year: z.number().min(1, 'Year is required'),
    title: z.string().min(1, 'Title is required'),
    authors: z.array(authorSchema).min(1, 'At least one author is required'),
    journal: z.string().min(1, 'Journal is required'),
    volume: z.string().optional(),
    impactFactor: z.number().min(0).max(50).optional(),
    journalRank: z.string().optional(),
    visitLink: z.string().url('Invalid URL format').optional(),
    paperType: z.enum(['journal', 'conference', 'book chapter']),
    status: z
      .enum([
        'published',
        'ongoing',
      ])
      .optional(),
    isApproved: z.boolean().optional(),
    abstract: z.string().optional(),
    keywords: z
      .array(z.string().min(2, 'Keyword must be at least 2 characters'))
      .optional(),
    citations: z.number().min(0, 'Citations cannot be negative').optional(),
    researchArea: z
      .string()
      .min(2, 'Research area must be at least 2 characters')
      .optional(),
    funding: z
      .string()
      .min(2, 'Funding information must be at least 2 characters')
      .optional(),
  }),
});

// Update schema that allows partial updates
export const researchPaperUpdateSchema = z.object({
  body: z
    .object({
      year: z.number().min(1, 'Year is required').optional(),
      title: z.string().min(1, 'Title is required').optional(),
      authors: z
        .preprocess(
          preprocessAuthors,
          z.array(authorUpdateSchema).min(1, 'At least one author is required'),
        )
        .optional(),
      journal: z.string().min(1, 'Journal is required').optional(),
      volume: z.string().optional(),
      impactFactor: z.number().min(0).max(50).optional(),
      journalRank: z.string().optional(),
      visitLink: z.string().url('Invalid URL format').optional(),
      paperType: z.enum(['journal', 'conference', 'book chapter']).optional(),
      status: z
        .enum([
          'published',
          'ongoing',
        ])
        .optional(),
      isApproved: z.boolean().optional(),
      abstract: z.string().optional(),
      keywords: z
        .array(z.string().min(2, 'Keyword must be at least 2 characters'))
        .optional(),
      citations: z.number().min(0, 'Citations cannot be negative').optional(),
      researchArea: z
        .string()
        .min(2, 'Research area must be at least 2 characters')
        .optional(),
      funding: z
        .string()
        .min(2, 'Funding information must be at least 2 characters')
        .optional(),
    })
    .refine(
      (data) => {
        // Ensure at least one field is provided for update
        return Object.keys(data)?.length > 0;
      },
      {
        message: 'At least one field must be provided for update',
      },
    ),
});
