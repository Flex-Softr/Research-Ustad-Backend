import mongoose, { Schema } from "mongoose";
import { IInternationalConference } from "./internationalConference.interface";

const internationalConferenceSchema = new Schema<IInternationalConference>(
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

const InternationalConference = mongoose.model<IInternationalConference>(
  "InternationalConference",
  internationalConferenceSchema
);

export default InternationalConference;
