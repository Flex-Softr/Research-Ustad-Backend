import { Types } from "mongoose";

export interface IInternationalConference {
  _id?: Types.ObjectId;
  title: string;
  description: string;
  imageUrl: string;
  createdAt?: Date;
  updatedAt?: Date;
}
