/*
  Warnings:

  - You are about to drop the column `resetPasswordExpiresAt` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `resetPasswordTokenHash` on the `users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "users" DROP COLUMN "resetPasswordExpiresAt",
DROP COLUMN "resetPasswordTokenHash",
ADD COLUMN     "securityAnswer1Hash" TEXT,
ADD COLUMN     "securityAnswer2Hash" TEXT,
ADD COLUMN     "securityQuestion1" TEXT,
ADD COLUMN     "securityQuestion2" TEXT;
