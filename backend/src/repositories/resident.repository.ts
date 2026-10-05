import { Prisma } from "@prisma/client";
import { prisma, LONG_TRANSACTION_OPTIONS } from "../config/prisma";

export interface ResidentListFilters {
  search?: string;
  purokId?: string;
  householdId?: string;
  tagType?: string;
  skip: number;
  take: number;
}

function buildWhere(filters: ResidentListFilters): Prisma.ResidentWhereInput {
  return {
    deletedAt: null,
    purokId: filters.purokId,
    householdId: filters.householdId,
    ...(filters.tagType ? { tags: { some: { tagType: filters.tagType as never, isActive: true } } } : {}),
    ...(filters.search
      ? {
          OR: [
            { firstName: { contains: filters.search, mode: "insensitive" } },
            { lastName: { contains: filters.search, mode: "insensitive" } },
            { contactNumber: { contains: filters.search, mode: "insensitive" } },
          ],
        }
      : {}),
  };
}

const includeRelations = {
  purok: { include: { sitio: true } },
  household: true,
  tags: true,
} satisfies Prisma.ResidentInclude;

export const residentRepository = {
  async list(filters: ResidentListFilters) {
    const where = buildWhere(filters);
    const [items, total] = await Promise.all([
      prisma.resident.findMany({
        where,
        include: includeRelations,
        orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
        skip: filters.skip,
        take: filters.take,
      }),
      prisma.resident.count({ where }),
    ]);
    return { items, total };
  },

  findById(id: string) {
    return prisma.resident.findFirst({ where: { id, deletedAt: null }, include: includeRelations });
  },

  /** Minimal, privacy-conscious lookup for public identity-verification pickers
   * (certificate requests, incident reports) -- exposes only what's needed to
   * disambiguate a name in a list, never contact/photo/birthdate/etc. */
  searchPublic(query: string) {
    return prisma.resident.findMany({
      where: {
        deletedAt: null,
        isActive: true,
        OR: [
          { firstName: { contains: query, mode: "insensitive" } },
          { middleName: { contains: query, mode: "insensitive" } },
          { lastName: { contains: query, mode: "insensitive" } },
        ],
      },
      select: {
        id: true,
        firstName: true,
        middleName: true,
        lastName: true,
        suffix: true,
        purok: { select: { name: true, sitio: { select: { name: true } } } },
      },
      orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
      take: 10,
    });
  },

  create(data: Prisma.ResidentUncheckedCreateInput) {
    return prisma.resident.create({ data, include: includeRelations });
  },

  update(id: string, data: Prisma.ResidentUncheckedUpdateInput) {
    return prisma.resident.update({ where: { id }, data, include: includeRelations });
  },

  softDelete(id: string) {
    return prisma.resident.update({ where: { id }, data: { deletedAt: new Date(), isActive: false } });
  },

  count() {
    return prisma.resident.count({ where: { deletedAt: null } });
  },

  async replaceTags(
    residentId: string,
    tags: { tagType: string; remarks?: string; effectiveDate?: Date; expiryDate?: Date }[],
    createdById: string | null,
  ) {
    return prisma.$transaction(async (tx) => {
      await tx.residentTag.deleteMany({ where: { residentId } });
      if (tags.length > 0) {
        await tx.residentTag.createMany({
          data: tags.map((tag) => ({
            residentId,
            tagType: tag.tagType as never,
            remarks: tag.remarks,
            effectiveDate: tag.effectiveDate,
            expiryDate: tag.expiryDate,
            createdById,
          })),
        });
      }
      return tx.resident.findUniqueOrThrow({ where: { id: residentId }, include: includeRelations });
    }, LONG_TRANSACTION_OPTIONS);
  },
};
