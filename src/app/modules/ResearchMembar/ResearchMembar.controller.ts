import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { ResearchServices } from './ResearchMembar.service';

const getSingleAssociate = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await ResearchServices.getSingleMembar(id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Associate is retrieved succesfully',
    data: result,
  });
});

const getsingleGetMembar = catchAsync(async (req, res) => {
  const { email } = req.user;
  console.log(email);
  const result = await ResearchServices.singleGetMembarForUser(email);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Associate is retrieved succesfully',
    data: result,
  });
});

const getAllAssociate = catchAsync(async (req, res) => {
  const result = await ResearchServices.getAllMembar();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Associate are retrieved succesfully',
    data: result
  });
});

const updateAssociate = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { ResearchMembar} = req.body;
  const result = await ResearchServices.updateMembar(id, ResearchMembar);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Associate is updated succesfully',
    data: result,
  });
});
const updateForuserAssociate = catchAsync(async (req, res) => {
  const { email } = req.user;
  const { ResearchMembar} = req.body;
  const result = await ResearchServices.updateUserMembar(email, ResearchMembar);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Associate is updated succesfully',
    data: result,
  });
});

const deleteAssociate = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { id: requestingUserId } = req.user;
  const result = await ResearchServices.deleteMembar(id, requestingUserId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Associate is deleted succesfully',
    data: result,
  });
});

export const AssociateControllers = {
  getSingleAssociate,
  updateAssociate,
  deleteAssociate,
  getAllAssociate,
  updateForuserAssociate,
  getsingleGetMembar
};
