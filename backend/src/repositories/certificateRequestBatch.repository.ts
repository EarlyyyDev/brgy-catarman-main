import { Prisma } from "@prisma/client";
import { prisma, LONG_TRANSACTION_OPTIONS } from "../config/prisma";
import { generateReferenceNumber } from "../utils/referenceNumber.util";
import { SAFE_USER_SELECT } from "../utils/prismaSelectors.util";

const requestIncludeRelations = {
  documentType: true,
  resident: true,
  processedBy: { select: SAFE_USER_SELECT },
  requirements: true,
  timeline: { orderBy: { timestamp: "asc" } },
} satisfies Prisma.CertificateRequestInclude;

const includeRelations = {
  requests: { include: requestIncludeRelations, orderBy: { createdAt: "asc" } },
} satisfies Prisma.CertificateRequestBatchInclude;

export interface BatchDocumentItem {
  documentTypeId: string;
  otherDocumentLabel?: string;
  purpose: string;
}

export const certificateRequestBatchRepository = {
  findByReferenceNumber(referenceNumber: string) {
    return prisma.certificateRequestBatch.findFirst({
      where: { referenceNumber, deletedAt: null },
      include: includeRelations,
    });
  },

  findById(id: string) {
    return prisma.certificateRequestBatch.findFirst({
      where: { id, deletedAt: null },
      include: includeRelations,
    });
  },

  /** Creates one batch plus one CertificateRequest per requested document
   * type, all inside a single transaction -- the batch gets one
   * resident-facing reference number, and each child request also gets its
   * own (for staff-side identification, control numbers, and printing),
   * same as before this feature existed. */
  async create(
    shared: {
      requestorName: string;
      address: string;
      contactNumber: string;
      email: string;
      residentId?: string;
      channel: "ONLINE" | "WALK_IN";
    },
    documents: BatchDocumentItem[],
  ) {
    return prisma.$transaction(async (tx) => {
      const batchReferenceNumber = await generateReferenceNumber(tx, "BC", 5);
      const batch = await tx.certificateRequestBatch.create({
        data: { ...shared, referenceNumber: batchReferenceNumber },
      });

      for (const doc of documents) {
        const requestReferenceNumber = await generateReferenceNumber(tx, "BC", 5);
        const request = await tx.certificateRequest.create({
          data: {
            ...shared,
            ...doc,
            referenceNumber: requestReferenceNumber,
            batchId: batch.id,
            status: "PENDING",
          },
        });
        await tx.certificateTimelineEvent.create({
          data: { certificateRequestId: request.id, label: "Request submitted online" },
        });
      }

      return tx.certificateRequestBatch.findUniqueOrThrow({ where: { id: batch.id }, include: includeRelations });
    }, LONG_TRANSACTION_OPTIONS);
  },
};
