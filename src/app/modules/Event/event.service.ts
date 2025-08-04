import { io } from '../../utils/socket'; // Socket emitter
import AppError from '../../errors/AppError';
import { IEvent } from './event.interface';
import { eventModel } from './event.model';

const Getevent = async () => {
  const result = await eventModel.find();
  return result;
};

const GetSingleEvent = async (id: string) => {
  const result = await eventModel.findById(id);
  if (!result) {
    throw new AppError(404, 'Event not found');
  }
  return result;
};

const Postevent = async (body: IEvent) => {
  // Convert string dates to Date objects
  const eventData = {
    ...body,
    startDate: new Date(body.startDate),
    endDate: new Date(body.endDate),
  };
  
  const result = await eventModel.create(eventData);
  const event = await eventModel.find();
  io.emit('eventUpdate', event);
  return result;
};

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
  const events = await eventModel.find();
  io.emit('eventUpdate', events);
  return result;
};
const Deletedevent = async (id: string) => {
  const result = await eventModel.findByIdAndDelete(id);
  if (!result) {
    throw new AppError(404, 'This event is not found');
  }
  const events = await eventModel.find();
  io.emit('eventUpdate', events);
  return result;
};
export const eventService = {
  Getevent,
  GetSingleEvent,
  Postevent,
  Updateevent,
  Deletedevent,
};
