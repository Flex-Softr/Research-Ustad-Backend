/* eslint-disable @typescript-eslint/no-explicit-any */
import express, { NextFunction, Request, Response } from 'express';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { upload } from '../../utils/upload';
import { USER_ROLE } from './user.constant';
import { ResearchAssociateValidation } from '../ResearchMembar/ResearchMembar.validation';
import { UserControllers } from './user.controller';

const router = express.Router();
router.post(
  '/create-ResearchMembar',
  auth(USER_ROLE.superAdmin, USER_ROLE.admin),
  upload.single('file'),
  (req: Request, res: Response, next: NextFunction) => {
    if (req.body.data) {
      req.body = JSON.parse(req.body.data);
      
      // Handle file upload like event module
      if (req.file) {
        const baseUrl = `http://localhost:${process.env.PORT || 5000}`;
        req.body.profileImg = `${baseUrl}/upload/${req.file.filename}`;
      }
    }
    next();
  },
  validateRequest(ResearchAssociateValidation.createValidationSchema),
  UserControllers.createResearchMembar,
);

router.post(
  '/create-ResearchMembars',
  validateRequest(ResearchAssociateValidation.createValidationSchemaJson),
  UserControllers.createResearchMembars,
);

router.get(
  '/me',
  auth(USER_ROLE.superAdmin, USER_ROLE.admin, USER_ROLE.user),
  UserControllers.getMe,
);

router.get(
  '/all',
  auth(USER_ROLE.superAdmin, USER_ROLE.admin),
  UserControllers.Alluser,
);

router.get(
  '/userinfo',
  auth(USER_ROLE.superAdmin, USER_ROLE.admin),
  UserControllers.AllInfo,
);

router.get(
  '/personalinfo',
  auth(USER_ROLE.superAdmin, USER_ROLE.admin, USER_ROLE.user),
  UserControllers.AllInfoForPersonal,
);
router.put(
  '/userToadmin/:id',
  auth(USER_ROLE.superAdmin, USER_ROLE.admin),
  UserControllers.userToadmin,
);

export const UserRoutes = router;
