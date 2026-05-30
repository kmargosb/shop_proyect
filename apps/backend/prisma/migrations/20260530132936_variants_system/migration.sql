/*
  Warnings:

  - The values [PENDING] on the enum `RefundStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `productId` on the `InventoryReservation` table. All the data in the column will be lost.
  - You are about to drop the column `reservedStock` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `stock` on the `Product` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[variantId,orderId]` on the table `InventoryReservation` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `variantId` to the `InventoryReservation` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ProductGender" AS ENUM ('MEN', 'WOMEN', 'UNISEX');

-- CreateEnum
CREATE TYPE "ProductSize" AS ENUM ('XS', 'S', 'M', 'L', 'XL', 'XXL', 'ONE_SIZE');

-- CreateEnum
CREATE TYPE "ProductColor" AS ENUM ('BLACK', 'WHITE', 'BEIGE', 'GREY', 'GREEN', 'RED', 'BLUE', 'BROWN', 'PINK', 'YELLOW');

-- AlterEnum
ALTER TYPE "OrderStatus" ADD VALUE 'DELIVERED';

-- AlterEnum
BEGIN;
CREATE TYPE "RefundStatus_new" AS ENUM ('PENDING_REVIEW', 'APPROVED', 'REJECTED', 'SUCCEEDED', 'FAILED');
ALTER TABLE "public"."Refund" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Refund" ALTER COLUMN "status" TYPE "RefundStatus_new" USING ("status"::text::"RefundStatus_new");
ALTER TYPE "RefundStatus" RENAME TO "RefundStatus_old";
ALTER TYPE "RefundStatus_new" RENAME TO "RefundStatus";
DROP TYPE "public"."RefundStatus_old";
ALTER TABLE "Refund" ALTER COLUMN "status" SET DEFAULT 'PENDING_REVIEW';
COMMIT;

-- DropForeignKey
ALTER TABLE "InventoryReservation" DROP CONSTRAINT "InventoryReservation_productId_fkey";

-- DropIndex
DROP INDEX "InventoryReservation_productId_expiresAt_idx";

-- DropIndex
DROP INDEX "InventoryReservation_productId_orderId_key";

-- AlterTable
ALTER TABLE "CartItem" ADD COLUMN     "variantId" TEXT;

-- AlterTable
ALTER TABLE "InventoryReservation" DROP COLUMN "productId",
ADD COLUMN     "variantId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "OrderItem" ADD COLUMN     "color" "ProductColor",
ADD COLUMN     "size" "ProductSize",
ADD COLUMN     "variantId" TEXT;

-- AlterTable
ALTER TABLE "Product" DROP COLUMN "reservedStock",
DROP COLUMN "stock",
ADD COLUMN     "gender" "ProductGender" NOT NULL DEFAULT 'UNISEX';

-- AlterTable
ALTER TABLE "Refund" ADD COLUMN     "rejectionReason" TEXT,
ADD COLUMN     "reviewedAt" TIMESTAMP(3),
ADD COLUMN     "reviewedBy" TEXT,
ALTER COLUMN "status" SET DEFAULT 'PENDING_REVIEW';

-- CreateTable
CREATE TABLE "ProductVariant" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "size" "ProductSize" NOT NULL,
    "color" "ProductColor" NOT NULL,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "reservedStock" INTEGER NOT NULL DEFAULT 0,
    "sku" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProductVariant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RefundEvidence" (
    "id" TEXT NOT NULL,
    "refundId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "publicId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RefundEvidence_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ProductVariant_productId_idx" ON "ProductVariant"("productId");

-- CreateIndex
CREATE INDEX "CartItem_variantId_idx" ON "CartItem"("variantId");

-- CreateIndex
CREATE INDEX "InventoryReservation_variantId_expiresAt_idx" ON "InventoryReservation"("variantId", "expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "InventoryReservation_variantId_orderId_key" ON "InventoryReservation"("variantId", "orderId");

-- CreateIndex
CREATE INDEX "OrderItem_variantId_idx" ON "OrderItem"("variantId");

-- AddForeignKey
ALTER TABLE "ProductVariant" ADD CONSTRAINT "ProductVariant_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CartItem" ADD CONSTRAINT "CartItem_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "ProductVariant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryReservation" ADD CONSTRAINT "InventoryReservation_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "ProductVariant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "ProductVariant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RefundEvidence" ADD CONSTRAINT "RefundEvidence_refundId_fkey" FOREIGN KEY ("refundId") REFERENCES "Refund"("id") ON DELETE CASCADE ON UPDATE CASCADE;
