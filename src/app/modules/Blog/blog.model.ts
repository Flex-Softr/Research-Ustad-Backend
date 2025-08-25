import mongoose, { model, Schema } from 'mongoose';
import { IBlog } from './blog.interface';

const SchemaBlog = new Schema<IBlog>(
  {
    title: { type: String, required: true },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    imageUrl: { type: String, required: false },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'blogCategory',
      required: true,
    },
    content: { type: String, required: true },
    publishedDate: { type: Date, default: () => new Date() },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
  },
  { timestamps: true },
);

// ✅ Add indexes here
SchemaBlog.index({ category: 1 });
SchemaBlog.index({ status: 1 });

export const Blog = model<IBlog>('Blog', SchemaBlog);
