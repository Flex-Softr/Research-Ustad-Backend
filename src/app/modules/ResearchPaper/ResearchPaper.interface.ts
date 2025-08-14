import { Types } from "mongoose";

export interface IAuthor {
  name: string;
  email?: string;
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
    paperType?: "journal" | "conference"; 
    status: "published" | "ongoing";
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