import mongoose from "mongoose";

export interface IBlog {
  title: string;
  author: mongoose.Types.ObjectId;
  category: string;
  imageUrl?: string;
  content: string;
  publishedDate: Date;
}




