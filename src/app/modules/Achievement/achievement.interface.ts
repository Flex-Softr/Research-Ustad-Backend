import { Types } from "mongoose";

export interface IAchievement {
  _id?: Types.ObjectId;
  title: string;
  description: string;
  imageUrl: string;
  createdAt?: Date;
  updatedAt?: Date;
}
