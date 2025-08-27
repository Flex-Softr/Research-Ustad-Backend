import { Types } from "mongoose";

export interface IAuthor {
  // For registered users (preferred)
  user?: Types.ObjectId;
  
  // For custom authors (when no user ObjectId)
  name?: string;
  
  // Role for both registered and custom authors
  role: string;
  
  // Additional metadata
  isRegisteredUser?: boolean;
}

export interface IResearchPaper{
    year: number;
    title: string;
    authors: IAuthor[]; 
    journal: string;
    volume?: string; 
    impactFactor?: number; 
    journalRank?: string; 
    visitLink: string;
    paperType?: "journal" | "conference" | "book"; 
    status: "published" | "ongoing" | "under_review" | "in_preparation" | "revision";
    isApproved: boolean;
    abstract?: string;
    keywords?: string[];
    citations?: number;
    researchArea?: string;
    funding?: string;
    createdAt?: Date;
    updatedAt?: Date;
    user: Types.ObjectId
}