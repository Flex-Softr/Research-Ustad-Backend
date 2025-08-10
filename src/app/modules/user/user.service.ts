/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

import httpStatus from 'http-status';
import mongoose from 'mongoose';
import config from '../../config';
import AppError from '../../errors/AppError';
// import { TUser } from './user.interface';
import { sendEmail } from '../../utils/sendEmail';
import { IResearchMembar } from '../ResearchMembar/ResearchMembar.interface';
import { User } from './user.model';
import { ResearchMembar } from '../ResearchMembar/ResearchMembar.model';
import { ResearchPaper } from '../ResearchPaper/ResearchPaper.model';
import { Blog } from '../Blog/blog.model';
import { TUser } from './user.interface';
const createResearchMembar = async (
  file: any | null,
  password: string,
  payload: IResearchMembar,
) => {
  const userData: Partial<TUser> = {};
  userData.password = password || (config.default_password as string);
  userData.designation = payload.designation;
  userData.email = payload.email;
  userData.fullName = payload.fullName;
  const session = await mongoose.startSession();

  try {
    await session.startTransaction();
    
    // Handle file upload - the router already sets payload.profileImg
    if (payload.profileImg) {
      userData.image = payload.profileImg;
    }
    
    const newUser = await User.create([userData], { session });
 
    if (!newUser.length) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Failed to create user');
    }
    payload.email = newUser[0].email;
    payload.user = newUser[0]._id;
    const newStudent = await ResearchMembar.create([payload], { session });
    if (!newStudent.length) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Failed to create Membar');
    }
    const plainPassword = password || (config.default_password as string);

    const subject = 'Welcome to ResearchUstad'
    const emailContent = `
       <h2 style="color: #4CAF50; text-align: center;">Welcome to ResearchUstad!</h2>
    <p>Dear ${payload.fullName},</p>
    <p>Congratulations! Your account has been successfully created on <strong>ResearchUstad</strong>. You now have access to our platform and can start exploring.</p>
    <h3>Your Account Details:</h3>
    <ul>
      <li><strong>Email:</strong>  ${newUser[0].email}</li>
      <li><strong>Password:</strong> ${plainPassword}</li>
      <li><strong>designation:</strong> ${newUser[0].designation}</li>
    </ul>
    <p>For security reasons, we strongly recommend that you change your password immediately after logging in.</p>

    <p><a href="${config.frontend_url} style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Log In</a></p>

    <p>If you have any questions, feel free to reach out to our support team.</p>

    <p>Best regards,</p>
    <p><strong>The ResearchUstad Team</strong></p>
    `;

    await sendEmail(newUser[0].email, emailContent, subject);
    await session.commitTransaction();
    return newStudent;
  } catch (err: any) {
    await session.abortTransaction();
    throw err
  } finally {
    await session.endSession()
  }
};

