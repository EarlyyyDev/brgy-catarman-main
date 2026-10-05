import { prisma } from "../config/prisma";

export const userRepository = {
  findByEmail(email: string) {
    return prisma.user.findFirst({ where: { email, deletedAt: null } });
  },

  findById(id: string) {
    return prisma.user.findFirst({ where: { id, deletedAt: null } });
  },

  list(params: {
    role?: "STAFF" | "ADMINISTRATOR";
    status?: "ACTIVE" | "DISABLED";
    search?: string;
    skip?: number;
    take?: number;
  }) {
    const where = {
      deletedAt: null,
      role: params.role,
      status: params.status,
      ...(params.search
        ? {
            OR: [
              { name: { contains: params.search, mode: "insensitive" as const } },
              { email: { contains: params.search, mode: "insensitive" as const } },
              { position: { contains: params.search, mode: "insensitive" as const } },
            ],
          }
        : {}),
    };
    return prisma.user.findMany({ where, orderBy: { name: "asc" }, skip: params.skip, take: params.take });
  },

  count(params: { role?: "STAFF" | "ADMINISTRATOR"; status?: "ACTIVE" | "DISABLED"; search?: string }) {
    const where = {
      deletedAt: null,
      role: params.role,
      status: params.status,
      ...(params.search
        ? {
            OR: [
              { name: { contains: params.search, mode: "insensitive" as const } },
              { email: { contains: params.search, mode: "insensitive" as const } },
              { position: { contains: params.search, mode: "insensitive" as const } },
            ],
          }
        : {}),
    };
    return prisma.user.count({ where });
  },

  create(data: {
    name: string;
    email: string;
    passwordHash: string;
    role: "STAFF" | "ADMINISTRATOR";
    position: string;
    contactNumber?: string;
    mustChangePassword?: boolean;
  }) {
    return prisma.user.create({ data });
  },

  update(
    id: string,
    data: Partial<{
      name: string;
      email: string;
      role: "STAFF" | "ADMINISTRATOR";
      position: string;
      contactNumber: string;
      status: "ACTIVE" | "DISABLED";
      avatarUrl: string;
    }>,
  ) {
    return prisma.user.update({ where: { id }, data });
  },

  softDelete(id: string) {
    return prisma.user.update({ where: { id }, data: { deletedAt: new Date(), status: "DISABLED" } });
  },

  updateLastLogin(id: string) {
    return prisma.user.update({ where: { id }, data: { lastLoginAt: new Date() } });
  },

  updatePassword(id: string, passwordHash: string) {
    return prisma.user.update({
      where: { id },
      data: { passwordHash, mustChangePassword: false },
    });
  },

  setPasswordByAdmin(id: string, passwordHash: string) {
    return prisma.user.update({
      where: { id },
      data: { passwordHash, mustChangePassword: true },
    });
  },

  setSecurityQuestions(
    id: string,
    data: { securityQuestion1: string; securityAnswer1Hash: string; securityQuestion2: string; securityAnswer2Hash: string },
  ) {
    return prisma.user.update({ where: { id }, data });
  },
};
