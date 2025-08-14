/* eslint-disable no-unused-vars */
import { Model, Types } from 'mongoose';
import { USER_ROLE } from './user.constant'

export interface TUser {
  _id: Types.ObjectId,
  email: string;
  password: string;
  needsPasswordChange: boolean;
  passwordChangedAt?: Date;
  designation: "Advisor" | "Lead" | "Mentor_Panel" | "Lead_Research_Associate" | "Research_Associate"|"superAdmin"; 
  status: 'in-progress' | 'blocked';
  role:"admin"|'user'|'superAdmin'

  fullName: string;
  image: string;
  
  // Research member specific fields (consolidated from ResearchMembar)
  contactNo?: string;
  current?: {
    institution?: string;
    department?: string;
    degree?: string;
    inst_designation?: string;
  };
  education?: {
    degree?: string;
    field?: string;
    institution?: string;
    status?: "Ongoing" | "Completed" | "";
    scholarship?: string;
  };
  research?: string[];
  shortBio?: string;
  socialLinks?: {
    researchgate?: string;
    google_scholar?: string;
    linkedin?: string;
  };
  expertise?: string[];
  awards?: string[];
  conferences?: Array<{
    name: string;
    role: string;
    topic: string;
  }>;
  
  // Publications array to track user's authored papers
  publications?: Types.ObjectId[];
}

export interface UserModel extends Model<TUser> {
  isUserExistsByCustomId(email: string): Promise<TUser>;
  isPasswordMatched(
    plainTextPassword: string,
    hashedPassword: string,
  ): Promise<boolean>;
}

export type TUserRole = keyof typeof USER_ROLE;
