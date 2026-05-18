import { Router } from 'express';
import { DashboardController } from '../controllers/dashboard.controller';
import { authenticate } from '../middlewares/auth.middleware';

const dashboardRoutes = Router();
const dashboardController = new DashboardController();

dashboardRoutes.use(authenticate); // Requer login

dashboardRoutes.get('/:restaurantId', dashboardController.getMetrics);

export { dashboardRoutes };