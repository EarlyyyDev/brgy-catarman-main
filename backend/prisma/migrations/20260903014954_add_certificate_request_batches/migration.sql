-- AlterTable
ALTER TABLE "certificate_requests" ADD COLUMN     "batchId" UUID;

-- CreateTable
CREATE TABLE "certificate_request_batches" (
    "id" UUID NOT NULL,
    "referenceNumber" TEXT NOT NULL,
    "requestorName" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "contactNumber" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "residentId" UUID,
    "channel" "RequestChannel" NOT NULL,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "certificate_request_batches_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "certificate_request_batches_referenceNumber_key" ON "certificate_request_batches"("referenceNumber");

-- CreateIndex
CREATE INDEX "certificate_request_batches_referenceNumber_idx" ON "certificate_request_batches"("referenceNumber");

-- AddForeignKey
ALTER TABLE "certificate_request_batches" ADD CONSTRAINT "certificate_request_batches_residentId_fkey" FOREIGN KEY ("residentId") REFERENCES "residents"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "certificate_requests" ADD CONSTRAINT "certificate_requests_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "certificate_request_batches"("id") ON DELETE SET NULL ON UPDATE CASCADE;
