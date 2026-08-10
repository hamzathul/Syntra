-- CreateEnum
CREATE TYPE "AdjustmentType" AS ENUM ('INCREASE', 'DECREASE');

-- AlterTable
ALTER TABLE "Bank" ADD COLUMN     "currentBalance" DECIMAL(15,4) NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "CashAccount" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "currentBalance" DECIMAL(15,4) NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CashAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CashAdjustment" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "type" "AdjustmentType" NOT NULL,
    "amount" DECIMAL(15,4) NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CashAdjustment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BankAdjustment" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "bankId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "type" "AdjustmentType" NOT NULL,
    "amount" DECIMAL(15,4) NOT NULL,
    "description" TEXT,
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BankAdjustment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MoneyTransfer" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "amount" DECIMAL(15,4) NOT NULL,
    "fromBankId" TEXT,
    "toBankId" TEXT,
    "description" TEXT,
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MoneyTransfer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CashAccount_companyId_key" ON "CashAccount"("companyId");

-- CreateIndex
CREATE INDEX "CashAdjustment_companyId_date_idx" ON "CashAdjustment"("companyId", "date");

-- CreateIndex
CREATE INDEX "BankAdjustment_companyId_date_idx" ON "BankAdjustment"("companyId", "date");

-- CreateIndex
CREATE INDEX "BankAdjustment_bankId_date_idx" ON "BankAdjustment"("bankId", "date");

-- CreateIndex
CREATE INDEX "MoneyTransfer_companyId_date_idx" ON "MoneyTransfer"("companyId", "date");

-- CreateIndex
CREATE INDEX "MoneyTransfer_fromBankId_idx" ON "MoneyTransfer"("fromBankId");

-- CreateIndex
CREATE INDEX "MoneyTransfer_toBankId_idx" ON "MoneyTransfer"("toBankId");

-- AddForeignKey
ALTER TABLE "CashAccount" ADD CONSTRAINT "CashAccount_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CashAdjustment" ADD CONSTRAINT "CashAdjustment_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BankAdjustment" ADD CONSTRAINT "BankAdjustment_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BankAdjustment" ADD CONSTRAINT "BankAdjustment_bankId_fkey" FOREIGN KEY ("bankId") REFERENCES "Bank"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MoneyTransfer" ADD CONSTRAINT "MoneyTransfer_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MoneyTransfer" ADD CONSTRAINT "MoneyTransfer_fromBankId_fkey" FOREIGN KEY ("fromBankId") REFERENCES "Bank"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MoneyTransfer" ADD CONSTRAINT "MoneyTransfer_toBankId_fkey" FOREIGN KEY ("toBankId") REFERENCES "Bank"("id") ON DELETE SET NULL ON UPDATE CASCADE;
