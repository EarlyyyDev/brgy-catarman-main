import { prisma } from "../config/prisma";

export const sessionRepository = {
  create(data: { userId: string; userAgent?: string; ipAddress?: string; expiresAt: Date }) {
    return prisma.session.create({ data });
  },

  findActiveById(id: string) {
    return prisma.session.findFirst({
      where: { id, revokedAt: null, expiresAt: { gt: new Date() } },
    });
  },

  touchLastUsed(id: string) {
    return prisma.session.update({ where: { id }, data: { lastUsedAt: new Date() } });
  },

  revoke(id: string) {
    return prisma.session.update({ where: { id }, data: { revokedAt: new Date() } });
  },

  async revokeAllForUser(userId: string) {
    await prisma.session.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  },
};
