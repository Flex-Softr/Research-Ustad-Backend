import httpStatus from "http-status";
import AppError from "../../errors/AppError";
import { IResearchPaper } from "./ResearchPaper.interface";
import { ResearchPaper } from "./ResearchPaper.model";
import { Types } from "mongoose";
import { UserService } from "../user/user.service";

const postResearchUstad = async (body: IResearchPaper, userId: Types.ObjectId) => {
    // Process authors to set isRegisteredUser flag and validate structure
    if (body.authors && body.authors.length > 0) {
      body.authors = body.authors.map(author => ({
        ...author,
        isRegisteredUser: !!author.user
      }));
    }

    const result = await ResearchPaper.create({ ...body, user: userId });
    
    // Link the paper to the authors' publications
    if (result && result.authors) {
      try {
        await UserService.addPaperToAuthors(result._id, result.authors);
      } catch (error) {
        console.error('⚠️ Warning: Failed to add paper to authors:', error);
        // Don't throw error here to avoid breaking paper creation
      }
    }
    
    return result
}

const updateResearchUstad = async (id: string, body: Partial<IResearchPaper>, userId: Types.ObjectId) => {
    const paper = await ResearchPaper.findById(id);
    if (!paper) {
        throw new AppError(httpStatus.NOT_FOUND, "Research paper not found");
    }

    // Check if the user owns this paper or is an admin
    if (paper.user.toString() !== userId.toString()) {
        throw new AppError(httpStatus.FORBIDDEN, "You can only update your own research papers");
    }

    // Process authors to set isRegisteredUser flag and validate structure
    if (body.authors && body.authors.length > 0) {
      body.authors = body.authors.map(author => {
        // Handle user field if it's an object or string
        let processedUser = author.user;
        if (author.user) {
          if (typeof author.user === 'string') {
            // Convert string to ObjectId
            processedUser = new Types.ObjectId(author.user);
          } else if (typeof author.user === 'object') {
            const userObj = author.user as unknown as Record<string, unknown>;
            const extractedId = userObj._id || userObj.id || userObj.userId;
            if (extractedId && typeof extractedId === 'string') {
              processedUser = new Types.ObjectId(extractedId);
            }
          }
        }
        
        return {
          ...author,
          user: processedUser,
          isRegisteredUser: !!processedUser
        };
      });
    }

    // Check if authors have changed
    const authorsChanged = body.authors && JSON.stringify(body.authors) !== JSON.stringify(paper.authors);

    // Update the paper
    const result = await ResearchPaper.findByIdAndUpdate(
        id,
        { ...body, user: userId },
        { new: true, runValidators: true }
    );

    // If authors changed, update the user publications
    if (authorsChanged && result && result.authors) {
      try {
        await UserService.updatePaperAuthors(result._id, result.authors);
      } catch (error) {
        console.error('⚠️ Warning: Failed to update paper authors:', error);
        // Don't throw error here to avoid breaking paper update
      }
    }

    return result;
};

const getPublicResearchUstad= async()=>{
    const result = await ResearchPaper.find({ isApproved: true })
      .populate('authors.user', 'fullName email designation image')
      .populate('user', 'fullName email');
    return result
}

const getPublicSingleResearchUstad= async(id: string)=>{
    const result = await ResearchPaper.findOne({ _id: id, isApproved: true })
      .populate('authors.user', 'fullName email designation image')
      .populate('user', 'fullName email');
    if (!result) {
        throw new AppError(httpStatus.NOT_FOUND, "Research paper not found or not approved");
    }
    return result
}

const getOngingResearchUstad= async()=>{
    const result = await ResearchPaper.find({ isApproved: false })
      .populate('user', 'fullName email')
      .populate('authors.user', 'fullName email designation image');
    return result
}

const getpersonalPaperResearchUstad= async(id:string)=>{
    const result = await ResearchPaper.find({ user:id })
      .populate('authors.user', 'fullName email designation image');
    return result
}

const getpersonalPaperResearch= async(id:Types.ObjectId)=>{
    const result = await ResearchPaper.find({ user:id })
      .populate('authors.user', 'fullName email designation image');
    return result
}

const getpersonalPaperResearchUstadforid= async(id:string)=>{
    const result = await ResearchPaper.findById(id)
      .populate('authors.user', 'fullName email designation image');
    return result
}

const getAllResearchUstad= async()=>{
    const result = await ResearchPaper.find()
      .populate('user', 'fullName email')
      .populate('authors.user', 'fullName email designation image');
    return result
}

const approveResearchUstad= async(id:string)=>{
    const paper = await ResearchPaper.findById(id);
    if (!paper) {
    throw new AppError(httpStatus.NOT_FOUND, "Research paper not found")
    }

    paper.isApproved = true;
    const result =  await paper.save();
    
    // Add the approved paper to authors' publications
    if (result && result.authors) {
      try {
        await UserService.addPaperToAuthors(result._id, result.authors);
      } catch (error) {
        console.error('⚠️ Warning: Failed to add approved paper to authors:', error);
        // Don't throw error here to avoid breaking paper approval
      }
    }
    
  return result

}

const deleteResearchUstad= async(id:string)=>{
    const paper = await ResearchPaper.findById(id);
    if (!paper) {
    throw new AppError(httpStatus.NOT_FOUND, "Research paper not found")
    }
    
    // Remove the paper from all users' publications before deleting
    try {
      await UserService.removePaperFromAuthors(paper._id);
    } catch (error) {
      console.error('⚠️ Warning: Failed to remove paper from authors:', error);
      // Don't throw error here to avoid breaking paper deletion
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
    
    // Remove the rejected paper from all users' publications
    try {
      await UserService.removePaperFromAuthors(paper._id);
    } catch (error) {
      console.error('⚠️ Warning: Failed to remove rejected paper from authors:', error);
      // Don't throw error here to avoid breaking paper rejection
    }
    
  return result
}

export const ResearchPaperService ={
    postResearchUstad,
    updateResearchUstad,
    getPublicResearchUstad,
    getPublicSingleResearchUstad,
    getAllResearchUstad,
    approveResearchUstad,
    rejectResearchUstad,
    deleteResearchUstad,
    getOngingResearchUstad,
    getpersonalPaperResearchUstad,
    getpersonalPaperResearchUstadforid,
    getpersonalPaperResearch
}