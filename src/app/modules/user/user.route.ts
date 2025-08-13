import express from 'express';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { handleFileUpload } from '../../middlewares/fileUpload';
import { USER_ROLE } from './user.constant';
import { UserValidation } from './user.validation';
import { UserControllers } from './user.controller';

const router = express.Router();

// Research member creation routes
router.post(
  '/create-ResearchMembar',
  auth(USER_ROLE.superAdmin, USER_ROLE.admin),
  ...handleFileUpload('file'),
  validateRequest(UserValidation.createResearchMemberValidationSchema),
  UserControllers.createResearchMembar,
);

router.post(
  '/create-ResearchMembars',
  auth(USER_ROLE.superAdmin, USER_ROLE.admin),
  validateRequest(UserValidation.createResearchMemberJsonValidationSchema),
  UserControllers.createResearchMembars,
);

// User management routes
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

router.delete(
  '/:id',
  auth(USER_ROLE.superAdmin, USER_ROLE.admin),
  UserControllers.deleteUser,
);

router.get(
  '/search',
  auth(USER_ROLE.superAdmin, USER_ROLE.admin, USER_ROLE.user),
  UserControllers.searchUsers,
);

router.get(
  '/all-users',
  auth(USER_ROLE.superAdmin, USER_ROLE.admin, USER_ROLE.user),
  UserControllers.getAllUsers,
);

// Research member specific routes (maintaining backward compatibility)
router.get(
  '/research-members',
  UserControllers.getAllResearchMembers,
);

router.get(
  '/research-members/:id',
  UserControllers.getSingleResearchMember,
);

router.get(
  '/research-members/me',
  auth(USER_ROLE.superAdmin, USER_ROLE.admin, USER_ROLE.user),
  UserControllers.getSingleResearchMemberByEmail,
);

router.patch(
  '/research-members/:id',
  auth(USER_ROLE.superAdmin, USER_ROLE.admin),
  validateRequest(UserValidation.updateResearchMemberValidationSchema),
  UserControllers.updateResearchMember,
);

router.put(
  '/research-members/me',
  auth(USER_ROLE.superAdmin, USER_ROLE.admin, USER_ROLE.user),
  ...handleFileUpload('file'),
  validateRequest(UserValidation.updateResearchMemberValidationSchema),
  UserControllers.updateResearchMemberByEmail,
);

router.delete(
  '/research-members/:id',
  auth(USER_ROLE.superAdmin, USER_ROLE.admin),
  UserControllers.deleteResearchMember,
);

// ===== SUPERADMIN MANAGEMENT ROUTES =====

// Get current superAdmin information
router.get(
  '/superadmin/current',
  auth(USER_ROLE.superAdmin, USER_ROLE.admin, USER_ROLE.user),
  UserControllers.getCurrentSuperAdmin,
);

// Replace current superAdmin with a new one
router.post(
  '/superadmin/replace',
  auth(USER_ROLE.superAdmin), // Only current superAdmin can replace themselves
  validateRequest(UserValidation.replaceSuperAdminValidationSchema),
  UserControllers.replaceSuperAdmin,
);

export const UserRoutes = router;
