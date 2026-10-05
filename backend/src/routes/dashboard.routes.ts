import { Router } from "express";
import * as dashboardController from "../controllers/dashboard.controller";
import { requireAuth } from "../middlewares/auth.middleware";

const router = Router();

router.use(requireAuth);

router.get("/stats", dashboardController.getDashboardStats);
router.get("/revenue", dashboardController.getRevenueAnalytics);
router.get("/revenue/monthly", dashboardController.getMonthlyRevenue);

export default router;
