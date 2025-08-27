import httpStatus from "http-status";
import AppError from "../../errors/AppError";
import { IInternationalConference } from "./internationalConference.interface";
import InternationalConference from "./internationalConference.model";

const createInternationalConference = async (
  internationalConferenceData: IInternationalConference
) => {
  const result = await InternationalConference.create(internationalConferenceData);
  return result;
};

const getAllInternationalConferences = async () => {
  const result = await InternationalConference.find().sort({ createdAt: -1 });
  return result;
};

const getAllInternationalConferencesForAdmin = async () => {
  const result = await InternationalConference.find().sort({ createdAt: -1 });
  return result;
};

const getInternationalConferenceById = async (id: string) => {
  const result = await InternationalConference.findById(id);
  if (!result) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      "International Conference not found"
    );
  }
  return result;
};

const updateInternationalConference = async (
  id: string,
  updateData: Partial<IInternationalConference>
) => {
  const result = await InternationalConference.findByIdAndUpdate(
    id,
    updateData,
    {
      new: true,
      runValidators: true,
    }
  );
  if (!result) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      "International Conference not found"
    );
  }
  return result;
};

const deleteInternationalConference = async (id: string) => {
  const result = await InternationalConference.findByIdAndDelete(id);
  if (!result) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      "International Conference not found"
    );
  }
  return result;
};

export const InternationalConferenceService = {
  createInternationalConference,
  getAllInternationalConferences,
  getAllInternationalConferencesForAdmin,
  getInternationalConferenceById,
  updateInternationalConference,
  deleteInternationalConference,
};
