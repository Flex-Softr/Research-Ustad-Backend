import { z } from "zod";

export const researchPaperSchema = z.object({
    body:z.object({
        year: z.number().min(1900).max(new Date().getFullYear()), 
        title: z.string().min(5, "Title must be at least 5 characters"),
        authors: z.array(z.string().min(2, "Author name must be at least 2 characters")),
        journal: z.string().min(3, "Journal name must be at least 3 characters"),
        volume: z.string().optional(),
        impactFactor: z.number().min(0).max(50).optional(), 
        journalRank: z.string().optional(),
        visitLink: z.string().url("Invalid URL format"),
        paperType: z.enum(["journal", "conference"]).optional(),
        isApproved: z.boolean().optional(),
    })
 
});
