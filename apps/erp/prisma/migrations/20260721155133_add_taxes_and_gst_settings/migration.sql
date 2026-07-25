-- AlterTable
ALTER TABLE "CompanySettings" ADD COLUMN     "stateOfSupplyEnabled" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "TaxRate" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "rate" DECIMAL(5,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TaxRate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TaxGroup" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TaxGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TaxGroupRate" (
    "taxGroupId" TEXT NOT NULL,
    "taxRateId" TEXT NOT NULL,

    CONSTRAINT "TaxGroupRate_pkey" PRIMARY KEY ("taxGroupId","taxRateId")
);

-- CreateIndex
CREATE UNIQUE INDEX "TaxRate_companyId_name_key" ON "TaxRate"("companyId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "TaxGroup_companyId_name_key" ON "TaxGroup"("companyId", "name");

-- AddForeignKey
ALTER TABLE "TaxRate" ADD CONSTRAINT "TaxRate_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaxGroup" ADD CONSTRAINT "TaxGroup_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaxGroupRate" ADD CONSTRAINT "TaxGroupRate_taxGroupId_fkey" FOREIGN KEY ("taxGroupId") REFERENCES "TaxGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaxGroupRate" ADD CONSTRAINT "TaxGroupRate_taxRateId_fkey" FOREIGN KEY ("taxRateId") REFERENCES "TaxRate"("id") ON DELETE CASCADE ON UPDATE CASCADE;
