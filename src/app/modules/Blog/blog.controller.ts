import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { blogService } from './blog.service';

const Getblog = catchAsync(async (req, res) => {
  console.log('Getblog - Request received');
  const result = await blogService.Getblog();
  console.log('Getblog - Result:', result);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'blog is retrieved succesfully',
    data: { blogs: result },
  });
});

const Authorblog = catchAsync(async (req, res) => {
  const { id } = req.user;
  const result = await blogService.Authorblog(id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Personal blog is retrieved succesfully',
    data: result,
  });
});
const Postblog = catchAsync(async (req, res) => {
  const body = req.body;
  const { id } = req.user;
  
  console.log('Postblog - Body:', body);
  console.log('Postblog - User ID:', id);
  
  const result = await blogService.Postblog(body, id);
  
  // Populate author information for the response
  const populatedResult = await result.populate('author', 'fullName email image designation');
  
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'blog is Post succesfully',
    data: { blog: populatedResult },
  });
});

const Updateblog = catchAsync(async (req, res) => {
  const body = req.body;
  const { id } = req.params;
  const result = await blogService.Updateblog(id, body);
  
  // Populate author information for the response
  const populatedResult = result ? await result.populate('author', 'fullName email image designation') : result;
  
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'blog is Update succesfully',
    data: { blog: populatedResult },
  });
});
const Deletedblog = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await blogService.Deletedblog(id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'blog is Deleted succesfully',
    data: result,
  });
});
const Getblogsingle = catchAsync(async (req, res) => {
  const { id } = req.params;
  console.log('Getblogsingle - Request received for ID:', id);
  
  const result = await blogService.Getblogsingle(id);
  console.log('Getblogsingle - Result:', result);
  
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'blog is retrieved successfully',
    data: { blog: result },
  });
});
export const blogController = {
  Getblog,
  Postblog,
  Updateblog,
  Deletedblog,
  Authorblog,
  Getblogsingle,
};
