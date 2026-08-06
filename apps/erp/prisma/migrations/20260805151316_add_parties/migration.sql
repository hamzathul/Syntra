-- CreateEnum
CREATE TYPE "OpeningBalanceType" AS ENUM ('TO_PAY', 'TO_RECEIVE');

-- CreateTable
CREATE TABLE "Party" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "contactNumber" TEXT,
    "openingBalanceAmount" DECIMAL(15,4),
    "openingBalanceType" "OpeningBalanceType",
    "openingBalanceDate" TIMESTAMP(3),
    "creditLimit" DECIMAL(15,4),
    "billingAddress" TEXT,
    "email" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Party_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Party_companyId_idx" ON "Party"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "Party_companyId_name_key" ON "Party"("companyId", "name");

-- AddForeignKey
ALTER TABLE "Party" ADD CONSTRAINT "Party_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
