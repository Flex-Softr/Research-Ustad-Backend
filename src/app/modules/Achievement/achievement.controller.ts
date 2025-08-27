import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { AchievementService } from "./achievement.service";

const createAchievement = catchAsync(async (req, res) => {
  const result = await AchievementService.createAchievement(req.body);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Achievement created successfully",
    data: result,
  });
});

const getAllAchievements = catchAsync(async (req, res) => {
  const result = await AchievementService.getAllAchievements();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Achievements retrieved successfully",
    data: result,
  });
});

const getAllAchievementsForAdmin = catchAsync(async (req, res) => {
  const result = await AchievementService.getAllAchievementsForAdmin();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "All achievements retrieved successfully",
    data: result,
  });
});

const getAchievementById = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await AchievementService.getAchievementById(id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Achievement retrieved successfully",
    data: result,
  });
});

const updateAchievement = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await AchievementService.updateAchievement(id, req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Achievement updated successfully",
    data: result,
  });
});

const deleteAchievement = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await AchievementService.deleteAchievement(id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Achievement deleted successfully",
    data: result,
  });
});

export const AchievementController = {
  createAchievement,
  getAllAchievements,
  getAllAchievementsForAdmin,
  getAchievementById,
  updateAchievement,
  deleteAchievement,
};
