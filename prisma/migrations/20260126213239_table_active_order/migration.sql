/*
  Warnings:

  - A unique constraint covering the columns `[activeOrderId]` on the table `Table` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[locationId,areaId,name]` on the table `Table` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "tableIdRef" INTEGER;

-- AlterTable
ALTER TABLE "Table" ADD COLUMN     "activeOrderId" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "Table_activeOrderId_key" ON "Table"("activeOrderId");

-- CreateIndex
CREATE INDEX "Table_locationId_idx" ON "Table"("locationId");

-- CreateIndex
CREATE INDEX "Table_areaId_idx" ON "Table"("areaId");

-- CreateIndex
CREATE UNIQUE INDEX "Table_locationId_areaId_name_key" ON "Table"("locationId", "areaId", "name");

-- AddForeignKey
ALTER TABLE "Table" ADD CONSTRAINT "Table_activeOrderId_fkey" FOREIGN KEY ("activeOrderId") REFERENCES "Order"("id") ON DELETE SET NULL ON UPDATE CASCADE;
