import { z } from "zod";

const authorSchema = z.object({
  name: z.string().min(2, "Author name must be at least 2 characters"),
  email: z.string().email("Invalid email format").optional().or(z.literal(""))
});

export const researchPaperSchema = z.object({
    body:z.object({
        year: z.number().min(1900).max(new Date().getFullYear()), 
        title: z.string().min(5, "Title must be at least 5 characters"),
        authors: z.array(authorSchema).min(1, "At least one author is required"),
        journal: z.string().min(3, "Journal name must be at least 3 characters"),
        volume: z.string().optional(),
        impactFactor: z.number().min(0).max(50).optional(), 
        journalRank: z.string().optional(),
        visitLink: z.string().url("Invalid URL format"),
        paperType: z.enum(["journal", "conference"]).optional(),
        status: z.enum(["published", "ongoing"]).optional(),
        isApproved: z.boolean().optional(),
        abstract: z.string().min(10, "Abstract must be at least 10 characters").optional(),
        keywords: z.array(z.string().min(2, "Keyword must be at least 2 characters")).optional(),
        citations: z.number().min(0, "Citations cannot be negative").optional(),
        researchArea: z.string().min(2, "Research area must be at least 2 characters").optional(),
        funding: z.string().min(2, "Funding information must be at least 2 characters").optional(),
    })
 
});
