-- CreateEnum
CREATE TYPE "SaleType" AS ENUM ('CASH', 'CREDIT');

-- CreateEnum
CREATE TYPE "PaymentMode" AS ENUM ('CASH', 'CHEQUE', 'BANK');

-- CreateEnum
CREATE TYPE "ChequeStatus" AS ENUM ('RECEIVED', 'DEPOSITED_BANK', 'DEPOSITED_CASH', 'BOUNCED');

-- CreateTable
CREATE TABLE "Sale" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "partyId" TEXT NOT NULL,
    "saleType" "SaleType" NOT NULL,
    "saleDate" TIMESTAMP(3) NOT NULL,
    "totalAmount" DECIMAL(15,4) NOT NULL,
    "receivedAmount" DECIMAL(15,4) NOT NULL DEFAULT 0,
    "description" TEXT,
    "image" TEXT,
    "document" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Sale_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SalePayment" (
    "id" TEXT NOT NULL,
    "saleId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "mode" "PaymentMode" NOT NULL,
    "amount" DECIMAL(15,4) NOT NULL,
    "bankId" TEXT,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SalePayment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Cheque" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "salePaymentId" TEXT NOT NULL,
    "saleId" TEXT NOT NULL,
    "drawBankName" TEXT NOT NULL,
    "chequeNumber" TEXT NOT NULL,
    "chequeDate" TIMESTAMP(3) NOT NULL,
    "amount" DECIMAL(15,4) NOT NULL,
    "status" "ChequeStatus" NOT NULL DEFAULT 'RECEIVED',
    "depositBankId" TEXT,
    "depositedAt" TIMESTAMP(3),
    "notes" TEXT,
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Cheque_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Sale_companyId_saleDate_idx" ON "Sale"("companyId", "saleDate");

-- CreateIndex
CREATE INDEX "Sale_companyId_partyId_idx" ON "Sale"("companyId", "partyId");

-- CreateIndex
CREATE INDEX "SalePayment_saleId_idx" ON "SalePayment"("saleId");

-- CreateIndex
CREATE INDEX "SalePayment_companyId_idx" ON "SalePayment"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "Cheque_salePaymentId_key" ON "Cheque"("salePaymentId");

-- CreateIndex
CREATE INDEX "Cheque_companyId_status_idx" ON "Cheque"("companyId", "status");

-- AddForeignKey
ALTER TABLE "Sale" ADD CONSTRAINT "Sale_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sale" ADD CONSTRAINT "Sale_partyId_fkey" FOREIGN KEY ("partyId") REFERENCES "Party"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalePayment" ADD CONSTRAINT "SalePayment_saleId_fkey" FOREIGN KEY ("saleId") REFERENCES "Sale"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalePayment" ADD CONSTRAINT "SalePayment_bankId_fkey" FOREIGN KEY ("bankId") REFERENCES "Bank"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalePayment" ADD CONSTRAINT "SalePayment_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cheque" ADD CONSTRAINT "Cheque_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cheque" ADD CONSTRAINT "Cheque_saleId_fkey" FOREIGN KEY ("saleId") REFERENCES "Sale"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cheque" ADD CONSTRAINT "Cheque_salePaymentId_fkey" FOREIGN KEY ("salePaymentId") REFERENCES "SalePayment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cheque" ADD CONSTRAINT "Cheque_depositBankId_fkey" FOREIGN KEY ("depositBankId") REFERENCES "Bank"("id") ON DELETE SET NULL ON UPDATE CASCADE;
