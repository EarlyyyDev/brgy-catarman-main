import { ActivityModule, ActivityActorRole, ActivityStatus } from "@prisma/client";
import { prisma } from "../config/prisma";

export const activityLogRepository = {
  create(data: {
    actorId?: string | null;
    actorName: string;
    actorRole: ActivityActorRole;
    action: string;
    module: ActivityModule;
    description?: string;
    ipAddress?: string;
    browser?: string;
    status?: ActivityStatus;
  }) {
    return prisma.activityLog.create({ data });
  },

  list(params: { module?: ActivityModule; actorId?: string; skip?: number; take?: number }) {
    return prisma.activityLog.findMany({
      where: { module: params.module, actorId: params.actorId },
      orderBy: { timestamp: "desc" },
      skip: params.skip,
      take: params.take,
    });
  },

  count(params: { module?: ActivityModule; actorId?: string }) {
    return prisma.activityLog.count({ where: { module: params.module, actorId: params.actorId } });
  },
};
