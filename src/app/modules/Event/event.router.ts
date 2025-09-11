import { NextFunction, Request, Response, Router } from 'express';
import { eventController } from './event.controller';
// import { upload } from "../../utils/upload ";
import validateRequest from '../../middlewares/validateRequest';
import { USER_ROLE } from '../user/user.constant';
import auth from '../../middlewares/auth';
import { Validationevent } from './event.validation';
import { upload, handleMulterError } from '../../utils/upload';
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
      
      // Handle main event image
      const files = req.files as { [fieldname: string]: { filename: string }[] };
      if (files && files['file'] && files['file'][0]) {
        const backendUrl = config.backend_url || '';
        const baseUrl = backendUrl.endsWith('/') ? backendUrl?.slice(0, -1) : backendUrl;
        req.body.imageUrl = `${baseUrl}/upload/${files['file'][0].filename}`;
      }
      
      // Handle speaker images
      if (files && files['speakerFiles']) {
        const speakerFiles = files['speakerFiles'];
        const backendUrl = config.backend_url || '';
        const baseUrl = backendUrl.endsWith('/') ? backendUrl?.slice(0, -1) : backendUrl;
        
        // Update speakers array with image URLs
        if (req.body.speakers && Array.isArray(req.body.speakers)) {
          req.body.speakers = req.body.speakers?.map((speaker: Speaker, index: number) => ({
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
      handleMulterError,
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
        const backendUrl = config.backend_url || '';
        const baseUrl = backendUrl.endsWith('/') ? backendUrl?.slice(0, -1) : backendUrl;
        req.body.imageUrl = `${baseUrl}/upload/${files['file'][0].filename}`;
      }
      
      // Handle speaker images - Always process speakers array for updates
      if (req.body.speakers && Array.isArray(req.body.speakers)) {
        const speakerFiles = files && files['speakerFiles'] ? files['speakerFiles'] : [];
        const backendUrl = config.backend_url || '';
        const baseUrl = backendUrl.endsWith('/') ? backendUrl?.slice(0, -1) : backendUrl;
        
        console.log('🔍 Processing speakers:', {
          speakersCount: req.body.speakers.length,
          speakerFilesCount: speakerFiles.length,
          speakerFiles: speakerFiles.map(f => f.filename)
        });
        
        // Update speakers array with image URLs
        req.body.speakers = req.body.speakers?.map((speaker: Speaker, index: number) => {
          const updatedSpeaker: Partial<Speaker> = { ...speaker };
          
          // Only set imageUrl if there's a new file or existing imageUrl
          if (speakerFiles[index]) {
            updatedSpeaker.imageUrl = `${baseUrl}/upload/${speakerFiles[index].filename}`;
            console.log(`✅ Set imageUrl for speaker ${index}:`, updatedSpeaker.imageUrl);
          } else if (speaker.imageUrl && speaker.imageUrl.trim()) {
            updatedSpeaker.imageUrl = speaker.imageUrl;
            console.log(`🔄 Kept existing imageUrl for speaker ${index}:`, updatedSpeaker.imageUrl);
          } else {
            // Remove imageUrl field if it doesn't exist
            delete updatedSpeaker.imageUrl;
            console.log(`❌ No imageUrl for speaker ${index}`);
          }
          
          return updatedSpeaker;
        });
      }
    }
    next();
  },
      validateRequest(Validationevent.eventValidationUpdate),
      handleMulterError,
      eventController.Updateevent,
);
router.delete(
  '/:id',
  auth(USER_ROLE.superAdmin, USER_ROLE.admin),
  eventController.Deletedevent,
);
export const eventRouter = router;
