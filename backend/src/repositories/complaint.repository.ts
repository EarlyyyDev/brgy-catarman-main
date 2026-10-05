import { Prisma } from "@prisma/client";
import { prisma, LONG_TRANSACTION_OPTIONS } from "../config/prisma";
import { generateReferenceNumber } from "../utils/referenceNumber.util";

export interface ComplaintListFilters {
  search?: string;
  status?: string;
  category?: string;
  skip: number;
  take: number;
}

const includeRelations = {
  timeline: { orderBy: { timestamp: "asc" } },
  photos: true,
} satisfies Prisma.ComplaintInclude;

function buildWhere(filters: ComplaintListFilters): Prisma.ComplaintWhereInput {
  return {
    deletedAt: null,
    status: filters.status as never,
    category: filters.category as never,
    ...(filters.search
      ? {
          OR: [
            { referenceNumber: { contains: filters.search, mode: "insensitive" } },
            { reporterName: { contains: filters.search, mode: "insensitive" } },
          ],
        }
      : {}),
  };
}

export const complaintRepository = {
  async list(filters: ComplaintListFilters) {
    const where = buildWhere(filters);
    const [items, total] = await Promise.all([
      prisma.complaint.findMany({
        where,
        include: includeRelations,
        orderBy: { submittedAt: "desc" },
        skip: filters.skip,
        take: filters.take,
      }),
      prisma.complaint.count({ where }),
    ]);
    return { items, total };
  },

  findById(id: string) {
    return prisma.complaint.findFirst({ where: { id, deletedAt: null }, include: includeRelations });
  },

  findByReferenceNumber(referenceNumber: string) {
    return prisma.complaint.findFirst({ where: { referenceNumber, deletedAt: null }, include: includeRelations });
  },

  count() {
    return prisma.complaint.count({ where: { deletedAt: null } });
  },

  async create(data: Omit<Prisma.ComplaintUncheckedCreateInput, "referenceNumber">) {
    return prisma.$transaction(async (tx) => {
      const referenceNumber = await generateReferenceNumber(tx, "INC", 5);
      const complaint = await tx.complaint.create({ data: { ...data, referenceNumber } });
      await tx.complaintTimelineEvent.create({
        data: { complaintId: complaint.id, label: "Report submitted" },
      });
      return tx.complaint.findUniqueOrThrow({ where: { id: complaint.id }, include: includeRelations });
    }, LONG_TRANSACTION_OPTIONS);
  },

  async updateStatus(
    id: string,
    data: Prisma.ComplaintUncheckedUpdateInput,
    timelineEvent: { label: string; description?: string; actor?: string },
  ) {
    return prisma.$transaction(async (tx) => {
      await tx.complaint.update({ where: { id }, data });
      await tx.complaintTimelineEvent.create({ data: { complaintId: id, ...timelineEvent } });
      return tx.complaint.findUniqueOrThrow({ where: { id }, include: includeRelations });
    }, LONG_TRANSACTION_OPTIONS);
  },

  addPhoto(
    complaintId: string,
    data: {
      type: string;
      source: string;
      photoUrl: string;
      latitude?: number;
      longitude?: number;
      deviceInfo?: string;
      ipAddress?: string;
    },
  ) {
    return prisma.incidentPhoto.create({
      data: { complaintId, ...data, type: data.type as never, source: data.source as never },
    });
  },

  setReporterPhoto(complaintId: string, photoUrl: string) {
    return prisma.complaint.update({ where: { id: complaintId }, data: { reporterPhotoUrl: photoUrl } });
  },
};
