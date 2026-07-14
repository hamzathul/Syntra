/*
  Warnings:

  - You are about to drop the column `shareToken` on the `Company` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Company_shareToken_key";

-- AlterTable
ALTER TABLE "Company" DROP COLUMN "shareToken";
