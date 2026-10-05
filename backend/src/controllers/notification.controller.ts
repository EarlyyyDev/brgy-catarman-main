import { Request, Response } from "express";
import { notificationService } from "../services/notification.service";
import { sendSuccess } from "../utils/apiResponse.util";
import { asyncHandler } from "../utils/asyncHandler.util";

export const listNotifications = asyncHandler(async (req: Request, res: Response) => {
  const result = await notificationService.list(req);
  sendSuccess(res, result);
});

export const createNotification = asyncHandler(async (req: Request, res: Response) => {
  const notification = await notificationService.create(req.body, req);
  sendSuccess(res, notification, 201);
});

export const markNotificationRead = asyncHandler(async (req: Request<{ id: string }>, res: Response) => {
  sendSuccess(res, await notificationService.markRead(req.params.id));
});

export const markAllNotificationsRead = asyncHandler(async (_req: Request, res: Response) => {
  await notificationService.markAllRead();
  sendSuccess(res, { message: "All notifications marked as read." });
});

export const deleteNotification = asyncHandler(async (req: Request<{ id: string }>, res: Response) => {
  await notificationService.remove(req.params.id, req);
  sendSuccess(res, { message: "Notification deleted." });
});
