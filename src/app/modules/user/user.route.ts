import express from 'express';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { handleFileUpload } from '../../middlewares/fileUpload';
import { USER_ROLE } from './user.constant';
import { UserValidation } from './user.validation';
import { UserControllers } from './user.controller';

const router = express.Router();

// ===== USER CREATION =====

// Create user with optional file upload
router.post(
  '/create',
  auth(USER_ROLE.superAdmin, USER_ROLE.admin),
  ...handleFileUpload('file'),
  validateRequest(UserValidation.createResearchMemberValidationSchema),
  UserControllers.createUser,
);

// Create user without file upload (JSON only)
router.post(
  '/create-json',
  auth(USER_ROLE.superAdmin, USER_ROLE.admin),
  validateRequest(UserValidation.createResearchMemberJsonValidationSchema),
  UserControllers.createUser,
);

// ===== USER RETRIEVAL =====

// Get current user profile
router.get(
  '/me',
  auth(USER_ROLE.superAdmin, USER_ROLE.admin, USER_ROLE.user),
  UserControllers.getMe,
);

// Get all users with optional filtering
router.get(
  '/all',
  auth(USER_ROLE.superAdmin, USER_ROLE.admin),
  UserControllers.getAllUsers,
);

// Get all users (public - limited fields)
router.get(
  '/all-users',
  auth(USER_ROLE.superAdmin, USER_ROLE.admin, USER_ROLE.user),
  UserControllers.getAllUsers,
);

// Get research members (public)
router.get(
  '/research-members',
  UserControllers.getAllUsers,
);

// Get platform statistics (admin only)
router.get(
  '/stats/platform',
  auth(USER_ROLE.superAdmin, USER_ROLE.admin),
  UserControllers.getPlatformStats,
);

// Get personal statistics
router.get(
  '/stats/personal',
  auth(USER_ROLE.superAdmin, USER_ROLE.admin, USER_ROLE.user),
  UserControllers.getPersonalStats,
);

// Search users
router.get(
  '/search',
  auth(USER_ROLE.superAdmin, USER_ROLE.admin, USER_ROLE.user),
  UserControllers.searchUsers,
);

// ===== RESEARCH MEMBER SPECIFIC =====

// Update research member by ID (admin only)
router.patch(
  '/research-members/:id',
  auth(USER_ROLE.superAdmin, USER_ROLE.admin),
  validateRequest(UserValidation.updateResearchMemberValidationSchema),
  UserControllers.updateUser,
);

// Update current user as research member (with file upload)
router.put(
  '/research-members/me',
  auth(USER_ROLE.superAdmin, USER_ROLE.admin, USER_ROLE.user),
  ...handleFileUpload('file'),
  validateRequest(UserValidation.updateResearchMemberValidationSchema),
  UserControllers.updateCurrentUser,
);

// ===== USER MANAGEMENT =====

// Toggle user role (admin only)
router.put(
  '/toggle-role/:id',
  auth(USER_ROLE.superAdmin, USER_ROLE.admin),
  UserControllers.toggleUserRole,
);

// Delete user (admin only)
router.delete(
  '/:id',
  auth(USER_ROLE.superAdmin, USER_ROLE.admin),
  UserControllers.deleteUser,
);

// Delete research member (admin only)
router.delete(
  '/research-members/:id',
  auth(USER_ROLE.superAdmin, USER_ROLE.admin),
  UserControllers.deleteUser,
);

// ===== SUPERADMIN MANAGEMENT =====

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

// ===== LEGACY ROUTES FOR BACKWARD COMPATIBILITY =====

// Legacy route aliases to maintain existing frontend compatibility
router.post(
  '/create-ResearchMembar', 
  auth(USER_ROLE.superAdmin, USER_ROLE.admin),
  ...handleFileUpload('file'),
  validateRequest(UserValidation.createResearchMemberValidationSchema),
  UserControllers.createUser
);
router.post(
  '/create-ResearchMembars', 
  auth(USER_ROLE.superAdmin, USER_ROLE.admin),
  validateRequest(UserValidation.createResearchMemberJsonValidationSchema),
  UserControllers.createUser
);
router.get('/userinfo', UserControllers.getPlatformStats);
router.get('/personalinfo', UserControllers.getPersonalStats);
router.put('/userToadmin/:id', UserControllers.toggleUserRole);

export const UserRoutes = router;
