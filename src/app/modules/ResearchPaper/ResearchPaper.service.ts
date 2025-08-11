import httpStatus from "http-status";
import AppError from "../../errors/AppError";
import { IResearchPaper } from "./ResearchPaper.interface";
import { ResearchPaper } from "./ResearchPaper.model";
import { Types } from "mongoose";

const postResearchUstad= async(body:IResearchPaper, id:Types.ObjectId)=>{
    body.user =id
    const result = await ResearchPaper.create(body)
    return result
}
const getPublicResearchUstad= async()=>{
    const result = await ResearchPaper.find({ isApproved: true });
    return result
}
const getOngingResearchUstad= async()=>{
    const result = await ResearchPaper.find({ isApproved: false }).populate('user', 'fullName email');
    return result
}
const getpersonalPaperResearchUstad= async(id:string)=>{
    const result = await ResearchPaper.find({ user:id });
    return result
}
const getpersonalPaperResearch= async(id:Types.ObjectId)=>{
    const result = await ResearchPaper.find({ user:id });
    return result
}
const getpersonalPaperResearchUstadforid= async(id:string)=>{
    const result = await ResearchPaper.findById(id);
    return result
}
const getAllResearchUstad= async()=>{
    const result = await ResearchPaper.find().populate('user', 'fullName email');
    return result
}
const approveResearchUstad= async(id:string)=>{
    const paper = await ResearchPaper.findById(id);
    if (!paper) {
    throw new AppError(httpStatus.NOT_FOUND, "Research paper not found")
    }

    paper.isApproved = true;
    const result =  await paper.save();
  return result

}
const deleteResearchUstad= async(id:string)=>{
    const paper = await ResearchPaper.findById(id);
    if (!paper) {
    throw new AppError(httpStatus.NOT_FOUND, "Research paper not found")
    }
  const result=  await ResearchPaper.findByIdAndDelete(id);
    return result
}

const rejectResearchUstad= async(id:string)=>{
    const paper = await ResearchPaper.findById(id);
    if (!paper) {
    throw new AppError(httpStatus.NOT_FOUND, "Research paper not found")
    }

    paper.isApproved = false;
    const result =  await paper.save();
  return result
}
export const ResearchPaperService ={
    postResearchUstad,
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