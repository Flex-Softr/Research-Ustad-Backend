import { NextFunction, Request, Response, Router } from 'express';
import { eventController } from './event.controller';
// import { upload } from "../../utils/upload ";
import validateRequest from '../../middlewares/validateRequest';
import { USER_ROLE } from '../user/user.constant';
import auth from '../../middlewares/auth';
import { Validationevent } from './event.validation';
import { upload } from '../../utils/upload';
import config from '../../config';

// Define speaker interface
interface Speaker {
  name: string;
  bio: string;
  imageUrl: string;
}

const router = Router();
router.get('/', eventController.Getevent);
router.get('/:id', eventController.GetSingleEvent);
router.post(
  '/',
  auth(USER_ROLE.superAdmin, USER_ROLE.admin),
  upload.fields([
    { name: 'file', maxCount: 1 }, // Main event image
    { name: 'speakerFiles', maxCount: 10 } // Speaker images (up to 10 speakers)
  ]),
  (req: Request, res: Response, next: NextFunction) => {
    if (req.body.data) {
      req.body = JSON.parse(req.body.data);
      
      // Debug: Log the parsed body
      console.log("POST - Parsed request body:", req.body);
      
      // Handle main event image
      const files = req.files as { [fieldname: string]: { filename: string }[] };
      if (files && files['file'] && files['file'][0]) {
        const baseUrl = config.backend_url;
        req.body.imageUrl = `${baseUrl}/upload/${files['file'][0].filename}`;
      }
      
      // Handle speaker images
      if (files && files['speakerFiles']) {
        const speakerFiles = files['speakerFiles'];
        const baseUrl = config.backend_url;
        
        // Update speakers array with image URLs
        if (req.body.speakers && Array.isArray(req.body.speakers)) {
          req.body.speakers = req.body.speakers.map((speaker: Speaker, index: number) => ({
            ...speaker,
            imageUrl: speakerFiles[index] 
              ? `${baseUrl}/upload/${speakerFiles[index].filename}`
              : speaker.imageUrl || ''
          }));
        }
      }
    }
    next();
  },

  validateRequest(Validationevent.eventValidationPost),
  eventController.Postevent,
);
router.patch(
  '/:id',
  auth(USER_ROLE.superAdmin, USER_ROLE.admin),
  upload.fields([
    { name: 'file', maxCount: 1 }, // Main event image
    { name: 'speakerFiles', maxCount: 10 } // Speaker images (up to 10 speakers)
  ]),
  (req: Request, res: Response, next: NextFunction) => {
    if (req.body.data) {
      req.body = JSON.parse(req.body.data);
      
      // Handle main event image
      const files = req.files as { [fieldname: string]: { filename: string }[] };
      if (files && files['file'] && files['file'][0]) {
        const baseUrl = config.backend_url;
        req.body.imageUrl = `${baseUrl}/upload/${files['file'][0].filename}`;
      }
      
      // Handle speaker images
      if (files && files['speakerFiles']) {
        const speakerFiles = files['speakerFiles'];
        const baseUrl = config.backend_url;
        
        // Update speakers array with image URLs
        if (req.body.speakers && Array.isArray(req.body.speakers)) {
          req.body.speakers = req.body.speakers.map((speaker: Speaker, index: number) => ({
            ...speaker,
            imageUrl: speakerFiles[index] 
              ? `${baseUrl}/upload/${speakerFiles[index].filename}`
              : speaker.imageUrl || ''
          }));
        }
      }
    }
    next();
  },
  validateRequest(Validationevent.eventValidationUpdate),
  eventController.Updateevent,
);
router.delete(
  '/:id',
  auth(USER_ROLE.superAdmin, USER_ROLE.admin),
  eventController.Deletedevent,
);
export const eventRouter = router;
