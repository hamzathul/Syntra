-- CreateEnum
CREATE TYPE "ItemType" AS ENUM ('GOODS', 'SERVICE');

-- CreateEnum
CREATE TYPE "DiscountType" AS ENUM ('AMOUNT', 'PERCENTAGE');

-- CreateTable
CREATE TABLE "Unit" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "shortName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Unit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ItemCategory" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ItemCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Item" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "itemType" "ItemType" NOT NULL DEFAULT 'GOODS',
    "itemCode" TEXT,
    "barcode" TEXT,
    "categoryId" TEXT,
    "hsnSac" TEXT,
    "description" TEXT,
    "image" TEXT,
    "unitPrimaryId" TEXT NOT NULL,
    "unitSecondaryId" TEXT,
    "unitConversionRate" DECIMAL(15,4),
    "salePriceExclTax" DECIMAL(15,4),
    "salePriceInclTax" DECIMAL(15,4),
    "saleDiscountType" "DiscountType",
    "saleDiscountValue" DECIMAL(15,4),
    "purchasePriceExclTax" DECIMAL(15,4),
    "purchasePriceInclTax" DECIMAL(15,4),
    "taxRateId" TEXT,
    "taxGroupId" TEXT,
    "openingStock" DECIMAL(15,4),
    "openingStockDate" TIMESTAMP(3),
    "openingStockValuePerUnit" DECIMAL(15,4),
    "minStockQuantity" DECIMAL(15,4),
    "location" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Item_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Unit_companyId_name_key" ON "Unit"("companyId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "ItemCategory_companyId_name_key" ON "ItemCategory"("companyId", "name");

-- CreateIndex
CREATE INDEX "Item_companyId_idx" ON "Item"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "Item_companyId_name_key" ON "Item"("companyId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "Item_companyId_itemCode_key" ON "Item"("companyId", "itemCode");

-- CreateIndex
CREATE UNIQUE INDEX "Item_companyId_barcode_key" ON "Item"("companyId", "barcode");

-- AddForeignKey
ALTER TABLE "Unit" ADD CONSTRAINT "Unit_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItemCategory" ADD CONSTRAINT "ItemCategory_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Item" ADD CONSTRAINT "Item_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Item" ADD CONSTRAINT "Item_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "ItemCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Item" ADD CONSTRAINT "Item_unitPrimaryId_fkey" FOREIGN KEY ("unitPrimaryId") REFERENCES "Unit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Item" ADD CONSTRAINT "Item_unitSecondaryId_fkey" FOREIGN KEY ("unitSecondaryId") REFERENCES "Unit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Item" ADD CONSTRAINT "Item_taxRateId_fkey" FOREIGN KEY ("taxRateId") REFERENCES "TaxRate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Item" ADD CONSTRAINT "Item_taxGroupId_fkey" FOREIGN KEY ("taxGroupId") REFERENCES "TaxGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Seed default units for every existing company (idempotent)
INSERT INTO "Unit" ("id", "companyId", "name", "shortName", "createdAt", "updatedAt")
SELECT 'seed_' || lower(u.name) || '_' || c."id", c."id", u.name, u.shortName, NOW(), NOW()
FROM "Company" c
CROSS JOIN (VALUES
  ('Kilogram', 'kg'),
  ('Gram', 'g'),
  ('Unit', 'unit'),
  ('Bottle', 'bottle'),
  ('Hour', 'hr'),
  ('Piece', 'pcs'),
  ('Roll', 'roll'),
  ('Meter', 'm'),
  ('Litre', 'l')
) AS u(name, shortName)
ON CONFLICT ("companyId", "name") DO NOTHING;
