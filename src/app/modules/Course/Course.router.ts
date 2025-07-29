import { NextFunction, Request, Response, Router } from "express";
import { courseController } from "./Course.controller";
import { upload } from "../../utils/upload";
import validateRequest from "../../middlewares/validateRequest";
import { ValidationCourse } from "./Course.validation";
import { USER_ROLE } from "../User/user.constant";
import auth from "../../middlewares/auth";

const router = Router();
router.get('/', courseController.GetCourse)
router.post('/',   auth(USER_ROLE.superAdmin,USER_ROLE.admin),
 upload.single('file'),
 (req: Request, res: Response, next: NextFunction) => {
    req.body = JSON.parse(req.body.data);
    next();
  },
  validateRequest(ValidationCourse.courseValidationPost),
 courseController.PostCourse)
router.patch('/:id',auth(USER_ROLE.superAdmin,USER_ROLE.admin),validateRequest(ValidationCourse.courseValidationUpdate),
courseController.UpdateCourse)
router.delete('/:id',auth(USER_ROLE.superAdmin,USER_ROLE.admin),courseController.DeletedCourse)
export const CourseRouter = router;