import { NextFunction, Request, Response, Router } from 'express';
import { eventController } from './event.controller';
// import { upload } from "../../utils/upload ";
import validateRequest from '../../middlewares/validateRequest';
import { USER_ROLE } from '../User/user.constant';
import auth from '../../middlewares/auth';
import { Validationevent } from './event.validation';
import { upload } from '../../utils/upload';

const router = Router();
router.get('/', eventController.Getevent);
router.get('/:id', eventController.GetSingleEvent);
router.post(
  '/',
  auth(USER_ROLE.superAdmin, USER_ROLE.admin),
  upload.single('file'),
  (req: Request, res: Response, next: NextFunction) => {
    if (req.body.data) {
      req.body = JSON.parse(req.body.data);
      if (req.file) {
        req.body.imageUrl = `/upload/${req.file.filename}`;
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
  upload.single('file'),
  (req: Request, res: Response, next: NextFunction) => {
    if (req.body.data) {
      req.body = JSON.parse(req.body.data);
      if (req.file) {
        req.body.imageUrl = `/upload/${req.file.filename}`;
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
