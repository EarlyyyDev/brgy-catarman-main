-- AlterTable
ALTER TABLE "system_settings" ADD COLUMN     "maintenanceMessage" TEXT,
ADD COLUMN     "maintenanceMode" BOOLEAN NOT NULL DEFAULT false;
