import { Types } from "mongoose";
export interface IResearchMembar {
      user: Types.ObjectId;
      password?:string
      profileImg?: string;
      fullName: string; 
    email: string;
    contactNo: string;
    designation: "Advisor" | "Lead" | "Mentor_Panel" | "Lead_Research_Associate" | "Research_Associate"; 
    current?: {
      institution?: string;
      department?: string;
      degree?: string;
    }; 
    education?: {
      degree?: string;
      field?: string;
      institution?: string;
      status?: "Ongoing" | "Completed";
      scholarship?: string;
    }; 
    research?: string[]; 
    shortBio?: string; 
    socialLinks?: {
      google_scholar?: string;
      researchgate?: string;
      linkedin?: string;
    },
    isDeleted:boolean;
  }
  