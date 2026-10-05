-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('STAFF', 'ADMINISTRATOR');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'DISABLED');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE');

-- CreateEnum
CREATE TYPE "CivilStatus" AS ENUM ('SINGLE', 'MARRIED', 'WIDOWED', 'SEPARATED', 'DIVORCED');

-- CreateEnum
CREATE TYPE "ResidentTagType" AS ENUM ('SENIOR_CITIZEN', 'PWD', 'SOLO_PARENT', 'WOMAN', 'FISHERFOLK', 'FOUR_PS_BENEFICIARY', 'INDIGENT', 'INDIGENOUS', 'YOUTH', 'PREGNANT', 'STUDENT', 'OFW', 'VETERAN');

-- CreateEnum
CREATE TYPE "HouseholdClassification" AS ENUM ('NHTS_POOR', 'LOW_INCOME', 'MIDDLE_INCOME', 'NOT_CLASSIFIED');

-- CreateEnum
CREATE TYPE "IncidentPhotoType" AS ENUM ('REPORTER_CAPTURE', 'EVIDENCE');

-- CreateEnum
CREATE TYPE "PhotoSource" AS ENUM ('LIVE_CAMERA', 'FILE_UPLOAD');

-- CreateEnum
CREATE TYPE "CertificateStatus" AS ENUM ('PENDING', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'READY_FOR_CLAIM', 'CLAIMED', 'NOT_CLAIMED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "RequestChannel" AS ENUM ('ONLINE', 'WALK_IN');

-- CreateEnum
CREATE TYPE "TemplateStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "IncidentCategory" AS ENUM ('LOITERING', 'NOISE_COMPLAINT', 'ILLEGAL_PARKING', 'PUBLIC_DISTURBANCE', 'ILLEGAL_DUMPING', 'VANDALISM', 'OTHER');

-- CreateEnum
CREATE TYPE "ComplaintStatus" AS ENUM ('NEW', 'UNDER_REVIEW', 'VALIDATED', 'RESOLVED', 'ARCHIVED', 'DISMISSED');

-- CreateEnum
CREATE TYPE "BlotterStatus" AS ENUM ('OPEN', 'UNDER_MEDIATION', 'SETTLED', 'ESCALATED_TO_COURT', 'CLOSED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "HearingStatus" AS ENUM ('SCHEDULED', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "AnnouncementCategory" AS ENUM ('GENERAL', 'HEALTH', 'SAFETY', 'EVENT', 'ADVISORY', 'JOB_OPENING');

-- CreateEnum
CREATE TYPE "AnnouncementStatus" AS ENUM ('DRAFT', 'SCHEDULED', 'PUBLISHED');

-- CreateEnum
CREATE TYPE "ReactionTargetType" AS ENUM ('POST', 'COMMENT');

-- CreateEnum
CREATE TYPE "ReactionKey" AS ENUM ('LIKE', 'LOVE', 'CARE', 'HAHA', 'WOW', 'SAD', 'ANGRY');

-- CreateEnum
CREATE TYPE "EmergencyContactCategory" AS ENUM ('POLICE', 'FIRE', 'MEDICAL', 'DISASTER_RESPONSE', 'BARANGAY_HOTLINE', 'OTHER');

-- CreateEnum
CREATE TYPE "BackupType" AS ENUM ('MANUAL', 'AUTOMATIC');

-- CreateEnum
CREATE TYPE "BackupStatus" AS ENUM ('COMPLETED', 'FAILED', 'IN_PROGRESS');

-- CreateEnum
CREATE TYPE "ActivityModule" AS ENUM ('AUTHENTICATION', 'RESIDENTS', 'HOUSEHOLDS', 'CERTIFICATES', 'COMPLAINTS', 'BLOTTERS', 'ANNOUNCEMENTS', 'SETTINGS', 'BACKUP', 'STAFF');

-- CreateEnum
CREATE TYPE "ActivityActorRole" AS ENUM ('STAFF', 'ADMINISTRATOR', 'SYSTEM');

-- CreateEnum
CREATE TYPE "ActivityStatus" AS ENUM ('SUCCESS', 'FAILED');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('INFO', 'SUCCESS', 'WARNING', 'ERROR');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "position" TEXT NOT NULL,
    "avatarUrl" TEXT,
    "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "contactNumber" TEXT,
    "lastLoginAt" TIMESTAMP(3),
    "mustChangePassword" BOOLEAN NOT NULL DEFAULT false,
    "resetPasswordTokenHash" TEXT,
    "resetPasswordExpiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "userAgent" TEXT,
    "ipAddress" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastUsedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "revokedAt" TIMESTAMP(3),

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refresh_tokens" (
    "id" UUID NOT NULL,
    "sessionId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "revokedAt" TIMESTAMP(3),
    "replacedByTokenId" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sitios" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sitios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "puroks" (
    "id" UUID NOT NULL,
    "sitioId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "puroks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "residents" (
    "id" UUID NOT NULL,
    "photoUrl" TEXT,
    "firstName" TEXT NOT NULL,
    "middleName" TEXT,
    "lastName" TEXT NOT NULL,
    "suffix" TEXT,
    "gender" "Gender" NOT NULL,
    "birthdate" DATE NOT NULL,
    "civilStatus" "CivilStatus" NOT NULL,
    "religion" TEXT,
    "occupation" TEXT,
    "educationalAttainment" TEXT,
    "purokId" UUID NOT NULL,
    "street" TEXT NOT NULL,
    "houseNumber" TEXT NOT NULL,
    "contactNumber" TEXT NOT NULL,
    "email" TEXT,
    "householdId" UUID,
    "relationshipToHead" TEXT,
    "emergencyContactName" TEXT,
    "emergencyContactNumber" TEXT,
    "isRegisteredVoter" BOOLEAN NOT NULL DEFAULT false,
    "isHouseholdHead" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdById" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "residents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "resident_tags" (
    "id" UUID NOT NULL,
    "residentId" UUID NOT NULL,
    "tagType" "ResidentTagType" NOT NULL,
    "remarks" TEXT,
    "effectiveDate" DATE,
    "expiryDate" DATE,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdById" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "resident_tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "households" (
    "id" UUID NOT NULL,
    "householdNumber" TEXT NOT NULL,
    "sitioId" UUID NOT NULL,
    "purokId" UUID NOT NULL,
    "street" TEXT NOT NULL,
    "houseNumber" TEXT NOT NULL,
    "headResidentId" UUID,
    "contactNumber" TEXT NOT NULL,
    "classification" "HouseholdClassification" NOT NULL DEFAULT 'NOT_CLASSIFIED',
    "is4PsBeneficiary" BOOLEAN NOT NULL DEFAULT false,
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "createdById" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "households_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "document_types" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT,
    "requirements" TEXT[],
    "fee" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "validityDays" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "document_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "certificate_templates" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "documentTypeId" UUID NOT NULL,
    "status" "TemplateStatus" NOT NULL DEFAULT 'ACTIVE',
    "requireResidentPhoto" BOOLEAN NOT NULL DEFAULT false,
    "showBarangayLogo" BOOLEAN NOT NULL DEFAULT true,
    "showMunicipalLogo" BOOLEAN NOT NULL DEFAULT false,
    "showBarangayDrySeal" BOOLEAN NOT NULL DEFAULT false,
    "logoSize" INTEGER NOT NULL DEFAULT 80,
    "bodyHtml" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "certificate_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "certificate_requests" (
    "id" UUID NOT NULL,
    "referenceNumber" TEXT NOT NULL,
    "controlNumber" TEXT,
    "documentTypeId" UUID NOT NULL,
    "otherDocumentLabel" TEXT,
    "requestorName" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "contactNumber" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "purpose" TEXT NOT NULL,
    "residentId" UUID,
    "residentPhotoUrl" TEXT,
    "channel" "RequestChannel" NOT NULL,
    "status" "CertificateStatus" NOT NULL DEFAULT 'PENDING',
    "staffNotes" TEXT,
    "rejectionReason" TEXT,
    "processedById" UUID,
    "authorizationLetterUrl" TEXT,
    "representativeIdUrl" TEXT,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedAt" TIMESTAMP(3),
    "approvedAt" TIMESTAMP(3),
    "claimDeadline" TIMESTAMP(3),
    "claimedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "certificate_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "certificate_requirements" (
    "id" UUID NOT NULL,
    "certificateRequestId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "sizeKb" INTEGER NOT NULL,
    "mimeType" TEXT NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "certificate_requirements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "certificate_timeline_events" (
    "id" UUID NOT NULL,
    "certificateRequestId" UUID NOT NULL,
    "label" TEXT NOT NULL,
    "description" TEXT,
    "actor" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "certificate_timeline_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "complaints" (
    "id" UUID NOT NULL,
    "referenceNumber" TEXT NOT NULL,
    "category" "IncidentCategory" NOT NULL,
    "otherCategoryLabel" TEXT,
    "reporterName" TEXT NOT NULL,
    "reporterPhone" TEXT NOT NULL,
    "reporterEmail" TEXT NOT NULL,
    "reportedPerson" TEXT,
    "location" TEXT NOT NULL,
    "latitude" DECIMAL(10,7),
    "longitude" DECIMAL(10,7),
    "incidentDate" DATE NOT NULL,
    "incidentTime" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "reporterPhotoUrl" TEXT,
    "status" "ComplaintStatus" NOT NULL DEFAULT 'NEW',
    "staffNotes" TEXT,
    "isConfidential" BOOLEAN NOT NULL DEFAULT true,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "complaints_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "complaint_timeline_events" (
    "id" UUID NOT NULL,
    "complaintId" UUID NOT NULL,
    "label" TEXT NOT NULL,
    "description" TEXT,
    "actor" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "complaint_timeline_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "incident_photos" (
    "id" UUID NOT NULL,
    "complaintId" UUID NOT NULL,
    "type" "IncidentPhotoType" NOT NULL,
    "source" "PhotoSource" NOT NULL,
    "photoUrl" TEXT NOT NULL,
    "latitude" DECIMAL(10,7),
    "longitude" DECIMAL(10,7),
    "deviceInfo" TEXT,
    "ipAddress" TEXT,
    "capturedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "incident_photos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "blotter_templates" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "status" "TemplateStatus" NOT NULL DEFAULT 'ACTIVE',
    "showBarangayLogo" BOOLEAN NOT NULL DEFAULT true,
    "showMunicipalLogo" BOOLEAN NOT NULL DEFAULT false,
    "showBarangayDrySeal" BOOLEAN NOT NULL DEFAULT false,
    "logoSize" INTEGER NOT NULL DEFAULT 80,
    "bodyHtml" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "blotter_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "blotters" (
    "id" UUID NOT NULL,
    "caseNumber" TEXT NOT NULL,
    "incidentType" TEXT NOT NULL,
    "complainantName" TEXT NOT NULL,
    "complainantAddress" TEXT NOT NULL,
    "complainantContact" TEXT NOT NULL,
    "respondentName" TEXT NOT NULL,
    "respondentAddress" TEXT NOT NULL,
    "incidentDate" DATE NOT NULL,
    "location" TEXT NOT NULL,
    "narrative" TEXT NOT NULL,
    "status" "BlotterStatus" NOT NULL DEFAULT 'OPEN',
    "mediatorId" UUID,
    "resolution" TEXT,
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "blotters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "blotter_hearings" (
    "id" UUID NOT NULL,
    "blotterId" UUID NOT NULL,
    "date" DATE NOT NULL,
    "notes" TEXT,
    "status" "HearingStatus" NOT NULL DEFAULT 'SCHEDULED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "blotter_hearings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "blotter_history_events" (
    "id" UUID NOT NULL,
    "blotterId" UUID NOT NULL,
    "label" TEXT NOT NULL,
    "description" TEXT,
    "actor" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "blotter_history_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "announcements" (
    "id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "excerpt" TEXT NOT NULL,
    "imageUrl" TEXT,
    "category" "AnnouncementCategory" NOT NULL DEFAULT 'GENERAL',
    "isPinned" BOOLEAN NOT NULL DEFAULT false,
    "status" "AnnouncementStatus" NOT NULL DEFAULT 'DRAFT',
    "publishAt" TIMESTAMP(3) NOT NULL,
    "authorId" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "announcements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "announcement_attachments" (
    "id" UUID NOT NULL,
    "announcementId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "sizeKb" INTEGER NOT NULL,
    "isMedia" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "announcement_attachments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "comments" (
    "id" UUID NOT NULL,
    "announcementId" UUID NOT NULL,
    "text" TEXT NOT NULL,
    "authorId" UUID,
    "authorName" TEXT NOT NULL,
    "authorRole" "UserRole",
    "viewerKey" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "comment_replies" (
    "id" UUID NOT NULL,
    "commentId" UUID NOT NULL,
    "text" TEXT NOT NULL,
    "authorId" UUID,
    "authorName" TEXT NOT NULL,
    "authorRole" "UserRole",
    "viewerKey" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "comment_replies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reactions" (
    "id" UUID NOT NULL,
    "targetType" "ReactionTargetType" NOT NULL,
    "targetId" UUID NOT NULL,
    "viewerKey" TEXT,
    "userId" UUID,
    "reaction" "ReactionKey" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "officials" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "position" TEXT NOT NULL,
    "committee" TEXT,
    "photoUrl" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "termStart" DATE NOT NULL,
    "termEnd" DATE NOT NULL,
    "contactNumber" TEXT,
    "email" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "officials_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "emergency_contacts" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "category" "EmergencyContactCategory" NOT NULL,
    "contactNumber" TEXT NOT NULL,
    "address" TEXT,
    "availability" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "emergency_contacts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "activities" (
    "id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "startDate" DATE NOT NULL,
    "endDate" DATE NOT NULL,
    "imageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "activities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "system_settings" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "barangayName" TEXT NOT NULL DEFAULT 'Barangay Catarman',
    "municipality" TEXT,
    "province" TEXT,
    "zipCode" TEXT,
    "fullAddress" TEXT,
    "logoUrl" TEXT,
    "sealUrl" TEXT,
    "municipalLogoUrl" TEXT,
    "documentLogoUrl" TEXT,
    "heroBackgroundUrl" TEXT,
    "loginBackgroundUrl" TEXT,
    "contactNumbers" TEXT[],
    "emailAddress" TEXT,
    "officeHours" TEXT,
    "facebookUrl" TEXT,
    "missionStatement" TEXT,
    "visionStatement" TEXT,
    "historyText" TEXT,
    "goals" TEXT[],
    "objectives" TEXT[],
    "founded" TEXT,
    "landArea" TEXT,
    "population" TEXT,
    "smtpHost" TEXT,
    "smtpPort" TEXT,
    "smtpUsername" TEXT,
    "smtpSenderName" TEXT,
    "themePrimaryColor" TEXT,
    "themeAccentColor" TEXT,
    "claimDeadlineDays" INTEGER NOT NULL DEFAULT 30,
    "autoExpireHours" INTEGER NOT NULL DEFAULT 72,
    "updatedById" UUID,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "system_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "backup_records" (
    "id" UUID NOT NULL,
    "fileName" TEXT NOT NULL,
    "sizeMb" DECIMAL(10,2) NOT NULL,
    "type" "BackupType" NOT NULL,
    "status" "BackupStatus" NOT NULL DEFAULT 'IN_PROGRESS',
    "triggeredById" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "backup_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "activity_logs" (
    "id" UUID NOT NULL,
    "actorId" UUID,
    "actorName" TEXT NOT NULL,
    "actorRole" "ActivityActorRole" NOT NULL,
    "action" TEXT NOT NULL,
    "module" "ActivityModule" NOT NULL,
    "description" TEXT,
    "ipAddress" TEXT,
    "browser" TEXT,
    "status" "ActivityStatus" NOT NULL DEFAULT 'SUCCESS',
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "activity_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "link" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reference_numbers" (
    "id" UUID NOT NULL,
    "scope" TEXT NOT NULL,
    "lastValue" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reference_numbers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "sessions_userId_idx" ON "sessions"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "refresh_tokens_tokenHash_key" ON "refresh_tokens"("tokenHash");

-- CreateIndex
CREATE INDEX "refresh_tokens_userId_idx" ON "refresh_tokens"("userId");

-- CreateIndex
CREATE INDEX "refresh_tokens_sessionId_idx" ON "refresh_tokens"("sessionId");

-- CreateIndex
CREATE UNIQUE INDEX "sitios_name_key" ON "sitios"("name");

-- CreateIndex
CREATE UNIQUE INDEX "puroks_sitioId_name_key" ON "puroks"("sitioId", "name");

-- CreateIndex
CREATE INDEX "residents_lastName_firstName_idx" ON "residents"("lastName", "firstName");

-- CreateIndex
CREATE INDEX "residents_purokId_idx" ON "residents"("purokId");

-- CreateIndex
CREATE INDEX "residents_householdId_idx" ON "residents"("householdId");

-- CreateIndex
CREATE UNIQUE INDEX "resident_tags_residentId_tagType_key" ON "resident_tags"("residentId", "tagType");

-- CreateIndex
CREATE UNIQUE INDEX "households_householdNumber_key" ON "households"("householdNumber");

-- CreateIndex
CREATE UNIQUE INDEX "households_headResidentId_key" ON "households"("headResidentId");

-- CreateIndex
CREATE INDEX "households_purokId_idx" ON "households"("purokId");

-- CreateIndex
CREATE UNIQUE INDEX "document_types_name_key" ON "document_types"("name");

-- CreateIndex
CREATE UNIQUE INDEX "document_types_code_key" ON "document_types"("code");

-- CreateIndex
CREATE UNIQUE INDEX "certificate_requests_referenceNumber_key" ON "certificate_requests"("referenceNumber");

-- CreateIndex
CREATE INDEX "certificate_requests_status_idx" ON "certificate_requests"("status");

-- CreateIndex
CREATE INDEX "certificate_requests_referenceNumber_idx" ON "certificate_requests"("referenceNumber");

-- CreateIndex
CREATE UNIQUE INDEX "complaints_referenceNumber_key" ON "complaints"("referenceNumber");

-- CreateIndex
CREATE INDEX "complaints_status_idx" ON "complaints"("status");

-- CreateIndex
CREATE UNIQUE INDEX "blotters_caseNumber_key" ON "blotters"("caseNumber");

-- CreateIndex
CREATE INDEX "blotters_status_idx" ON "blotters"("status");

-- CreateIndex
CREATE INDEX "announcements_status_publishAt_idx" ON "announcements"("status", "publishAt");

-- CreateIndex
CREATE INDEX "comments_announcementId_idx" ON "comments"("announcementId");

-- CreateIndex
CREATE INDEX "comment_replies_commentId_idx" ON "comment_replies"("commentId");

-- CreateIndex
CREATE INDEX "reactions_targetType_targetId_idx" ON "reactions"("targetType", "targetId");

-- CreateIndex
CREATE UNIQUE INDEX "reactions_targetType_targetId_viewerKey_key" ON "reactions"("targetType", "targetId", "viewerKey");

-- CreateIndex
CREATE INDEX "activity_logs_actorId_idx" ON "activity_logs"("actorId");

-- CreateIndex
CREATE INDEX "activity_logs_module_idx" ON "activity_logs"("module");

-- CreateIndex
CREATE INDEX "notifications_isRead_idx" ON "notifications"("isRead");

-- CreateIndex
CREATE UNIQUE INDEX "reference_numbers_scope_key" ON "reference_numbers"("scope");

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "puroks" ADD CONSTRAINT "puroks_sitioId_fkey" FOREIGN KEY ("sitioId") REFERENCES "sitios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "residents" ADD CONSTRAINT "residents_purokId_fkey" FOREIGN KEY ("purokId") REFERENCES "puroks"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "residents" ADD CONSTRAINT "residents_householdId_fkey" FOREIGN KEY ("householdId") REFERENCES "households"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "residents" ADD CONSTRAINT "residents_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resident_tags" ADD CONSTRAINT "resident_tags_residentId_fkey" FOREIGN KEY ("residentId") REFERENCES "residents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resident_tags" ADD CONSTRAINT "resident_tags_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "households" ADD CONSTRAINT "households_sitioId_fkey" FOREIGN KEY ("sitioId") REFERENCES "sitios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "households" ADD CONSTRAINT "households_purokId_fkey" FOREIGN KEY ("purokId") REFERENCES "puroks"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "households" ADD CONSTRAINT "households_headResidentId_fkey" FOREIGN KEY ("headResidentId") REFERENCES "residents"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "households" ADD CONSTRAINT "households_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "certificate_templates" ADD CONSTRAINT "certificate_templates_documentTypeId_fkey" FOREIGN KEY ("documentTypeId") REFERENCES "document_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "certificate_requests" ADD CONSTRAINT "certificate_requests_documentTypeId_fkey" FOREIGN KEY ("documentTypeId") REFERENCES "document_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "certificate_requests" ADD CONSTRAINT "certificate_requests_residentId_fkey" FOREIGN KEY ("residentId") REFERENCES "residents"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "certificate_requests" ADD CONSTRAINT "certificate_requests_processedById_fkey" FOREIGN KEY ("processedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "certificate_requirements" ADD CONSTRAINT "certificate_requirements_certificateRequestId_fkey" FOREIGN KEY ("certificateRequestId") REFERENCES "certificate_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "certificate_timeline_events" ADD CONSTRAINT "certificate_timeline_events_certificateRequestId_fkey" FOREIGN KEY ("certificateRequestId") REFERENCES "certificate_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "complaint_timeline_events" ADD CONSTRAINT "complaint_timeline_events_complaintId_fkey" FOREIGN KEY ("complaintId") REFERENCES "complaints"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "incident_photos" ADD CONSTRAINT "incident_photos_complaintId_fkey" FOREIGN KEY ("complaintId") REFERENCES "complaints"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blotters" ADD CONSTRAINT "blotters_mediatorId_fkey" FOREIGN KEY ("mediatorId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blotter_hearings" ADD CONSTRAINT "blotter_hearings_blotterId_fkey" FOREIGN KEY ("blotterId") REFERENCES "blotters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blotter_history_events" ADD CONSTRAINT "blotter_history_events_blotterId_fkey" FOREIGN KEY ("blotterId") REFERENCES "blotters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "announcements" ADD CONSTRAINT "announcements_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "announcement_attachments" ADD CONSTRAINT "announcement_attachments_announcementId_fkey" FOREIGN KEY ("announcementId") REFERENCES "announcements"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_announcementId_fkey" FOREIGN KEY ("announcementId") REFERENCES "announcements"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comment_replies" ADD CONSTRAINT "comment_replies_commentId_fkey" FOREIGN KEY ("commentId") REFERENCES "comments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comment_replies" ADD CONSTRAINT "comment_replies_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reactions" ADD CONSTRAINT "reactions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "backup_records" ADD CONSTRAINT "backup_records_triggeredById_fkey" FOREIGN KEY ("triggeredById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