const createResearchMembars = async (
  payload: IResearchMembar & { role?: string },
) => {
  const userData: Partial<TUser> = {};
  userData.password = payload.password || (config.default_password as string);
  userData.designation = payload.designation;
  userData.email = payload.email;
  userData.fullName = payload.fullName;
  userData.role = payload.role || "user";
  userData.image = payload.profileImg || "https://via.placeholder.com/300x300?text=User";
  const session = await mongoose.startSession();

  try {
     session.startTransaction();
    const newUser = await User.create([userData], { session });
 
    if (!newUser.length) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Failed to create user');
    }
    payload.email = newUser[0].email;
    payload.user = newUser[0]._id;
    const newStudent = await ResearchMembar.create([payload], { session });
    if (!newStudent.length) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Failed to create Membar');
    }
    const plainPassword = payload.password || (config.default_password as string);

    const subject = 'Welcome to ResearchUstad'
    const emailContent = `
       <h2 style="color: #4CAF50; text-align: center;">Welcome to ResearchUstad!</h2>
    <p>Dear ${payload.fullName},</p>
    <p>Congratulations! Your account has been successfully created on <strong>ResearchUstad</strong>. You now have access to our platform and can start exploring.</p>
    <h3>Your Account Details:</h3>
    <ul>
      <li><strong>Email:</strong>  ${newUser[0].email}</li>
      <li><strong>Password:</strong> ${plainPassword}</li>
      <li><strong>designation:</strong> ${newUser[0].designation}</li>
    </ul>
    <p>For security reasons, we strongly recommend that you change your password immediately after logging in.</p>

    <p><a href="${config.frontend_url} style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Log In</a></p>

    <p>If you have any questions, feel free to reach out to our support team.</p>

    <p>Best regards,</p>
    <p><strong>The ResearchUstad Team</strong></p>
    `;

    await sendEmail(newUser[0].email, emailContent, subject);
    await session.commitTransaction();
    // await session.endSession();
    return newStudent;
  } catch (err: any) {
    await session.abortTransaction();
    // await session.endSession();
    throw err
  }finally{
    await session.endSession()
  }
};
const getMe = async (email: string) => {
   const result = await User.findOne({ email: email });
   if (!result) {
     throw new AppError(httpStatus.NOT_FOUND, 'User not found');
   }
   return result
};
const Alluser = async () => {
  const result = await User.find();
  return result
};
const AllInfo = async () => {
  const [
    totalUsers,
    totalResearchMembers,
    totalApprovedPapers,
    totalPendingPapers,
    totalResearchPapers,
    totalBlogs
  ] = await Promise.all([
    User.countDocuments(),
    ResearchMembar.countDocuments(),
    ResearchPaper.countDocuments({ isApproved: true }),
    ResearchPaper.countDocuments({ isApproved: false }),
    ResearchPaper.countDocuments(),
    Blog.countDocuments(),
  ]);

  return {
    totalUsers,
    totalResearchMembers,
    totalApprovedPapers,
    totalPendingPapers,
    totalResearchPapers,
    totalBlogs,
  };
};

const AllInfoForPersonal = async (id:string) => {
  const [
    totalApprovedPapers,
    totalPendingPapers,
    totalResearchPapers,
    totalBlogs
  ] = await Promise.all([
    ResearchPaper.countDocuments({ isApproved: true,user:id }),
    ResearchPaper.countDocuments({ isApproved: false, user:id}),
    ResearchPaper.countDocuments({user:id}),
    Blog.countDocuments({author:id}),
  ]);

  return {
    totalApprovedPapers,
    totalPendingPapers,
    totalResearchPapers,
    totalBlogs,
  };
};

const userToadmin = async (id:string) => {
  const user = await User.findById(id);
  if (!user) {
    throw new Error("User not found");
  }
  const newRole = user.role === "admin" ? "user" : "admin";
  const result = await User.findByIdAndUpdate(
    id,
    { role: newRole },
    { new: true, runValidators: true }
  );
  return result
}

const deleteUser = async (id: string) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    // First check if the user exists
    const existingUser = await User.findById(id);
    if (!existingUser) {
      throw new AppError(httpStatus.NOT_FOUND, 'User not found');
    }

    // Prevent deletion of superAdmin users
    if (existingUser.role === 'superAdmin') {
      throw new AppError(httpStatus.FORBIDDEN, 'SuperAdmin users cannot be deleted');
    }

    // Delete the user
    const deletedUser = await User.findByIdAndDelete(id);
    if (!deletedUser) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Failed to delete user');
    }

    // If there's an associated research member, delete it too
    const deletedResearchMember = await ResearchMembar.findOneAndDelete({ user: id });
    if (!deletedResearchMember) {
      console.warn('User deleted but associated research member not found');
    }

    await session.commitTransaction();
    await session.endSession();

    return deletedUser;
  } catch (err: any) {
    await session.abortTransaction();
    await session.endSession();
    if (err instanceof AppError) {
      throw err;
    }
    throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to delete user');
  }
};

export const UserServices = {
  getMe,
  createResearchMembar,
  Alluser,
  userToadmin,
  createResearchMembars,
  AllInfo,
  AllInfoForPersonal,
  deleteUser
};
