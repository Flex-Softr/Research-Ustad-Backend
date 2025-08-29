import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { ContactService } from './contact.service';

// Create contact form submission
const createContact = catchAsync(async (req, res) => {
  const payload = req.body;
  const result = await ContactService.createContact(payload);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: result.message,
    data: result,
  });
});

export const ContactController = {
  createContact,
};
