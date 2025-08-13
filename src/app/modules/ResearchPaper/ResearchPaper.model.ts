import mongoose, { Schema } from "mongoose";
import { IResearchPaper } from "./ResearchPaper.interface";

const ResearchPaperSchema = new Schema<IResearchPaper>(
  {
    year: { type: Number, required: true },
    title: { type: String, required: true },
    authors: { type: [String], required: true },
    journal: { type: String, required: true },
    volume: { type: String },
    impactFactor: { type: Number },
    journalRank: { type: String },
    visitLink: { type: String, required: true },
    paperType: { type: String, enum: ["journal", "conference"] },
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

export const ResearchPaper = mongoose.model<IResearchPaper>("ResearchPaper", ResearchPaperSchema);
