-- DropIndex
DROP INDEX "Address_userId_idx";

-- AlterTable
ALTER TABLE "Address" ADD COLUMN     "isDefault" BOOLEAN NOT NULL DEFAULT false;
