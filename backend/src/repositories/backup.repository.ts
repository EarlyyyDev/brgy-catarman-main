import { Prisma } from "@prisma/client";
import { prisma } from "../config/prisma";
import { SAFE_USER_SELECT } from "../utils/prismaSelectors.util";

export const backupRepository = {
  create(data: {
    fileName: string;
    sizeMb: Prisma.Decimal | number;
    type: "MANUAL" | "AUTOMATIC";
    status: "COMPLETED" | "FAILED" | "IN_PROGRESS";
    triggeredById?: string | null;
  }) {
    return prisma.backupRecord.create({ data });
  },

  list(params: { skip?: number; take?: number }) {
    return prisma.backupRecord.findMany({
      orderBy: { createdAt: "desc" },
      skip: params.skip,
      take: params.take,
      include: { triggeredBy: { select: SAFE_USER_SELECT } },
    });
  },

  count() {
    return prisma.backupRecord.count();
  },

  findById(id: string) {
    return prisma.backupRecord.findUnique({
      where: { id },
      include: { triggeredBy: { select: SAFE_USER_SELECT } },
    });
  },

  delete(id: string) {
    return prisma.backupRecord.delete({ where: { id } });
  },
};
