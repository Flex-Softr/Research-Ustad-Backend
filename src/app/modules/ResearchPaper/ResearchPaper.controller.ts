import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { ResearchPaperService } from "./ResearchPaper.service";

const postResearchUstad = catchAsync(async (req, res) => {
  const{id}=req.user
    const result = await ResearchPaperService.postResearchUstad(req.body, id);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'ResearchPaper Create succesfully',
      data: result,
    });
  });

  const updateResearchUstad = catchAsync(async (req, res) => {
    const { id } = req.params;
    const { id: userId } = req.user;
    const result = await ResearchPaperService.updateResearchUstad(id, req.body, userId);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'ResearchPaper Updated successfully',
      data: result,
    });
  });

  const getPublicResearchUstad = catchAsync(async (req, res) => {
    const result = await ResearchPaperService.getPublicResearchUstad();
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'ResearchPaper retrieved succesfully',
      data: result,
    });
  });
  const getOngingResearchUstad = catchAsync(async (req, res) => {
    const result = await ResearchPaperService.getOngingResearchUstad();
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'ResearchPaper Onging retrieved succesfully',
      data: result,
    });
  });
  const getpersonalPaperResearchUstad = catchAsync(async (req, res) => {
    const{id}=req.params
    const result = await ResearchPaperService.getpersonalPaperResearchUstad(id);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'ResearchPaper personalPaper retrieved succesfully',
      data: result,
    });
  });

  const getpersonalPaperResearch = catchAsync(async (req, res) => {
    const{id}=req.user
    const result = await ResearchPaperService.getpersonalPaperResearch(id);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'ResearchPaper personalPaper retrieved succesfully',
      data: result,
    });
  });

  const getpersonalPaperResearchUstadforid = catchAsync(async (req, res) => {
    const{id}=req.params
    const result = await ResearchPaperService.getpersonalPaperResearchUstadforid(id);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'ResearchPaper personalPaper retrieved succesfully',
      data: result,
    });
  });
  const getAllResearchUstad= catchAsync(async (req, res) => {
    const result = await ResearchPaperService.getAllResearchUstad();
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'ResearchPaper getAll retrieved succesfully',
      data: result,
    });
  });
  const approveResearchUstad = catchAsync(async (req, res) => {
    const result = await ResearchPaperService.approveResearchUstad(req.params.id);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'ResearchPaper Approved successfully',
      data: result,
    });
  });

  const rejectResearchUstad = catchAsync(async (req, res) => {
    const result = await ResearchPaperService.rejectResearchUstad(req.params.id);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'ResearchPaper Rejected successfully',
      data: result,
    });
  });
  const deleteResearchUstad = catchAsync(async (req, res) => {
    const result = await ResearchPaperService.deleteResearchUstad(req.params.id);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'ResearchPaper Deleted succesfully',
      data: result,
    });
  })
export const ResearchPaperControllers={
    postResearchUstad,
    updateResearchUstad,
    getPublicResearchUstad,
    getAllResearchUstad,
    approveResearchUstad,
    rejectResearchUstad,
    deleteResearchUstad,
    getOngingResearchUstad,
    getpersonalPaperResearchUstad,
    getpersonalPaperResearchUstadforid,
    getpersonalPaperResearch
}