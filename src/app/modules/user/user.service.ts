/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

import httpStatus from 'http-status';
import mongoose from 'mongoose';
import config from '../../config';
import AppError from '../../errors/AppError';
import { sendEmail } from '../../utils/sendEmail';
import { User } from './user.model';
import { ResearchPaper } from '../ResearchPaper/ResearchPaper.model';
import { Blog } from '../Blog/blog.model';
import { TUser } from './user.interface';

// ===== USER CREATION FUNCTIONS =====

const createResearchMembar = async (
  file: any | null,
  password: string,
  payload: Partial<TUser>,
) => {
  const userData: Partial<TUser> = {};
  userData.password = password || (config.default_password as string);
  userData.designation = payload.designation;
  userData.email = payload.email;
  userData.fullName = payload.fullName;
  userData.role = payload.role || "user";
  
  // Handle file upload - the router already sets payload.image
  if (payload.image) {
    userData.image = payload.image;
  }
  
  // Include research member specific fields
  if (payload.contactNo) userData.contactNo = payload.contactNo;
  if (payload.current) userData.current = payload.current;
  if (payload.education) userData.education = payload.education;
  if (payload.research) userData.research = payload.research;
  if (payload.shortBio) userData.shortBio = payload.shortBio;
  if (payload.socialLinks) userData.socialLinks = payload.socialLinks;
  if (payload.expertise) userData.expertise = payload.expertise;
  if (payload.awards) userData.awards = payload.awards;
  if (payload.conferences) userData.conferences = payload.conferences;

  const session = await mongoose.startSession();

  try {
    await session.startTransaction();
    
    const newUser = await User.create([userData], { session });
 
    if (!newUser.length) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Failed to create user');
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
    return newUser;
  } catch (err: any) {
    await session.abortTransaction();
    throw err
  } finally {
    await session.endSession()
  }
};

const createResearchMembars = async (
  payload: Partial<TUser> & { role?: string },
) => {
  const userData: Partial<TUser> = {};
  userData.password = payload.password || (config.default_password as string);
  userData.designation = payload.designation;
  userData.email = payload.email;
  userData.fullName = payload.fullName;
  userData.role = payload.role || "user";
  userData.image = payload.image || "https://www.shutterstock.com/image-vector/default-avatar-profile-icon-social-600nw-1906669723.jpg";
  
  // Include research member specific fields
  if (payload.contactNo) userData.contactNo = payload.contactNo;
  if (payload.current) userData.current = payload.current;
  if (payload.education) userData.education = payload.education;
  if (payload.research) userData.research = payload.research;
  if (payload.shortBio) userData.shortBio = payload.shortBio;
  if (payload.socialLinks) userData.socialLinks = payload.socialLinks;
  if (payload.expertise) userData.expertise = payload.expertise;
  if (payload.awards) userData.awards = payload.awards;
  if (payload.conferences) userData.conferences = payload.conferences;

  const session = await mongoose.startSession();

  try {
     session.startTransaction();
    const newUser = await User.create([userData], { session });
 
    if (!newUser.length) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Failed to create user');
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
    return newUser;
  } catch (err: any) {
    await session.abortTransaction();
    throw err
  }finally{
    await session.endSession()
  }
};

// ===== CONSOLIDATED USER RETRIEVAL FUNCTIONS =====

/**
 * Get user by email (consolidated function)
 * Used for: getMe, getSingleResearchMemberByEmail
 */
const getUserByEmail = async (email: string) => {
  const result = await User.findOne({ email: email });
  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }
  
  // If user exists but doesn't have research member data, return basic user info
  // This handles the case where data hasn't been migrated yet
  if (!result.contactNo && !result.current && !result.education) {
    // Return basic user info without research member fields
    return {
      _id: result._id,
      email: result.email,
      fullName: result.fullName,
      designation: result.designation,
      image: result.image,
      role: result.role,
      status: result.status,
      // Add empty research member fields for compatibility
      contactNo: '',
      current: {
        institution: '',
        department: '',
        degree: '',
        inst_designation: '',
      },
      education: {
        degree: '',
        field: '',
        institution: '',
        status: '',
        scholarship: '',
      },
      research: [],
      shortBio: '',
      socialLinks: {
        researchgate: '',
        google_scholar: '',
        linkedin: '',
      },
      expertise: [],
      awards: [],
      conferences: [],
    };
  }
  
  return result;
};

/**
 * Get user by ID (consolidated function)
 * Used for: getSingleResearchMember
 */
