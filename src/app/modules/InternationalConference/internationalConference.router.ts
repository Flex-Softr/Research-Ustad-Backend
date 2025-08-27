import express from "express";
import auth from "../../middlewares/auth";
import { USER_ROLE } from "../user/user.constant";
import { InternationalConferenceController } from "./internationalConference.controller";
import validateRequest from "../../middlewares/validateRequest";
import { InternationalConferenceValidation } from "./internationalConference.validation";
import { upload } from "../../utils/upload";
import config from "../../config";
import { Request, Response, NextFunction } from "express";

const router = express.Router();

// Public routes
router.get("/public", InternationalConferenceController.getAllInternationalConferences);
router.get("/public/:id", InternationalConferenceController.getInternationalConferenceById);

// Admin routes
router.post(
  "/",
  auth(USER_ROLE.superAdmin, USER_ROLE.admin),
  upload.single('file'),
  (req: Request, res: Response, next: NextFunction) => {
    if (req.body.data) {
      req.body = JSON.parse(req.body.data);
      if (req.file) {
        const backendUrl = config.backend_url || '';
        const baseUrl = backendUrl.endsWith('/') ? backendUrl.slice(0, -1) : backendUrl;
        req.body.imageUrl = `${baseUrl}/upload/${req.file.filename}`;
      }
    }
    next();
  },
  validateRequest(InternationalConferenceValidation.createInternationalConferenceSchema),
  InternationalConferenceController.createInternationalConference
);

router.get(
  "/",
  auth(USER_ROLE.superAdmin, USER_ROLE.admin),
  InternationalConferenceController.getAllInternationalConferencesForAdmin
);

router.get(
  "/:id",
  auth(USER_ROLE.superAdmin, USER_ROLE.admin),
  InternationalConferenceController.getInternationalConferenceById
);

router.put(
  "/:id",
  auth(USER_ROLE.superAdmin, USER_ROLE.admin),
  upload.single('file'),
  (req: Request, res: Response, next: NextFunction) => {
    if (req.body.data) {
      req.body = JSON.parse(req.body.data);
      if (req.file) {
        const backendUrl = config.backend_url || '';
        const baseUrl = backendUrl.endsWith('/') ? backendUrl.slice(0, -1) : backendUrl;
        req.body.imageUrl = `${baseUrl}/upload/${req.file.filename}`;
      }
    }
    next();
  },
  validateRequest(InternationalConferenceValidation.updateInternationalConferenceSchema),
  InternationalConferenceController.updateInternationalConference
);

router.delete(
  "/:id",
  auth(USER_ROLE.superAdmin, USER_ROLE.admin),
  InternationalConferenceController.deleteInternationalConference
);

export const InternationalConferenceRoutes = router;
