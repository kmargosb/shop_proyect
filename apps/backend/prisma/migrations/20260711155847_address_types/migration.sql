-- CreateEnum
CREATE TYPE "AddressType" AS ENUM ('SHIPPING', 'BILLING');

-- AlterTable
ALTER TABLE "Address" ADD COLUMN     "companyName" TEXT,
ADD COLUMN     "type" "AddressType" NOT NULL DEFAULT 'SHIPPING',
ADD COLUMN     "vatNumber" TEXT,
ALTER COLUMN "phone" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "Address_userId_type_idx" ON "Address"("userId", "type");
