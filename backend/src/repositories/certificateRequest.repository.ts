import { Prisma } from "@prisma/client";
import { prisma, LONG_TRANSACTION_OPTIONS } from "../config/prisma";
import { generateReferenceNumber } from "../utils/referenceNumber.util";
import { SAFE_USER_SELECT } from "../utils/prismaSelectors.util";

export interface CertificateRequestListFilters {
  search?: string;
  status?: string;
  documentTypeId?: string;
  channel?: string;
  skip: number;
  take: number;
}

const includeRelations = {
  documentType: true,
  resident: true,
  processedBy: { select: SAFE_USER_SELECT },
  requirements: true,
  timeline: { orderBy: { timestamp: "asc" } },
  batch: { select: { referenceNumber: true } },
} satisfies Prisma.CertificateRequestInclude;

function buildWhere(filters: CertificateRequestListFilters): Prisma.CertificateRequestWhereInput {
  return {
    deletedAt: null,
    status: filters.status as never,
    documentTypeId: filters.documentTypeId,
    channel: filters.channel as never,
    ...(filters.search
      ? {
          OR: [
            { referenceNumber: { contains: filters.search, mode: "insensitive" } },
            { requestorName: { contains: filters.search, mode: "insensitive" } },
          ],
        }
      : {}),
  };
}

export const certificateRequestRepository = {
  async list(filters: CertificateRequestListFilters) {
    const where = buildWhere(filters);
    const [items, total] = await Promise.all([
      prisma.certificateRequest.findMany({
        where,
        include: includeRelations,
        orderBy: { submittedAt: "desc" },
        skip: filters.skip,
        take: filters.take,
      }),
      prisma.certificateRequest.count({ where }),
    ]);
    return { items, total };
  },

  findById(id: string) {
    return prisma.certificateRequest.findFirst({ where: { id, deletedAt: null }, include: includeRelations });
  },

  findByReferenceNumber(referenceNumber: string) {
    return prisma.certificateRequest.findFirst({
      where: { referenceNumber, deletedAt: null },
      include: includeRelations,
    });
  },

  /** Finds an already-in-progress request from the same resident for the
   * same document type, so a new submission can be blocked as a duplicate.
   * REJECTED/CLAIMED don't count -- those are resolved, so a fresh request
   * for the same document is legitimate (e.g. renewal). */
  findActiveDuplicate(residentId: string, documentTypeId: string) {
    return prisma.certificateRequest.findFirst({
      where: {
        deletedAt: null,
        residentId,
        documentTypeId,
        status: { in: ["PENDING", "PROCESSING", "APPROVED", "READY_FOR_CLAIM"] },
      },
      orderBy: { submittedAt: "desc" },
    });
  },

  count() {
    return prisma.certificateRequest.count({ where: { deletedAt: null } });
  },

  countByStatus(status: string) {
    return prisma.certificateRequest.count({ where: { deletedAt: null, status: status as never } });
  },

  async create(
    data: Omit<Prisma.CertificateRequestUncheckedCreateInput, "referenceNumber">,
    initialTimelineLabel: string,
  ) {
    return prisma.$transaction(async (tx) => {
      const referenceNumber = await generateReferenceNumber(tx, "BC", 5);
      const request = await tx.certificateRequest.create({
        data: { ...data, referenceNumber },
      });
      await tx.certificateTimelineEvent.create({
        data: { certificateRequestId: request.id, label: initialTimelineLabel },
      });
      return tx.certificateRequest.findUniqueOrThrow({ where: { id: request.id }, include: includeRelations });
    }, LONG_TRANSACTION_OPTIONS);
  },

  async updateStatus(
    id: string,
    data: Prisma.CertificateRequestUncheckedUpdateInput,
    timelineEvent: { label: string; description?: string; actor?: string },
    generateControlNumber: boolean,
  ) {
    return prisma.$transaction(async (tx) => {
      if (generateControlNumber) {
        data.controlNumber = await generateReferenceNumber(tx, "CTC", 5);
      }
      await tx.certificateRequest.update({ where: { id }, data });
      await tx.certificateTimelineEvent.create({
        data: { certificateRequestId: id, ...timelineEvent },
      });
      return tx.certificateRequest.findUniqueOrThrow({ where: { id }, include: includeRelations });
    }, LONG_TRANSACTION_OPTIONS);
  },

  addRequirement(certificateRequestId: string, data: { name: string; url: string; sizeKb: number; mimeType: string }) {
    return prisma.certificateRequirement.create({ data: { certificateRequestId, ...data } });
  },

  softDelete(id: string) {
    return prisma.certificateRequest.update({ where: { id }, data: { deletedAt: new Date() } });
  },
};
