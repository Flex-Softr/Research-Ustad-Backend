import express from "express";
import auth from "../../middlewares/auth";
import { USER_ROLE } from "../user/user.constant";
import { AchievementController } from "./achievement.controller";
import validateRequest from "../../middlewares/validateRequest";
import { AchievementValidation } from "./achievement.validation";
import { upload } from "../../utils/upload";
import config from "../../config";
import { Request, Response, NextFunction } from "express";

const router = express.Router();

// Public routes
router.get("/public", AchievementController.getAllAchievements);
router.get("/public/:id", AchievementController.getAchievementById);

// Admin routes (require authentication)
router.post(
  "/",
  auth(USER_ROLE.superAdmin, USER_ROLE.admin),
  upload.single('file'),
  (req: Request, res: Response, next: NextFunction) => {
    if (req.body.data) {
      req.body = JSON.parse(req.body.data);
      // Handle achievement image
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
  validateRequest(AchievementValidation.createAchievementSchema),
  AchievementController.createAchievement
);

router.get(
  "/",
  auth(USER_ROLE.superAdmin, USER_ROLE.admin),
  AchievementController.getAllAchievementsForAdmin
);

router.get(
  "/:id",
  auth(USER_ROLE.superAdmin, USER_ROLE.admin),
  AchievementController.getAchievementById
);

router.put(
  "/:id",
  auth(USER_ROLE.superAdmin, USER_ROLE.admin),
  upload.single('file'),
  (req: Request, res: Response, next: NextFunction) => {
    if (req.body.data) {
      req.body = JSON.parse(req.body.data);
      // Handle achievement image
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
  validateRequest(AchievementValidation.updateAchievementSchema),
  AchievementController.updateAchievement
);

router.delete(
  "/:id",
  auth(USER_ROLE.superAdmin, USER_ROLE.admin),
  AchievementController.deleteAchievement
);

export const AchievementRoutes = router;
