/*
  Warnings:

  - Added the required column `expiresAt` to the `Cart` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Cart" ADD COLUMN     "expiresAt" TIMESTAMP(3) NOT NULL;
