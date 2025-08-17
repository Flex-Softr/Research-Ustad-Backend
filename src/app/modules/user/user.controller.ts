import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { UserService } from './user.service';
import AppError from '../../errors/AppError';

// ===== USER CREATION =====

const createUser = catchAsync(async (req, res) => {
  const { password, ...userData } = req.body;
  const result = await UserService.createUser(
    { ...userData, password },
    req.file || null, // Handle optional file upload
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User created successfully',
    data: result,
  });
});

// ===== USER RETRIEVAL =====

const getMe = catchAsync(async (req, res) => {
  const { email } = req.user;
  const result = await UserService.getUserByEmail(email);

  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User retrieved successfully',
    data: result,
  });
});

const getAllUsers = catchAsync(async (req, res) => {
  const { type, limit, fields } = req.query;
  
  let options: any = {};
  
  // Check if this is a research-members request (either by type param or route path)
  const isResearchMembersRequest = type === 'research-members' || req.path.includes('research-members');
  
  if (isResearchMembersRequest) {
    options = { 
      role: 'user' // Only include regular users
    };
  }
  
  if (limit) {
    options = { ...options, limit: parseInt(limit as string) };
  }
  if (fields) {
    options = { ...options, selectFields: fields as string };
  }

  const result = await UserService.getUsers(options);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Users retrieved successfully',
    data: result,
  });
});



const getUserById = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await UserService.getUserById(id);

  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User retrieved successfully',
    data: result,
  });
});

const getPlatformStats = catchAsync(async (req, res) => {
  const result = await UserService.getPlatformStats();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Platform statistics retrieved successfully',
    data: result,
  });
});

const getPersonalStats = catchAsync(async (req, res) => {
  const { id } = req.user;
  const result = await UserService.getUserStats(id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Personal statistics retrieved successfully',
    data: result,
  });
});

// ===== USER MANAGEMENT =====

const toggleUserRole = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await UserService.toggleUserRole(id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User role updated successfully',
    data: result,
  });
});

const deleteUser = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { id: requestingUserId } = req.user;
  const result = await UserService.deleteUser(id, requestingUserId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User deleted successfully',
    data: result,
  });
});

const searchUsers = catchAsync(async (req, res) => {
  const { query } = req.query;
  const result = await UserService.searchUsers(query as string);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Users searched successfully',
    data: result,
  });
});

// ===== USER UPDATES =====

const updateUser = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await UserService.updateUser(id, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User updated successfully',
    data: result,
  });
});

const updateCurrentUser = catchAsync(async (req, res) => {
  const { email } = req.user;
  const result = await UserService.updateUserByEmail(email, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User updated successfully',
    data: result,
  });
});

// ===== SUPERADMIN MANAGEMENT =====

const replaceSuperAdmin = catchAsync(async (req, res) => {
  const { newSuperAdminId } = req.body;
  const { id: requestingUserId } = req.user;

  const result = await UserService.replaceSuperAdmin(
    newSuperAdminId,
    requestingUserId,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'SuperAdmin successfully replaced',
    data: result,
  });
});

const getCurrentSuperAdmin = catchAsync(async (req, res) => {
  const result = await UserService.getCurrentSuperAdmin();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Current superAdmin retrieved successfully',
    data: result,
  });
});

export const UserControllers = {
  // User creation
  createUser,

  // User retrieval
  getMe,
  getAllUsers,
  getUserById,
  getPlatformStats,
  getPersonalStats,

  // User management
  toggleUserRole,
  deleteUser,
  searchUsers,
  updateUser,
  updateCurrentUser,

  // SuperAdmin management
  replaceSuperAdmin,
  getCurrentSuperAdmin,
};
