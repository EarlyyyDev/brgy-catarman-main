import { Prisma } from "@prisma/client";
import { prisma } from "../config/prisma";

export const officialRepository = {
  list() {
    return prisma.official.findMany({ where: { deletedAt: null }, orderBy: { order: "asc" } });
  },

  findById(id: string) {
    return prisma.official.findFirst({ where: { id, deletedAt: null } });
  },

  create(data: Prisma.OfficialUncheckedCreateInput) {
    return prisma.official.create({ data });
  },

  update(id: string, data: Prisma.OfficialUncheckedUpdateInput) {
    return prisma.official.update({ where: { id }, data });
  },

  softDelete(id: string) {
    return prisma.official.update({ where: { id }, data: { deletedAt: new Date() } });
  },
};
