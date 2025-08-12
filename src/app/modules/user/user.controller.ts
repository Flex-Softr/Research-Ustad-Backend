import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { UserServices } from './user.service';

const createResearchMembar = catchAsync(async (req, res) => {
  const { password, ...userData } = req.body;
  const result = await UserServices.createResearchMembar(
    null, // No longer passing file since router handles it
    password,
    userData,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'ResearchMembar is created succesfully',
    data: result,
  });
});

const createResearchMembars = catchAsync(async (req, res) => {
  const result = await UserServices.createResearchMembars(req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'ResearchMembar is created succesfully',
    data: result,
  });
});

const getMe = catchAsync(async (req, res) => {
  const { email } = req.user;
  const result = await UserServices.getMe(email);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User is retrieved succesfully',
    data: result,
  });
});

const Alluser = catchAsync(async (req, res) => {
  const result = await UserServices.Alluser();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'All User is retrieved succesfully',
    data: result,
  });
});

const AllInfo = catchAsync(async (req, res) => {
  const result = await UserServices.AllInfo();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'AllInfo is retrieved succesfully',
    data: result,
  });
});

const AllInfoForPersonal = catchAsync(async (req, res) => {
  const { id } = req.user;
  const result = await UserServices.AllInfoForPersonal(id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'AllInfoForPersonal is retrieved succesfully',
    data: result,
  });
});

const userToadmin = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await UserServices.userToadmin(id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'userToadmin is  succesfully',
    data: result,
  });
});

const deleteUser = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await UserServices.deleteUser(id);
  
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User deleted successfully',
    data: result,
  });
});

const searchUsers = catchAsync(async (req, res) => {
  const { query } = req.query;
  const result = await UserServices.searchUsers(query as string);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Users searched successfully',
    data: result,
  });
});

const getAllUsers = catchAsync(async (req, res) => {
  const result = await UserServices.getAllUsers();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'All users retrieved successfully',
    data: result,
  });
});

// Research member specific controllers
const getAllResearchMembers = catchAsync(async (req, res) => {
  const result = await UserServices.getAllResearchMembers();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Research members are retrieved successfully',
    data: result
  });
});

const getSingleResearchMember = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await UserServices.getSingleResearchMember(id);
  
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Research member is retrieved successfully',
    data: result,
  });
});

const getSingleResearchMemberByEmail = catchAsync(async (req, res) => {
  const { email } = req.user;
  const result = await UserServices.getSingleResearchMemberByEmail(email);
  
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Research member is retrieved successfully',
    data: result,
  });
});

const updateResearchMember = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await UserServices.updateResearchMember(id, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Research member is updated successfully',
    data: result,
  });
});

const updateResearchMemberByEmail = catchAsync(async (req, res) => {
  const { email } = req.user;
  const result = await UserServices.updateResearchMemberByEmail(email, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Research member is updated successfully',
    data: result,
  });
});

const deleteResearchMember = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await UserServices.deleteResearchMember(id);
  
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Research member is deleted successfully',
    data: result,
  });
});

export const UserControllers = {
  createResearchMembar,
  createResearchMembars,
  getMe,
  Alluser,
  AllInfo,
  AllInfoForPersonal,
  userToadmin,
  deleteUser,
  searchUsers,
  getAllUsers,
  // Research member specific controllers
  getAllResearchMembers,
  getSingleResearchMember,
  getSingleResearchMemberByEmail,
  updateResearchMember,
  updateResearchMemberByEmail,
  deleteResearchMember,
};
