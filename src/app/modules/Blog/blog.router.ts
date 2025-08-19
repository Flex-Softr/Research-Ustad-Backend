import { Router, NextFunction, Request, Response } from 'express';
import { USER_ROLE } from '../user/user.constant';
import validateRequest from '../../middlewares/validateRequest';
import auth from '../../middlewares/auth';
import { blogController } from './blog.controller';
import { Validationblog } from './blog.validation';
import { upload } from '../../utils/upload';
import config from '../../config';

const router = Router();

// Public routes
router.get('/', blogController.Getblog);

// Protected routes for all authenticated users - SPECIFIC ROUTES FIRST
router.get(
  '/author',
  auth(USER_ROLE.superAdmin, USER_ROLE.admin, USER_ROLE.user),
  blogController.Authorblog,
);

// Admin only routes - SPECIFIC ROUTES FIRST
router.get(
  '/admin/all',
  auth(USER_ROLE.superAdmin, USER_ROLE.admin),
  blogController.GetAllBlogsForAdmin,
);

// PARAMETERIZED ROUTES LAST
router.get('/:id', blogController.Getblogsingle);

// Create blog - allow users, admins, and super admins
router.post(
  '/',
  auth(USER_ROLE.superAdmin, USER_ROLE.admin, USER_ROLE.user),
  upload.single('file'),
  (req: Request, res: Response, next: NextFunction) => {
    if (req.body.data) {
      req.body = JSON.parse(req.body.data);
      // Handle main blog image
      if (req.file) {
        const backendUrl = config.backend_url || '';
        const baseUrl = backendUrl.endsWith('/')
          ? backendUrl.slice(0, -1)
          : backendUrl;
        req.body.imageUrl = `${baseUrl}/upload/${req.file.filename}`;
      }
    }
    next();
  },
  validateRequest(Validationblog.blogValidationPost),
  blogController.Postblog,
);

// Update blog - allow users, admins, and super admins
router.patch(
  '/:id',
  auth(USER_ROLE.superAdmin, USER_ROLE.admin, USER_ROLE.user),
  upload.single('file'),
  (req: Request, res: Response, next: NextFunction) => {
    if (req.body.data) {
      req.body = JSON.parse(req.body.data);
      if (req.file) {
        // Set the full URL for the uploaded image
        const backendUrl = config.backend_url || '';
        const baseUrl = backendUrl.endsWith('/')
          ? backendUrl.slice(0, -1)
          : backendUrl;
        req.body.imageUrl = `${baseUrl}/upload/${req.file.filename}`;
      }
    }
    next();
  },
  validateRequest(Validationblog.blogValidationUpdate),
  blogController.Updateblog,
);

// Delete blog - allow users, admins, and super admins
router.delete(
  '/:id',
  auth(USER_ROLE.superAdmin, USER_ROLE.admin, USER_ROLE.user),
  blogController.Deletedblog,
);

// Approve or reject blog - admin and super admin only
router.patch(
  '/:id/status',
  auth(USER_ROLE.superAdmin, USER_ROLE.admin),
  validateRequest(Validationblog.blogStatusValidation),
  blogController.UpdateBlogStatus,
);

export const blogRouter = router;
