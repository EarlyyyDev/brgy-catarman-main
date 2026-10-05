import { Prisma } from "@prisma/client";
import { prisma } from "../config/prisma";

export const emergencyContactRepository = {
  list() {
    return prisma.emergencyContact.findMany({ where: {}, orderBy: { name: "asc" } });
  },

  findById(id: string) {
    return prisma.emergencyContact.findUnique({ where: { id } });
  },

  create(data: Prisma.EmergencyContactUncheckedCreateInput) {
    return prisma.emergencyContact.create({ data });
  },

  update(id: string, data: Prisma.EmergencyContactUncheckedUpdateInput) {
    return prisma.emergencyContact.update({ where: { id }, data });
  },

  remove(id: string) {
    return prisma.emergencyContact.delete({ where: { id } });
  },
};
