import { Prisma } from "@prisma/client";
import { prisma } from "../config/prisma";

export const activityRepository = {
  list(upcomingOnly = false) {
    return prisma.activity.findMany({
      where: { deletedAt: null, ...(upcomingOnly ? { endDate: { gte: new Date() } } : {}) },
      orderBy: { startDate: "asc" },
    });
  },

  findById(id: string) {
    return prisma.activity.findFirst({ where: { id, deletedAt: null } });
  },

  create(data: Prisma.ActivityUncheckedCreateInput) {
    return prisma.activity.create({ data });
  },

  update(id: string, data: Prisma.ActivityUncheckedUpdateInput) {
    return prisma.activity.update({ where: { id }, data });
  },

  softDelete(id: string) {
    return prisma.activity.update({ where: { id }, data: { deletedAt: new Date() } });
  },
};
