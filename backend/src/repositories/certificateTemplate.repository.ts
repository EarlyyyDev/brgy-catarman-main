import { Prisma } from "@prisma/client";
import { prisma } from "../config/prisma";

const includeRelations = { documentType: true } satisfies Prisma.CertificateTemplateInclude;

export const certificateTemplateRepository = {
  list(documentTypeId?: string) {
    return prisma.certificateTemplate.findMany({
      where: { deletedAt: null, documentTypeId },
      include: includeRelations,
      orderBy: { name: "asc" },
    });
  },

  findById(id: string) {
    return prisma.certificateTemplate.findFirst({
      where: { id, deletedAt: null },
      include: includeRelations,
    });
  },

  create(data: Prisma.CertificateTemplateUncheckedCreateInput) {
    return prisma.certificateTemplate.create({ data, include: includeRelations });
  },

  update(id: string, data: Prisma.CertificateTemplateUncheckedUpdateInput) {
    return prisma.certificateTemplate.update({ where: { id }, data, include: includeRelations });
  },

  softDelete(id: string) {
    return prisma.certificateTemplate.update({ where: { id }, data: { deletedAt: new Date() } });
  },
};
