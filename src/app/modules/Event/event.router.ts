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
    { name: 'speakerFiles', maxCount: 10 }, // Speaker images (up to 10 speakers)
  ]),
  (req: Request, res: Response, next: NextFunction) => {
    if (req.body.data) {
      req.body = JSON.parse(req.body.data);

      // Optimized file handling - only process if files exist
      const files = req.files as {
        [fieldname: string]: { filename: string }[];
      };
      const backendUrl = config.backend_url || '';
      const baseUrl = backendUrl.endsWith('/')
        ? backendUrl?.slice(0, -1)
        : backendUrl;

      // Handle main event image (simplified)
      if (files?.['file']?.[0]) {
        req.body.imageUrl = `${baseUrl}/upload/${files['file'][0].filename}`;
      }

      // Handle speaker images (simplified - only if files exist)
      if (files?.['speakerFiles'] && req.body.speakers?.length) {
        const speakerFiles = files['speakerFiles'];
        req.body.speakers = req.body.speakers.map(
          (speaker: Speaker, index: number) => ({
            ...speaker,
            imageUrl: speakerFiles[index]
              ? `${baseUrl}/upload/${speakerFiles[index].filename}`
              : speaker.imageUrl || '',
          }),
        );
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
    { name: 'speakerFiles', maxCount: 10 }, // Speaker images (up to 10 speakers)
  ]),
  (req: Request, res: Response, next: NextFunction) => {
    if (req.body.data) {
      req.body = JSON.parse(req.body.data);

      // Handle main event image
      const files = req.files as {
        [fieldname: string]: { filename: string }[];
      };
      if (files && files['file'] && files['file'][0]) {
        const backendUrl = config.backend_url || '';
        const baseUrl = backendUrl.endsWith('/')
          ? backendUrl?.slice(0, -1)
          : backendUrl;
        req.body.imageUrl = `${baseUrl}/upload/${files['file'][0].filename}`;
      }

      // Optimized speaker image handling for updates
      if (req.body.speakers?.length && files?.['speakerFiles']) {
        const speakerFiles = files['speakerFiles'];
        const backendUrl = config.backend_url || '';
        const baseUrl = backendUrl.endsWith('/')
          ? backendUrl?.slice(0, -1)
          : backendUrl;

        // Update speakers array with image URLs (simplified)
        req.body.speakers = req.body.speakers.map(
          (speaker: Speaker, index: number) => ({
            ...speaker,
            imageUrl: speakerFiles[index]
              ? `${baseUrl}/upload/${speakerFiles[index].filename}`
              : speaker.imageUrl || '',
          }),
        );
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
