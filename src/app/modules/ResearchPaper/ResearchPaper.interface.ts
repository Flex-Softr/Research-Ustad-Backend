import { Types } from "mongoose";

export interface IResearchPaper{
    year: number;
    title: string;
    authors: string[]; 
    journal: string;
    volume?: string; 
    impactFactor?: number; 
    journalRank?: string; 
    visitLink: string;
    paperType?: "journal" | "conference"; 
    isApproved: boolean;
    createdAt?: Date;
    updatedAt?: Date;
    user: Types.ObjectId
}