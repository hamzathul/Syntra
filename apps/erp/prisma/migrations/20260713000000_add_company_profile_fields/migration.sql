-- AlterTable
ALTER TABLE "Company" ADD COLUMN "gstin" TEXT;
ALTER TABLE "Company" ADD COLUMN "phone1" TEXT;
ALTER TABLE "Company" ADD COLUMN "phone2" TEXT;
ALTER TABLE "Company" ADD COLUMN "email" TEXT;
ALTER TABLE "Company" ADD COLUMN "address" TEXT;
ALTER TABLE "Company" ADD COLUMN "pincode" TEXT;
ALTER TABLE "Company" ADD COLUMN "description" TEXT;
ALTER TABLE "Company" ADD COLUMN "signature" TEXT;
ALTER TABLE "Company" ADD COLUMN "state" TEXT;
ALTER TABLE "Company" ADD COLUMN "businessType" TEXT;
ALTER TABLE "Company" ADD COLUMN "businessCategory" TEXT;
ALTER TABLE "Company" ADD COLUMN "logo" TEXT;
ALTER TABLE "Company" ADD COLUMN "showOnCard" JSONB DEFAULT '[]'::jsonb;
ALTER TABLE "Company" ADD COLUMN "shareToken" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Company_shareToken_key" ON "Company"("shareToken");
