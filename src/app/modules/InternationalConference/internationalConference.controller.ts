import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { InternationalConferenceService } from "./internationalConference.service";

const createInternationalConference = catchAsync(async (req, res) => {
  const result = await InternationalConferenceService.createInternationalConference(
    req.body
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "International Conference created successfully",
    data: result,
  });
});

const getAllInternationalConferences = catchAsync(async (req, res) => {
  const result = await InternationalConferenceService.getAllInternationalConferences();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "International Conferences retrieved successfully",
    data: result,
  });
});

const getAllInternationalConferencesForAdmin = catchAsync(async (req, res) => {
  const result = await InternationalConferenceService.getAllInternationalConferencesForAdmin();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "International Conferences retrieved successfully",
    data: result,
  });
});

const getInternationalConferenceById = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await InternationalConferenceService.getInternationalConferenceById(id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "International Conference retrieved successfully",
    data: result,
  });
});

const updateInternationalConference = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await InternationalConferenceService.updateInternationalConference(
    id,
    req.body
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "International Conference updated successfully",
    data: result,
  });
});

const deleteInternationalConference = catchAsync(async (req, res) => {
  const { id } = req.params;
  await InternationalConferenceService.deleteInternationalConference(id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "International Conference deleted successfully",
    data: null,
  });
});

export const InternationalConferenceController = {
  createInternationalConference,
  getAllInternationalConferences,
  getAllInternationalConferencesForAdmin,
  getInternationalConferenceById,
  updateInternationalConference,
  deleteInternationalConference,
};
