import express from 'express';
import validateRequest from '../../middlewares/validateRequest';
import { ContactValidation } from './contact.validation';
import { ContactController } from './contact.controller';

const router = express.Router();

// Public route for contact form submission
router.post(
  '/',
  validateRequest(ContactValidation.createContactSchema),
  ContactController.createContact
);

export const ContactRoutes = router;
