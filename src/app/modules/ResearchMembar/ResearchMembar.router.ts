import express from 'express';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
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