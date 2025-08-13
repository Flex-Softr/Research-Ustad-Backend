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
  // 🛡️ PROTECTION: Prevent creating multiple superAdmin users
  if (payload.role === 'superAdmin') {
    const existingSuperAdmin = await User.findOne({ role: 'superAdmin' });
    if (existingSuperAdmin) {
      throw new AppError(httpStatus.FORBIDDEN, 'Cannot create multiple superAdmin users. Only one superAdmin is allowed in the system.');
    }
  }

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
  // 🛡️ PROTECTION: Prevent creating multiple superAdmin users
  if (payload.role === 'superAdmin') {
    const existingSuperAdmin = await User.findOne({ role: 'superAdmin' });
    if (existingSuperAdmin) {
      throw new AppError(httpStatus.FORBIDDEN, 'Cannot create multiple superAdmin users. Only one superAdmin is allowed in the system.');
    }
  }

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
    
    console.log(`🔍 Checking for existing user with email: ${payload.email}`);
    
    // Check if user with this email already exists
    const existingUser = await User.findOne({ email: payload.email });
    
    let newUser;
    
    if (existingUser) {
      console.log(`📋 Found existing user:`, {
        id: existingUser._id,
        email: existingUser.email,
        fullName: existingUser.fullName
      });
      
      // If user exists, throw error
      console.log(`❌ User already exists`);
      throw new AppError(httpStatus.CONFLICT, 'User with this email already exists');
    } else {
      // Create new user if no existing user found
      console.log(`🆕 Creating new user with email: ${payload.email}`);
      const createdUsers = await User.create([userData], { session });
      newUser = createdUsers[0];
      console.log(`✅ New user created successfully:`, newUser?.email);
    }
 
    if (!newUser) {
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
      <li><strong>Email:</strong>  ${newUser.email}</li>
      <li><strong>Password:</strong> ${plainPassword}</li>
      <li><strong>designation:</strong> ${newUser.designation}</li>
    </ul>
    <p>For security reasons, we strongly recommend that you change your password immediately after logging in.</p>

    <p><a href="${config.frontend_url} style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Log In</a></p>

    <p>If you have any questions, feel free to reach out to our support team.</p>

    <p>Best regards,</p>
    <p><strong>The ResearchUstad Team</strong></p>
    `;

    await sendEmail(newUser.email, emailContent, subject);
    await session.commitTransaction();
    return [newUser]; // Return as array for consistency with original function
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
  selectFields?: string;
  limit?: number;
  sort?: { [key: string]: 1 | -1 };
} = {}) => {
  const {
    excludeSuperAdmin = false,
    selectFields,
    limit,
    sort = { fullName: 1 }
  } = options;

  const query: any = {};
  
  // Build query based on options
  if (excludeSuperAdmin) {
    query.role = { $ne: 'superAdmin' };
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

// ===== SUPERADMIN MANAGEMENT FUNCTIONS =====

/**
 * Replace the current superAdmin with a new one
 * This is the ONLY way to change superAdmin in the system
 */
const replaceSuperAdmin = async (newSuperAdminId: string, requestingUserId?: string) => {
  const session = await mongoose.startSession();
  
  try {
    session.startTransaction();
    
    // 🛡️ PROTECTION: Only current superAdmin can replace themselves
    if (!requestingUserId) {
      throw new AppError(httpStatus.FORBIDDEN, 'Authentication required to replace superAdmin.');
    }
    
    const requestingUser = await User.findById(requestingUserId);
    if (!requestingUser || requestingUser.role !== 'superAdmin') {
      throw new AppError(httpStatus.FORBIDDEN, 'Only the current superAdmin can replace themselves.');
    }
    
    // Check if new superAdmin candidate exists
    const newSuperAdminCandidate = await User.findById(newSuperAdminId);
    if (!newSuperAdminCandidate) {
      throw new AppError(httpStatus.NOT_FOUND, 'New superAdmin candidate not found.');
    }
    
    // Check if new candidate is already superAdmin
    if (newSuperAdminCandidate.role === 'superAdmin') {
      throw new AppError(httpStatus.BAD_REQUEST, 'Selected user is already a superAdmin.');
    }
    
    // Check if trying to replace with the same user
    if (requestingUserId === newSuperAdminId) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Cannot replace superAdmin with the same user.');
    }
    
    console.log(`🔄 Replacing superAdmin: ${requestingUser.email} -> ${newSuperAdminCandidate.email}`);
    
    // 1. Demote current superAdmin to admin
    const demotedSuperAdmin = await User.findByIdAndUpdate(
      requestingUserId,
      { role: 'admin' },
      { new: true, runValidators: true, session }
    );
    
    // 2. Promote new candidate to superAdmin
    const promotedSuperAdmin = await User.findByIdAndUpdate(
      newSuperAdminId,
      { role: 'superAdmin' },
      { new: true, runValidators: true, session }
    );
    
    await session.commitTransaction();
    
    console.log(`✅ SuperAdmin successfully replaced: ${demotedSuperAdmin?.email} -> ${promotedSuperAdmin?.email}`);
    
    return {
      message: 'SuperAdmin successfully replaced',
      previousSuperAdmin: {
        id: demotedSuperAdmin?._id,
        email: demotedSuperAdmin?.email,
        fullName: demotedSuperAdmin?.fullName,
        newRole: 'admin'
      },
      newSuperAdmin: {
        id: promotedSuperAdmin?._id,
        email: promotedSuperAdmin?.email,
        fullName: promotedSuperAdmin?.fullName,
        newRole: 'superAdmin'
      }
    };
    
  } catch (err: any) {
    await session.abortTransaction();
    console.error('❌ Error during superAdmin replacement:', err);
    throw err;
  } finally {
    await session.endSession();
  }
};

/**
 * Get current superAdmin information
 */
const getCurrentSuperAdmin = async () => {
  const superAdmin = await User.findOne({ role: 'superAdmin' });
  if (!superAdmin) {
    throw new AppError(httpStatus.NOT_FOUND, 'No superAdmin found in the system.');
  }
  
  return {
    id: superAdmin._id,
    email: superAdmin.email,
    fullName: superAdmin.fullName,
    role: superAdmin.role,
    designation: superAdmin.designation
  };
};

const deleteUser = async (id: string, requestingUserId?: string) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    // First, check if user exists
    const userToDelete = await User.findById(id);
    if (!userToDelete) {
      throw new AppError(httpStatus.NOT_FOUND, 'User not found');
    }

    // 🛡️ PROTECTION: Prevent self-deletion
    if (requestingUserId && requestingUserId === id) {
      throw new AppError(httpStatus.FORBIDDEN, 'Cannot delete your own account. Please contact another administrator.');
    }

    // 🛡️ PROTECTION: Prevent superAdmin deletion (only one superAdmin allowed)
    if (userToDelete.role === 'superAdmin') {
      throw new AppError(httpStatus.FORBIDDEN, 'Cannot delete superAdmin users. Only one superAdmin is allowed in the system.');
    }

    console.log(`🗑️ Hard deleting user: ${userToDelete.email} (ID: ${id})`);

    // Delete all related data first
    // 1. Delete user's research papers
    const deletedPapers = await ResearchPaper.deleteMany(
      { user: id },
      { session }
    );
    console.log(`📄 Deleted ${deletedPapers.deletedCount} research papers`);

    // 2. Delete user's blogs
    const deletedBlogs = await Blog.deleteMany(
      { author: id },
      { session }
    );
    console.log(`📝 Deleted ${deletedBlogs.deletedCount} blogs`);

    // 3. Remove user from author references in research papers
    const updatedPapers = await ResearchPaper.updateMany(
      { 'authorReferences.user': id },
      { $pull: { authorReferences: { user: id } } },
      { session }
    );
    console.log(`👥 Removed author references from ${updatedPapers.modifiedCount} papers`);

    // 4. Finally, delete the user completely
    const deletedUser = await User.findByIdAndDelete(id, { session });

    if (!deletedUser) {
      throw new AppError(httpStatus.NOT_FOUND, 'User not found');
    }

    console.log(`✅ User ${deletedUser.email} completely deleted from database`);

    await session.commitTransaction();
    return { 
      message: 'User and all related data deleted successfully',
      deletedUser: {
        id: deletedUser._id,
        email: deletedUser.email,
        fullName: deletedUser.fullName
      },
      deletedPapers: deletedPapers.deletedCount,
      deletedBlogs: deletedBlogs.deletedCount,
      updatedPapers: updatedPapers.modifiedCount
    };
  } catch (err: any) {
    await session.abortTransaction();
    console.error('❌ Error during hard delete:', err);
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
  
  // SuperAdmin management
  replaceSuperAdmin,
  getCurrentSuperAdmin,
  
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
    selectFields: 'fullName email designation',
    limit: 50 
  }),
  deleteResearchMember: deleteUser,
};
