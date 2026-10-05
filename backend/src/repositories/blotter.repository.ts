import { Prisma } from "@prisma/client";
import { prisma, LONG_TRANSACTION_OPTIONS } from "../config/prisma";
import { generateReferenceNumber } from "../utils/referenceNumber.util";
import { SAFE_USER_SELECT } from "../utils/prismaSelectors.util";

export interface BlotterListFilters {
  search?: string;
  status?: string;
  isArchived?: boolean;
  skip: number;
  take: number;
}

const includeRelations = {
  mediator: { select: SAFE_USER_SELECT },
  hearings: { orderBy: { date: "asc" } },
  history: { orderBy: { timestamp: "asc" } },
} satisfies Prisma.BlotterInclude;

function buildWhere(filters: BlotterListFilters): Prisma.BlotterWhereInput {
  return {
    deletedAt: null,
    status: filters.status as never,
    isArchived: filters.isArchived ?? false,
    ...(filters.search
      ? {
          OR: [
            { caseNumber: { contains: filters.search, mode: "insensitive" } },
            { complainantName: { contains: filters.search, mode: "insensitive" } },
            { respondentName: { contains: filters.search, mode: "insensitive" } },
          ],
        }
      : {}),
  };
}

export const blotterRepository = {
  async list(filters: BlotterListFilters) {
    const where = buildWhere(filters);
    const [items, total] = await Promise.all([
      prisma.blotter.findMany({
        where,
        include: includeRelations,
        orderBy: { createdAt: "desc" },
        skip: filters.skip,
        take: filters.take,
      }),
      prisma.blotter.count({ where }),
    ]);
    return { items, total };
  },

  findById(id: string) {
    return prisma.blotter.findFirst({ where: { id, deletedAt: null }, include: includeRelations });
  },

  count() {
    return prisma.blotter.count({ where: { deletedAt: null } });
  },

  async create(data: Omit<Prisma.BlotterUncheckedCreateInput, "caseNumber">) {
    return prisma.$transaction(async (tx) => {
      const caseNumber = await generateReferenceNumber(tx, "BLT", 4);
      const blotter = await tx.blotter.create({ data: { ...data, caseNumber } });
      await tx.blotterHistoryEvent.create({ data: { blotterId: blotter.id, label: "Case filed" } });
      return tx.blotter.findUniqueOrThrow({ where: { id: blotter.id }, include: includeRelations });
    }, LONG_TRANSACTION_OPTIONS);
  },

  async update(id: string, data: Prisma.BlotterUncheckedUpdateInput, historyEvent?: { label: string; actor?: string }) {
    return prisma.$transaction(async (tx) => {
      await tx.blotter.update({ where: { id }, data });
      if (historyEvent) {
        await tx.blotterHistoryEvent.create({ data: { blotterId: id, ...historyEvent } });
      }
      return tx.blotter.findUniqueOrThrow({ where: { id }, include: includeRelations });
    }, LONG_TRANSACTION_OPTIONS);
  },

  softDelete(id: string) {
    return prisma.blotter.update({ where: { id }, data: { deletedAt: new Date() } });
  },

  addHearing(blotterId: string, date: Date, notes: string | undefined) {
    return prisma.blotterHearing.create({ data: { blotterId, date, notes } });
  },

  updateHearingStatus(hearingId: string, status: string) {
    return prisma.blotterHearing.update({ where: { id: hearingId }, data: { status: status as never } });
  },

  addHistoryEvent(blotterId: string, label: string, actor?: string) {
    return prisma.blotterHistoryEvent.create({ data: { blotterId, label, actor } });
  },
};
