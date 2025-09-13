import mongoose, { Schema } from "mongoose";
import { IResearchPaper, IAuthor } from "./ResearchPaper.interface";

const ResearchPaperSchema = new Schema<IResearchPaper>(
  {
    year: { type: Number, required: true },
    title: { type: String, required: true },
    authors: [{
      // For registered users (preferred)
      user: { 
        type: Schema.Types.ObjectId, 
        ref: 'User',
        required: false 
      },
      
      // For custom authors (when no user ObjectId)
      name: { type: String, required: false },
      
      // Role for both registered and custom authors
      role: { type: String, required: true },
      
      // Additional metadata
      isRegisteredUser: { type: Boolean, default: false },
    }],
    journal: { type: String, required: true },
    volume: { type: String },
    impactFactor: { type: Number },
    journalRank: { type: String },
    visitLink: { type: String },
    paperType: { type: String, enum: ["journal", "conference", "book chapter"] },
    status: { type: String, enum: ["published", "ongoing"], default: "ongoing" },
    isApproved: { type: Boolean, default: false },
    abstract: { type: String },
    keywords: { type: [String] },
    citations: { type: Number, default: 0 },
    researchArea: { type: String },
    funding: { type: String },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true }, 
  },
  { timestamps: true }
);

// Add validation to ensure either user ObjectId or name is provided
ResearchPaperSchema.path('authors').validate(function(authors: IAuthor[]) {
  if (!authors || authors?.length === 0) {
    return false;
  }
  
  for (const author of authors) {
    if (!author.user && !author.name) {
      return false;
    }
  }
  return true;
}, 'Each author must have either a user reference or a name');

// Add indexes for better query performance
ResearchPaperSchema.index({ 'authors.user': 1 });
ResearchPaperSchema.index({ 'authors.name': 1 });
ResearchPaperSchema.index({ user: 1 });
ResearchPaperSchema.index({ isApproved: 1 });

export const ResearchPaper = mongoose.model<IResearchPaper>("ResearchPaper", ResearchPaperSchema);
