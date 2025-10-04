import { io } from '../../utils/socket'; // Socket emitter
import AppError from '../../errors/AppError';
import { IEvent } from './event.interface';
import { eventModel } from './event.model';

// get all event
const Getevent = async () => {
  const result = await eventModel.find().sort({ createdAt: -1 });
  return result;
};

// get single event
const GetSingleEvent = async (id: string) => {
  const result = await eventModel.findById(id);
  if (!result) {
    throw new AppError(404, 'Event not found');
  }
  return result;
};

// create event (optimized)
const Postevent = async (body: IEvent) => {
  const eventData = {
    ...body,
    startDate: new Date(body.startDate),
    endDate: new Date(body.endDate),
  };
  
  const result = await eventModel.create(eventData);
  
  // Optimize: Only emit socket update, don't fetch all events
  io.emit('eventUpdate', { type: 'created', eventId: result._id });
  
  return result;
};

// update event
const Updateevent = async (id: string, body: IEvent) => {
  // Convert string dates to Date objects if they exist
  const updateData: any = { ...body };
  if (body.startDate) {
    updateData.startDate = new Date(body.startDate);
  }
  if (body.endDate) {
    updateData.endDate = new Date(body.endDate);
  }
  
  const result = await eventModel.findByIdAndUpdate(id, updateData, { new: true });
  
  // Optimize: Only emit socket update, don't fetch all events
  io.emit('eventUpdate', { type: 'updated', eventId: id });
  
  return result;
};

// delete event
const Deletedevent = async (id: string) => {
  const result = await eventModel.findByIdAndDelete(id);
  if (!result) {
    throw new AppError(404, 'This event is not found');
  }
  
  // Optimize: Only emit socket update, don't fetch all events
  io.emit('eventUpdate', { type: 'deleted', eventId: id });
  
  return result;
};
export const eventService = {
  Getevent,
  GetSingleEvent,
  Postevent,
  Updateevent,
  Deletedevent,
};
