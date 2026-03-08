/*
  Warnings:

  - A unique constraint covering the columns `[productId,orderId]` on the table `InventoryReservation` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "InventoryReservation" DROP CONSTRAINT "InventoryReservation_orderId_fkey";

-- DropForeignKey
ALTER TABLE "InventoryReservation" DROP CONSTRAINT "InventoryReservation_productId_fkey";

-- CreateIndex
CREATE INDEX "InventoryReservation_productId_expiresAt_idx" ON "InventoryReservation"("productId", "expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "InventoryReservation_productId_orderId_key" ON "InventoryReservation"("productId", "orderId");

-- AddForeignKey
ALTER TABLE "InventoryReservation" ADD CONSTRAINT "InventoryReservation_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryReservation" ADD CONSTRAINT "InventoryReservation_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
