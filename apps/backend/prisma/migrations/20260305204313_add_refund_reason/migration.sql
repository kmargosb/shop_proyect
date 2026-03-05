/*
  Warnings:

  - The `reason` column on the `Refund` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "RefundReason" AS ENUM ('CUSTOMER_RETURN', 'DAMAGED', 'WRONG_ITEM', 'FRAUD', 'ORDER_CANCELLED', 'OTHER');

-- AlterTable
ALTER TABLE "Refund" ADD COLUMN     "note" TEXT,
DROP COLUMN "reason",
ADD COLUMN     "reason" "RefundReason";
