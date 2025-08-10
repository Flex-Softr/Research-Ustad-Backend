import express, { NextFunction, Request, Response } from 'express';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { upload } from '../../utils/upload';
import config from '../../config';
import { USER_ROLE } from '../user/user.constant';
import { AssociateControllers } from './ResearchMembar.controller';
import { ResearchAssociateValidation } from './ResearchMembar.validation';
const router = express.Router();
router.get(
  '/singleGe/:id',
  AssociateControllers.getSingleAssociate,
);
router.get(
  '/singleGet',
  auth(USER_ROLE.superAdmin, USER_ROLE.admin, USER_ROLE.user),
  AssociateControllers.getsingleGetMembar,
);

router.patch(
  '/:id',
  auth(USER_ROLE.superAdmin, USER_ROLE.admin),
  validateRequest(ResearchAssociateValidation.UpdateValidationSchema),
  AssociateControllers.updateAssociate,
);
router.put(
  '/MembarUpdate',
  auth(USER_ROLE.superAdmin, USER_ROLE.admin, USER_ROLE.user),
  upload.single('file'),
  (req: Request, res: Response, next: NextFunction) => {
    if (req.body.data) {
      req.body = JSON.parse(req.body.data);
      
      // Handle file upload
      if (req.file) {
        const backendUrl = config.backend_url || '';
        const baseUrl = backendUrl.endsWith('/') ? backendUrl.slice(0, -1) : backendUrl;
        req.body.ResearchMembar.profileImg = `${baseUrl}/upload/${req.file.filename}`;
      }
    }
    next();
  },
  validateRequest(ResearchAssociateValidation.UpdateValidationSchema),
  AssociateControllers.updateForuserAssociate,
);

router.delete(
  '/:id',
  auth(USER_ROLE.superAdmin,USER_ROLE.admin),
  AssociateControllers.deleteAssociate,
);

router.get(
  '/',
  AssociateControllers.getAllAssociate,
);

export const AssociateRoutes = router;