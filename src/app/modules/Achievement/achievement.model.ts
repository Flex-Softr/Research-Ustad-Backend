import mongoose, { Schema } from "mongoose";
import { IAchievement } from "./achievement.interface";

const achievementSchema = new Schema<IAchievement>(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
    },
    imageUrl: {
      type: String,
      required: [true, "Image is required"],
    },
  },
  {
    timestamps: true,
  }
);

const Achievement = mongoose.model<IAchievement>("Achievement", achievementSchema);

export default Achievement;
