/*
  Warnings:

  - You are about to drop the column `isDefault` on the `Address` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Address" DROP COLUMN "isDefault",
ADD COLUMN     "isDefaultBilling" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isDefaultShipping" BOOLEAN NOT NULL DEFAULT false;
