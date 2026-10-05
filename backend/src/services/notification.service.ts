import { NotificationType } from "@prisma/client";
import { Request } from "express";
import { notificationRepository } from "../repositories/notification.repository";
import { ApiError } from "../utils/apiError.util";
import { parsePagination, toPaginationResult } from "../utils/pagination.util";
import { activityLogService } from "./activityLog.service";

async function list(req: Request) {
  const params = parsePagination(req);
  const [items, total, unreadCount] = await Promise.all([
    notificationRepository.list({ skip: params.skip, take: params.take }),
    notificationRepository.count(),
    notificationRepository.countUnread(),
  ]);
  return { ...toPaginationResult(items, total, params), unreadCount };
}

async function create(
  data: { title: string; message: string; type: NotificationType; link?: string | null },
  req: Request,
) {
  const notification = await notificationRepository.create(data);
  await activityLogService.log({ req, action: "Created notification", module: "SETTINGS", description: data.title });
  return notification;
}

async function markRead(id: string) {
  const existing = await notificationRepository.findById(id);
  if (!existing) throw ApiError.notFound("Notification not found");
  return notificationRepository.markRead(id);
}

async function markAllRead() {
  await notificationRepository.markAllRead();
}

async function remove(id: string, req: Request) {
  const existing = await notificationRepository.findById(id);
  if (!existing) throw ApiError.notFound("Notification not found");
  await notificationRepository.delete(id);
  await activityLogService.log({ req, action: "Deleted notification", module: "SETTINGS", description: existing.title });
}

export const notificationService = { list, create, markRead, markAllRead, remove };
