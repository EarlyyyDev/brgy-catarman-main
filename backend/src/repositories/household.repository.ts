import { Prisma } from "@prisma/client";
import { prisma, LONG_TRANSACTION_OPTIONS } from "../config/prisma";
import { generateReferenceNumber } from "../utils/referenceNumber.util";

export interface HouseholdListFilters {
  search?: string;
  purokId?: string;
  sitioId?: string;
  isArchived?: boolean;
  skip: number;
  take: number;
}

const includeRelations = {
  sitio: true,
  purok: true,
  headResident: true,
  members: { where: { deletedAt: null } },
} satisfies Prisma.HouseholdInclude;

function buildWhere(filters: HouseholdListFilters): Prisma.HouseholdWhereInput {
  return {
    deletedAt: null,
    purokId: filters.purokId,
    sitioId: filters.sitioId,
    isArchived: filters.isArchived ?? false,
    ...(filters.search ? { householdNumber: { contains: filters.search, mode: "insensitive" } } : {}),
  };
}

export const householdRepository = {
  async list(filters: HouseholdListFilters) {
    const where = buildWhere(filters);
    const [items, total] = await Promise.all([
      prisma.household.findMany({
        where,
        include: includeRelations,
        orderBy: { householdNumber: "asc" },
        skip: filters.skip,
        take: filters.take,
      }),
      prisma.household.count({ where }),
    ]);
    return { items, total };
  },

  findById(id: string) {
    return prisma.household.findFirst({ where: { id, deletedAt: null }, include: includeRelations });
  },

  count() {
    return prisma.household.count({ where: { deletedAt: null } });
  },

  /**
   * Creates the household and syncs member residents' householdId /
   * isHouseholdHead / relationshipToHead inside a single transaction, so a
   * partial failure never leaves a resident pointing at a nonexistent
   * household or a household with a dangling head reference (the frontend
   * prototype's Zustand stores call across two separate stores for this
   * with no such guarantee).
   */
  async createWithMembers(params: {
    sitioId: string;
    purokId: string;
    street: string;
    houseNumber: string;
    contactNumber: string;
    classification: string;
    is4PsBeneficiary: boolean;
    headResidentId: string;
    memberIds: string[];
    memberRelationships: Record<string, string>;
    createdById: string | null;
  }) {
    return prisma.$transaction(async (tx) => {
      const householdNumber = await generateReferenceNumber(tx, "HH", 5);

      const household = await tx.household.create({
        data: {
          householdNumber,
          sitioId: params.sitioId,
          purokId: params.purokId,
          street: params.street,
          houseNumber: params.houseNumber,
          contactNumber: params.contactNumber,
          classification: params.classification as never,
          is4PsBeneficiary: params.is4PsBeneficiary,
          createdById: params.createdById,
        },
      });

      for (const residentId of params.memberIds) {
        const isHead = residentId === params.headResidentId;
        await tx.resident.update({
          where: { id: residentId },
          data: {
            householdId: household.id,
            isHouseholdHead: isHead,
            relationshipToHead: isHead ? "Head" : params.memberRelationships[residentId],
          },
        });
      }

      await tx.household.update({ where: { id: household.id }, data: { headResidentId: params.headResidentId } });

      return tx.household.findUniqueOrThrow({ where: { id: household.id }, include: includeRelations });
    }, LONG_TRANSACTION_OPTIONS);
  },

  async updateWithMembers(
    id: string,
    params: {
      sitioId?: string;
      purokId?: string;
      street?: string;
      houseNumber?: string;
      contactNumber?: string;
      classification?: string;
      is4PsBeneficiary?: boolean;
      headResidentId?: string;
      memberIds?: string[];
      memberRelationships?: Record<string, string>;
    },
  ) {
    return prisma.$transaction(async (tx) => {
      if (params.memberIds) {
        const currentMembers = await tx.resident.findMany({ where: { householdId: id }, select: { id: true } });
        const currentIds = new Set(currentMembers.map((m) => m.id));
        const nextIds = new Set(params.memberIds);

        const removedIds = [...currentIds].filter((residentId) => !nextIds.has(residentId));
        if (removedIds.length > 0) {
          await tx.resident.updateMany({
            where: { id: { in: removedIds } },
            data: { householdId: null, isHouseholdHead: false, relationshipToHead: null },
          });
        }

        for (const residentId of params.memberIds) {
          const isHead = residentId === params.headResidentId;
          await tx.resident.update({
            where: { id: residentId },
            data: {
              householdId: id,
              isHouseholdHead: isHead,
              relationshipToHead: isHead ? "Head" : params.memberRelationships?.[residentId],
            },
          });
        }
      }

      await tx.household.update({
        where: { id },
        data: {
          sitioId: params.sitioId,
          purokId: params.purokId,
          street: params.street,
          houseNumber: params.houseNumber,
          contactNumber: params.contactNumber,
          classification: params.classification as never,
          is4PsBeneficiary: params.is4PsBeneficiary,
          headResidentId: params.headResidentId,
        },
      });

      return tx.household.findUniqueOrThrow({ where: { id }, include: includeRelations });
    }, LONG_TRANSACTION_OPTIONS);
  },

  setArchived(id: string, isArchived: boolean) {
    return prisma.household.update({ where: { id }, data: { isArchived } });
  },

  async softDeleteWithUnlink(id: string) {
    return prisma.$transaction(async (tx) => {
      await tx.resident.updateMany({
        where: { householdId: id },
        data: { householdId: null, isHouseholdHead: false, relationshipToHead: null },
      });
      await tx.household.update({ where: { id }, data: { deletedAt: new Date() } });
    }, LONG_TRANSACTION_OPTIONS);
  },
};
