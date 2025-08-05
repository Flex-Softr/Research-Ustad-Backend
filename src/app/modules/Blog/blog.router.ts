import { Router, NextFunction, Request, Response } from 'express';
import { USER_ROLE } from '../user/user.constant';
import validateRequest from '../../middlewares/validateRequest';
import auth from '../../middlewares/auth';
import { blogController } from './blog.controller';
import { Validationblog } from './blog.validation';
import { upload } from '../../utils/upload';
import config from '../../config';

const router = Router();
router.get('/', blogController.Getblog);
router.get('/author', auth(USER_ROLE.superAdmin, USER_ROLE.admin, USER_ROLE.user), blogController.Authorblog);
router.get('/:id', blogController.Getblogsingle);
router.post(
  '/',
  auth(USER_ROLE.superAdmin, USER_ROLE.admin),
  upload.single('file'),
  (req: Request, res: Response, next: NextFunction) => {

    
    if (req.body.data) {
      req.body = JSON.parse(req.body.data);
        // Handle main blog image
      if (req.file) {
        const backendUrl = config.backend_url || '';
        const baseUrl = backendUrl.endsWith('/') ? backendUrl.slice(0, -1) : backendUrl;
        console.log("Blog Upload - Base URL:", baseUrl);
        console.log("Blog Upload - Filename:", req.file.filename);
        req.body.imageUrl = `${baseUrl}/upload/${req.file.filename}`;
        console.log("Blog Upload - Final Image URL:", req.body.imageUrl);
      }
    }
    next();
  },
  validateRequest(Validationblog.blogValidationPost),
  blogController.Postblog,
);
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
        const baseUrl = backendUrl.endsWith('/') ? backendUrl.slice(0, -1) : backendUrl;
        console.log("Blog Update - Base URL:", baseUrl);
        console.log("Blog Update - Filename:", req.file.filename);
        req.body.imageUrl = `${baseUrl}/upload/${req.file.filename}`;
        console.log("Blog Update - Final Image URL:", req.body.imageUrl);
      }
    }
    next();
  },
  validateRequest(Validationblog.blogValidationUpdate),
  blogController.Updateblog,
);

router.delete(
  '/:id',
  auth(USER_ROLE.superAdmin, USER_ROLE.admin, USER_ROLE.user),
  blogController.Deletedblog,
);
export const blogRouter = router;
