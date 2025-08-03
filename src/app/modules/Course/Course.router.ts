import { NextFunction, Request, Response, Router } from "express";
import { courseController } from "./Course.controller";
import validateRequest from "../../middlewares/validateRequest";
import { ValidationCourse } from "./Course.validation";
import { USER_ROLE } from "../user/user.constant";
import auth from "../../middlewares/auth";
import config from "../../config";
import { upload } from "../../utils/upload";

// Define instructor interface
interface Instructor {
  name: string;
  imageUrl: string;
  specialization: string;
  experience: string;
  rating: number;
  students: number;
}

const router = Router();

// Get all courses
router.get('/', courseController.GetCourse);

// Get single course
router.get('/:id', courseController.GetSingleCourse);

// Create course
router.post(
  '/',
  auth(USER_ROLE.superAdmin, USER_ROLE.admin),
  upload.fields([
    { name: 'file', maxCount: 1 }, // Main course image
    { name: 'instructorFiles', maxCount: 10 } // Instructor images (up to 10 instructors)
  ]),
  (req: Request, res: Response, next: NextFunction) => {
    if (req.body.data) {
      req.body = JSON.parse(req.body.data);
      
      // Handle main course image
      const files = req.files as { [fieldname: string]: { filename: string }[] };
      if (files && files['file'] && files['file'][0]) {
        const baseUrl = `http://localhost:${config.port}`;
        req.body.imageUrl = `${baseUrl}/upload/${files['file'][0].filename}`;
      }
      
      // Handle instructor images
      if (files && files['instructorFiles']) {
        const instructorFiles = files['instructorFiles'];
        const baseUrl = `http://localhost:${config.port}`;
        
        // Update instructors array with image URLs
        if (req.body.instructors && Array.isArray(req.body.instructors)) {
          req.body.instructors = req.body.instructors.map((instructor: Instructor, index: number) => ({
            ...instructor,
            imageUrl: instructorFiles[index] 
              ? `${baseUrl}/upload/${instructorFiles[index].filename}`
              : instructor.imageUrl || ''
          }));
        }
      }
    }
    next();
  },
  validateRequest(ValidationCourse.courseValidationPost),
  courseController.PostCourse
);

// Update course
router.patch(
  '/:id',
  auth(USER_ROLE.superAdmin, USER_ROLE.admin),
  upload.fields([
    { name: 'file', maxCount: 1 }, // Main course image
    { name: 'instructorFiles', maxCount: 10 } // Instructor images (up to 10 instructors)
  ]),
  (req: Request, res: Response, next: NextFunction) => {
    if (req.body.data) {
      req.body = JSON.parse(req.body.data);
      
      // Handle main course image
      const files = req.files as { [fieldname: string]: { filename: string }[] };
      if (files && files['file'] && files['file'][0]) {
        const baseUrl = config.backend_url;
        req.body.imageUrl = `${baseUrl}/upload/${files['file'][0].filename}`;
      }
      
      // Handle instructor images
      if (files && files['instructorFiles']) {
        const instructorFiles = files['instructorFiles'];
        const baseUrl = config.backend_url;
        
        // Update instructors array with image URLs
        if (req.body.instructors && Array.isArray(req.body.instructors)) {
          req.body.instructors = req.body.instructors.map((instructor: Instructor, index: number) => ({
            ...instructor,
            imageUrl: instructorFiles[index] 
              ? `${baseUrl}/upload/${instructorFiles[index].filename}`
              : instructor.imageUrl || ''
          }));
        }
      }
    }
    next();
  },
  validateRequest(ValidationCourse.courseValidationUpdate),
  courseController.UpdateCourse
);

// Delete course
router.delete(
  '/:id',
  auth(USER_ROLE.superAdmin, USER_ROLE.admin),
  courseController.DeletedCourse
);

export const CourseRouter = router;