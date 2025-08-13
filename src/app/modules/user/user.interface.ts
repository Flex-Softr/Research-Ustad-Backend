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
  // Research member specific fields
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
    status?: "Ongoing" | "Completed";
    scholarship?: string;
  };
  research?: string[];
  shortBio?: string;
  socialLinks?: {
    google_scholar?: string;
    researchgate?: string;
    linkedin?: string;
  };
  expertise?: string[];
  awards?: string[];
  conferences?: Array<{
    name?: string;
    role?: string;
    topic?: string;
  }>;
}

export interface UserModel extends Model<TUser> {
  //instance methods for checking if the user exist
  isUserExistsByCustomId(email: string): Promise<TUser>;
  //instance methods for checking if passwords are matched
  isPasswordMatched(
    plainTextPassword: string,
    hashedPassword: string,
  ): Promise<boolean>;
  isJWTIssuedBeforePasswordChanged(
    passwordChangedTimestamp: Date,
    jwtIssuedTimestamp: number,
  ): boolean;
}

export type TUserRole = keyof typeof USER_ROLE;
