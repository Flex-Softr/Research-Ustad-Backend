import express from 'express';
import auth from '../../middlewares/auth';
import { USER_ROLE } from '../user/user.constant';
import { ResearchPaperControllers } from './ResearchPaper.controller';
import validateRequest from '../../middlewares/validateRequest';
import { researchPaperSchema } from './ResearchPaper.validation';
const router = express.Router();
router.post(
  '/add',
  auth(USER_ROLE.superAdmin, USER_ROLE.user, USER_ROLE.admin),
  validateRequest(researchPaperSchema),
  ResearchPaperControllers.postResearchUstad,
);
router.get(
  '/public',
  ResearchPaperControllers.getPublicResearchUstad,
);
router.get(
  '/all',
  auth(USER_ROLE.superAdmin,USER_ROLE.admin),
  ResearchPaperControllers.getAllResearchUstad,
);
router.get(
  '/onging',
  ResearchPaperControllers.getOngingResearchUstad
);
router.get(
  '/personalPapers/:id',
  ResearchPaperControllers.getpersonalPaperResearchUstad
);


router.get(
  '/personalPaper/:id',
  ResearchPaperControllers.getpersonalPaperResearchUstadforid
);

router.get(
  '/personalPaper',
  auth(USER_ROLE.superAdmin, USER_ROLE.user, USER_ROLE.admin),
  ResearchPaperControllers.getpersonalPaperResearch
);

router.put(
  '/approve/:id',
  auth(USER_ROLE.superAdmin,USER_ROLE.admin),
  ResearchPaperControllers.approveResearchUstad,
);
router.put(
  '/reject/:id',
  auth(USER_ROLE.superAdmin,USER_ROLE.admin),
  ResearchPaperControllers.rejectResearchUstad,
);
router.delete(
    '/delete/:id',
    auth(USER_ROLE.superAdmin,USER_ROLE.admin,USER_ROLE.user),   
     ResearchPaperControllers.deleteResearchUstad,
);
export const ResearchPaperRoutes = router;