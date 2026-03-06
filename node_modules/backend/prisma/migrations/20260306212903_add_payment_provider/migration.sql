-- CreateEnum
CREATE TYPE "PaymentProvider" AS ENUM ('STRIPE', 'PAYPAL', 'KLARNA');

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "paymentProvider" "PaymentProvider" NOT NULL DEFAULT 'STRIPE';
