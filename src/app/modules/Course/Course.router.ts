import { NextFunction, Request, Response, Router } from "express";
import { courseController } from "./Course.controller";
import { upload } from "../../utils/upload";
import validateRequest from "../../middlewares/validateRequest";
import { ValidationCourse } from "./Course.validation";
import { USER_ROLE } from "../User/user.constant";
import auth from "../../middlewares/auth";
import config from "../../config";

const router = Router();
router.get('/', courseController.GetCourse)
router.post('/',   auth(USER_ROLE.superAdmin,USER_ROLE.admin),
 upload.single('file'),
 (req: Request, res: Response, next: NextFunction) => {
    if (req.body.data) {
      req.body = JSON.parse(req.body.data);
      if (req.file) {
        // Set the full URL for the uploaded image
        const baseUrl = `http://localhost:${config.port}`;
        req.body.imageUrl = `${baseUrl}/upload/${req.file.filename}`;
      }
    }
    next();
  },
  validateRequest(ValidationCourse.courseValidationPost),
 courseController.PostCourse)
router.patch('/:id',auth(USER_ROLE.superAdmin,USER_ROLE.admin),
 upload.single('file'),
 (req: Request, res: Response, next: NextFunction) => {
    if (req.body.data) {
      req.body = JSON.parse(req.body.data);
      if (req.file) {
        // Set the full URL for the uploaded image
        const baseUrl = `http://localhost:${config.port}`;
        req.body.imageUrl = `${baseUrl}/upload/${req.file.filename}`;
      }
    }
    next();
  },
  validateRequest(ValidationCourse.courseValidationUpdate),
courseController.UpdateCourse)
router.delete('/:id',auth(USER_ROLE.superAdmin,USER_ROLE.admin),courseController.DeletedCourse)
export const CourseRouter = router;