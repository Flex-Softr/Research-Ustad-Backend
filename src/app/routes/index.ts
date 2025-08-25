import { Router } from 'express';
import { AuthRoutes } from '../modules/Auth/auth.route';
import { ResearchPaperRoutes } from '../modules/ResearchPaper/ResearchPaper.route';
import { CourseRouter } from '../modules/Course/Course.router';
import { eventRouter } from '../modules/Event/event.router';
import { blogRouter } from '../modules/Blog/blog.router';
import { UserRoutes } from '../modules/user/user.route';
import { CategoryRouter } from '../modules/Category/Category.router';
import { BlogCategoryRouter } from '../modules/BlogCategory/BlogCategory.router';

const router = Router();
const moduleRoutes = [
  {
    path: '/auth',
    route: AuthRoutes,
  },
  {
    path: '/users',
    route: UserRoutes,
  },
  {
    path: '/paper',
    route: ResearchPaperRoutes,
  },

  {
    path: '/course',
    route: CourseRouter,
  },
  {
    path: '/event',
    route: eventRouter,
  },
  {
    path: '/blog',
    route: blogRouter,
  },
  {
    path: '/category',
    route: CategoryRouter,
  },
  {
    path: '/blog-category',
    route: BlogCategoryRouter,
  },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
