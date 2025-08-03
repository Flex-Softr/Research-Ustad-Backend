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
  const result = await eventModel.create(body);
  const event = await eventModel.find();
  io.emit('eventUpdate', event);
  return result;
};

const Updateevent = async (id: string, body: IEvent) => {
  const result = await eventModel.findByIdAndUpdate(id, body, { new: true });
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
