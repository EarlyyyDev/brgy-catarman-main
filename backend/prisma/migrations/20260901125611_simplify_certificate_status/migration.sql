-- Simplify CertificateStatus to 6 values: rename UNDER_REVIEW -> PROCESSING,
-- and drop NOT_CLAIMED / EXPIRED (confirmed zero rows use any of these three
-- values at the time of this migration, so no data remapping is needed).
BEGIN;

ALTER TYPE "CertificateStatus" RENAME VALUE 'UNDER_REVIEW' TO 'PROCESSING';

CREATE TYPE "CertificateStatus_new" AS ENUM ('PENDING', 'PROCESSING', 'APPROVED', 'REJECTED', 'READY_FOR_CLAIM', 'CLAIMED');

ALTER TABLE "certificate_requests" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "certificate_requests" ALTER COLUMN "status" TYPE "CertificateStatus_new" USING ("status"::text::"CertificateStatus_new");
ALTER TABLE "certificate_requests" ALTER COLUMN "status" SET DEFAULT 'PENDING';

DROP TYPE "CertificateStatus";
ALTER TYPE "CertificateStatus_new" RENAME TO "CertificateStatus";

COMMIT;
