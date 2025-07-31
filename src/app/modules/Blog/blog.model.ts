import mongoose, { model, Schema } from "mongoose";
import { IBlog } from "./blog.interface";

const SchemaBlog = new Schema<IBlog>(
  {
    title: { type: String, required: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    imageUrl: { type: String, required: false },
    category: { type: String, required: true },
    content: { type: String, required: true },
    publishedDate: { type: Date, default: () => new Date() } 
  },
  { timestamps: true }
);

export const Blog = model<IBlog>("Blog", SchemaBlog);