const getUserById = async (id: string) => {
  const result = await User.findById(id);
  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }
  return result;
};

// ===== CONSOLIDATED USER LISTING FUNCTIONS =====

/**
 * Get all users with filtering options (consolidated function)
 * Used for: Alluser, getAllResearchMembers, getAllUsers
 */
const getUsers = async (options: {
  excludeSuperAdmin?: boolean;
  excludeDeleted?: boolean;
  selectFields?: string;
  limit?: number;
  sort?: { [key: string]: 1 | -1 };
} = {}) => {
  const {
    excludeSuperAdmin = false,
    excludeDeleted = true,
    selectFields,
    limit,
    sort = { fullName: 1 }
  } = options;

  const query: any = {};
  
  // Build query based on options
  if (excludeSuperAdmin) {
    query.role = { $ne: 'superAdmin' };
  }
  
  if (excludeDeleted) {
    query.isDeleted = false;
  }

  let userQuery = User.find(query);
  
  // Apply field selection
  if (selectFields) {
    userQuery = userQuery.select(selectFields);
  }
  
  // Apply limit
  if (limit) {
    userQuery = userQuery.limit(limit);
  }
  
  // Apply sorting
  userQuery = userQuery.sort(sort);

  return await userQuery.exec();
};

// ===== STATISTICS FUNCTIONS =====

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
    User.countDocuments({ role: { $ne: 'superAdmin' } }), // Count research members
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

// ===== USER MANAGEMENT FUNCTIONS =====

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

    const deletedUser = await User.findByIdAndUpdate(
      id,
      { isDeleted: true },
      { new: true, session }
    );

    if (!deletedUser) {
      throw new AppError(httpStatus.NOT_FOUND, 'User not found');
    }

    await session.commitTransaction();
    return deletedUser;
  } catch (err: any) {
    await session.abortTransaction();
    throw err;
  } finally {
    await session.endSession();
  }
};

const searchUsers = async (query: string) => {
  if (!query || query.trim().length < 2) {
    return [];
  }

  const searchRegex = new RegExp(query.trim(), 'i');
  
  const users = await User.find({
    fullName: { $regex: searchRegex },
    isDeleted: false,
  })
  .select('fullName email designation')
  .limit(10)
  .sort({ fullName: 1 });

  return users;
};

// ===== USER UPDATE FUNCTIONS =====

const updateResearchMember = async (id: string, payload: Partial<TUser>) => {
  const { current, education, socialLinks, ...remainingData } = payload;

  const modifiedUpdatedData: Record<string, unknown> = {
    ...remainingData,
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
  
  const result = await User.findByIdAndUpdate(id, modifiedUpdatedData, {
    new: true,
    runValidators: true,
  });
  
  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, 'Research member not found');
  }
  
  return result;
};

const updateResearchMemberByEmail = async (email: string, payload: Partial<TUser>) => {
  const { current, education, socialLinks, ...remainingData } = payload;

  const modifiedUpdatedData: Record<string, unknown> = {
    ...remainingData,
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
  
  const result = await User.findOneAndUpdate({ email }, modifiedUpdatedData, {
    new: true,
    runValidators: true,
  });
  
  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, 'Research member not found');
  }
  
  return result;
};

// ===== EXPORT CONSOLIDATED SERVICES =====

export const UserServices = {
  // User creation
  createResearchMembar,
  createResearchMembars,
  
  // Consolidated user retrieval (replaces duplicates)
  getUserByEmail,        // Replaces: getMe, getSingleResearchMemberByEmail
  getUserById,          // Replaces: getSingleResearchMember
  getUsers,             // Replaces: Alluser, getAllResearchMembers, getAllUsers
  
  // Statistics
  AllInfo,
  AllInfoForPersonal,
  
  // User management
  userToadmin,
  deleteUser,
  searchUsers,
  
  // User updates
  updateResearchMember,
  updateResearchMemberByEmail,
  
  // Legacy aliases for backward compatibility
  getMe: getUserByEmail,
  getSingleResearchMemberByEmail: getUserByEmail,
  getSingleResearchMember: getUserById,
  Alluser: () => getUsers(),
  getAllResearchMembers: () => getUsers({ excludeSuperAdmin: true }),
  getAllUsers: () => getUsers({ 
    excludeDeleted: true, 
    selectFields: 'fullName email designation',
    limit: 50 
  }),
  deleteResearchMember: deleteUser,
};
