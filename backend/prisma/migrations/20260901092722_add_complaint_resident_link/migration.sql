-- AlterTable
ALTER TABLE "complaints" ADD COLUMN     "residentId" UUID;

-- AddForeignKey
ALTER TABLE "complaints" ADD CONSTRAINT "complaints_residentId_fkey" FOREIGN KEY ("residentId") REFERENCES "residents"("id") ON DELETE SET NULL ON UPDATE CASCADE;
