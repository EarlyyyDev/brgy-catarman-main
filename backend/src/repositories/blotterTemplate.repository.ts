import { Prisma } from "@prisma/client";
import { prisma } from "../config/prisma";

export const blotterTemplateRepository = {
  list() {
    return prisma.blotterTemplate.findMany({ where: { deletedAt: null }, orderBy: { name: "asc" } });
  },

  findById(id: string) {
    return prisma.blotterTemplate.findFirst({ where: { id, deletedAt: null } });
  },

  create(data: Prisma.BlotterTemplateUncheckedCreateInput) {
    return prisma.blotterTemplate.create({ data });
  },

  update(id: string, data: Prisma.BlotterTemplateUncheckedUpdateInput) {
    return prisma.blotterTemplate.update({ where: { id }, data });
  },

  softDelete(id: string) {
    return prisma.blotterTemplate.update({ where: { id }, data: { deletedAt: new Date() } });
  },
};
