import { Request, Response } from "express";
import { dashboardService } from "../services/dashboard.service";
import { sendSuccess } from "../utils/apiResponse.util";
import { asyncHandler } from "../utils/asyncHandler.util";

export const getDashboardStats = asyncHandler(async (_req: Request, res: Response) => {
  sendSuccess(res, await dashboardService.getStats());
});

export const getPublicDashboardStats = asyncHandler(async (_req: Request, res: Response) => {
  sendSuccess(res, await dashboardService.getPublicStats());
});

export const getRevenueAnalytics = asyncHandler(async (_req: Request, res: Response) => {
  sendSuccess(res, await dashboardService.getRevenueAnalytics());
});

export const getMonthlyRevenue = asyncHandler(async (req: Request, res: Response) => {
  const year = typeof req.query.year === "string" ? req.query.year : "";
  sendSuccess(res, await dashboardService.getMonthlyRevenue(year));
});
