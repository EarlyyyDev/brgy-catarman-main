import { NotificationType } from "@prisma/client";
import { prisma } from "../config/prisma";

export const notificationRepository = {
  list(params: { skip?: number; take?: number }) {
    return prisma.notification.findMany({
      orderBy: { createdAt: "desc" },
      skip: params.skip,
      take: params.take,
    });
  },

  count() {
    return prisma.notification.count();
  },

  countUnread() {
    return prisma.notification.count({ where: { isRead: false } });
  },

  findById(id: string) {
    return prisma.notification.findUnique({ where: { id } });
  },

  create(data: { title: string; message: string; type: NotificationType; link?: string | null }) {
    return prisma.notification.create({ data });
  },

  markRead(id: string) {
    return prisma.notification.update({ where: { id }, data: { isRead: true } });
  },

  markAllRead() {
    return prisma.notification.updateMany({ where: { isRead: false }, data: { isRead: true } });
  },

  delete(id: string) {
    return prisma.notification.delete({ where: { id } });
  },
};
