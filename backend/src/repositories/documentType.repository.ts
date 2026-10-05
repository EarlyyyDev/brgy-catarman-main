import { Prisma } from "@prisma/client";
import { prisma } from "../config/prisma";

export const documentTypeRepository = {
  list(activeOnly = false) {
    return prisma.documentType.findMany({
      where: { deletedAt: null, ...(activeOnly ? { isActive: true } : {}) },
      orderBy: { name: "asc" },
    });
  },

  findById(id: string) {
    return prisma.documentType.findFirst({ where: { id, deletedAt: null } });
  },

  create(data: Prisma.DocumentTypeUncheckedCreateInput) {
    return prisma.documentType.create({ data });
  },

  update(id: string, data: Prisma.DocumentTypeUncheckedUpdateInput) {
    return prisma.documentType.update({ where: { id }, data });
  },

  softDelete(id: string) {
    return prisma.documentType.update({ where: { id }, data: { deletedAt: new Date(), isActive: false } });
  },
};
