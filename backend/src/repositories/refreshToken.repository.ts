import { prisma } from "../config/prisma";

export const refreshTokenRepository = {
  create(data: { sessionId: string; userId: string; tokenHash: string; expiresAt: Date }) {
    return prisma.refreshToken.create({ data });
  },

  findByHash(tokenHash: string) {
    return prisma.refreshToken.findUnique({ where: { tokenHash }, include: { session: true } });
  },

  async revoke(id: string, replacedByTokenId?: string) {
    await prisma.refreshToken.update({
      where: { id },
      data: { revokedAt: new Date(), ...(replacedByTokenId ? { replacedByTokenId } : {}) },
    });
  },

  async revokeAllForSession(sessionId: string) {
    await prisma.refreshToken.updateMany({
      where: { sessionId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  },
};
