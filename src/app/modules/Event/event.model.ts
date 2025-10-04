import mongoose, { Schema } from 'mongoose';
import { IEvent } from './event.interface';

const speakerSchema = new Schema(
  {
    name: { type: String, required: true },
    bio: { type: String, required: true },
    imageUrl: { type: String },
  },
  { _id: false },
);

export const eventSchema = new Schema<IEvent>(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    agenda: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    location: { type: String, required: true },
    speakers: { type: [speakerSchema], required: true },
    imageUrl: { type: String },
    registrationLink: { type: String, required: true },
    status: {
      type: String,
      enum: ['upcoming', 'ongoing', 'finished'],
      default: 'upcoming',
    },
    eventDuration: { type: Number, required: true },
    maxAttendees: { 
      type: Number, 
      default: 100,
      validate: {
        validator: function(value: number) {
          // Ensure maxAttendees is greater than or equal to registered
          return value >= (this as any).registered;
        },
        message: 'Max attendees cannot be less than current registered attendees'
      }
    },
    registered: { type: Number, default: 0, min: 0 }, // Number of people currently registered
    registrationFee: { type: Number, default: 0, min: 0 }, // 0 for free events
  },
  { timestamps: true },
);

// Add indexes for better performance
eventSchema.index({ status: 1 });
eventSchema.index({ startDate: 1 });
eventSchema.index({ location: 1 });
eventSchema.index({ createdAt: -1 });

eventSchema.pre('findOneAndUpdate', function (next) {
  const update = this.getUpdate() as Partial<IEvent>;
  if (!update) return next();

  const now = new Date();
  if (update.startDate) {
    const eventStart = new Date(update.startDate);
    const eventEnd = new Date(
      eventStart.getTime() + (update.eventDuration || 0) * 60000,
    );

    if (now < eventStart) {
      update.status = 'upcoming';
    } else if (now >= eventStart && now <= eventEnd) {
      update.status = 'ongoing';
    } else {
      update.status = 'finished';
    }
  }

  next();
});

export const eventModel = mongoose.model('event', eventSchema);
