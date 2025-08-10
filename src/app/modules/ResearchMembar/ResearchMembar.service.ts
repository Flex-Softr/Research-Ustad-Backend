/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from 'http-status';
import mongoose from 'mongoose';
import AppError from '../../errors/AppError';
import { User } from '../user/user.model';
import { IResearchMembar } from './ResearchMembar.interface';
import { ResearchMembar } from './ResearchMembar.model';
const getAllMembar = async () => {
  const result = await ResearchMembar.find()
  return result
  
};

const getSingleMembar = async (id:string) => {
  const result = await ResearchMembar.findById(id)
  return result;
};
// get single membar for user
const singleGetMembarForUser = async (email:string) => {
  const result = await ResearchMembar.findOne({email:email})
  return result;
};

// update membar
const updateMembar = async (id: string, payload: Partial<IResearchMembar>) => {
  const { current, education, socialLinks, ...remainingMembarData } = payload;

  const modifiedUpdatedData: Record<string, unknown> = {
    ...remainingMembarData,
  };
  if (current && Object.keys(current).length) {
    for (const [key, value] of Object.entries(current)) {
      modifiedUpdatedData[`current.${key}`] = value;
    }
  }
if(education && Object.keys(education).length){
  for(const[key, value] of Object.entries(education)){
    modifiedUpdatedData[`education.${key}`]=value
  }
}
  if (socialLinks && Object.keys(socialLinks).length) {
    for (const [key, value] of Object.entries(socialLinks)) {
      modifiedUpdatedData[`socialLinks.${key}`] = value;
    }
  }
  const result = await ResearchMembar.findByIdAndUpdate(id, modifiedUpdatedData, {
    new: true,
    runValidators: true,
  });
  return result;
};
// update user membar
const updateUserMembar = async (email: string, payload: Partial<IResearchMembar>) => {
  const { current, education, socialLinks, ...remainingMembarData } = payload;

  const modifiedUpdatedData: Record<string, unknown> = {
    ...remainingMembarData,
  };
  if (current && Object.keys(current).length) {
    for (const [key, value] of Object.entries(current)) {
      modifiedUpdatedData[`current.${key}`] = value;
    }
  }
if(education && Object.keys(education).length){
  for(const[key, value] of Object.entries(education)){
    modifiedUpdatedData[`education.${key}`]=value
  }
}
  if (socialLinks && Object.keys(socialLinks).length) {
    for (const [key, value] of Object.entries(socialLinks)) {
      modifiedUpdatedData[`socialLinks.${key}`] = value;
    }
  }
  console.log(email, modifiedUpdatedData);
  const result = await ResearchMembar.updateOne({email}, modifiedUpdatedData, {
    new: true,
    runValidators: true,
  });
  return result;
};

const deleteMembar = async (id: string) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const deletedMembar = await ResearchMembar.findByIdAndDelete(
      id
    );
    if (!deletedMembar) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Failed to delete user');
    }

    const userId = deletedMembar.user;

    const deletedUser = await User.findByIdAndDelete(
      userId);

    if (!deletedUser) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Failed to delete user');
    }

    await session.commitTransaction();
    await session.endSession();

    return deletedMembar;
  } catch (err: any) {
    await session.abortTransaction();
    await session.endSession();
    throw new Error(err);
  }
};

export const ResearchServices = {
    getSingleMembar,
    updateMembar,
    deleteMembar,
    getAllMembar,
    updateUserMembar,
    singleGetMembarForUser};
