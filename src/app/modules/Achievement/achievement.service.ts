import httpStatus from "http-status";
// import { Types } from "mongoose";
import AppError from "../../errors/AppError";
import { IAchievement } from "./achievement.interface";
import Achievement from "./achievement.model";

const createAchievement = async (achievementData: IAchievement) => {
  const result = await Achievement.create(achievementData);
  return result;
};

const getAllAchievements = async () => {
  const result = await Achievement.find().sort({ createdAt: -1 });
  return result;
};

const getAllAchievementsForAdmin = async () => {
  const result = await Achievement.find().sort({ createdAt: -1 });
  return result;
};

const getAchievementById = async (id: string) => {
  const result = await Achievement.findById(id);
  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, "Achievement not found");
  }
  return result;
};

const updateAchievement = async (id: string, updateData: Partial<IAchievement>) => {
  const result = await Achievement.findByIdAndUpdate(
    id,
    updateData,
    { new: true, runValidators: true }
  );
  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, "Achievement not found");
  }
  return result;
};

const deleteAchievement = async (id: string) => {
  const result = await Achievement.findByIdAndDelete(id);
  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, "Achievement not found");
  }
  return result;
};

export const AchievementService = {
  createAchievement,
  getAllAchievements,
  getAllAchievementsForAdmin,
  getAchievementById,
  updateAchievement,
  deleteAchievement,
};
