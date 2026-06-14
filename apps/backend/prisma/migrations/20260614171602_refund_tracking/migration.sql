-- CreateEnum
CREATE TYPE "OrderChangeRequestStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "OrderChangeRequestType" AS ENUM ('ADDRESS', 'SIZE', 'COLOR', 'PRODUCT');

-- AlterTable
ALTER TABLE "Refund" ADD COLUMN     "carrier" TEXT,
ADD COLUMN     "customerSentAt" TIMESTAMP(3),
ADD COLUMN     "trackingNumber" TEXT;

-- CreateTable
CREATE TABLE "OrderChangeRequest" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "type" "OrderChangeRequestType" NOT NULL,
    "status" "OrderChangeRequestStatus" NOT NULL DEFAULT 'PENDING',
    "currentValue" TEXT,
    "requestedValue" TEXT,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedAt" TIMESTAMP(3),

    CONSTRAINT "OrderChangeRequest_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "OrderChangeRequest" ADD CONSTRAINT "OrderChangeRequest_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;
