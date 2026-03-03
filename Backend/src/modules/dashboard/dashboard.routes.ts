import { Router } from 'express';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { authenticate } from '../../shared/middlewares/auth.middleware';

const router = Router();

const dashboardService = new DashboardService();
const dashboardController = new DashboardController(dashboardService);

router.use(authenticate);

router.get('/summary', dashboardController.getSummary);
router.get('/by-category', dashboardController.getByCategory);
router.get('/recent', dashboardController.getRecent);

export default router;
