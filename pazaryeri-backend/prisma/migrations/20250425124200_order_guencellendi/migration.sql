/*
  Warnings:

  - Added the required column `card_brand` to the `cards` table without a default value. This is not possible if the table is not empty.
  - Added the required column `cart_issuer` to the `cards` table without a default value. This is not possible if the table is not empty.
  - Added the required column `card_brand` to the `orders` table without a default value. This is not possible if the table is not empty.
  - Added the required column `card_holder_name` to the `orders` table without a default value. This is not possible if the table is not empty.
  - Added the required column `card_number` to the `orders` table without a default value. This is not possible if the table is not empty.
  - Added the required column `card_type` to the `orders` table without a default value. This is not possible if the table is not empty.
  - Added the required column `cart_issuer` to the `orders` table without a default value. This is not possible if the table is not empty.
  - Added the required column `cvv` to the `orders` table without a default value. This is not possible if the table is not empty.
  - Added the required column `expiry_month` to the `orders` table without a default value. This is not possible if the table is not empty.
  - Added the required column `expiry_year` to the `orders` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "orders" DROP CONSTRAINT "orders_addressId_fkey";

-- AlterTable
ALTER TABLE "cards" ADD COLUMN     "card_brand" TEXT NOT NULL,
ADD COLUMN     "cart_issuer" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "address_title" TEXT,
ADD COLUMN     "card_brand" TEXT NOT NULL,
ADD COLUMN     "card_holder_name" TEXT NOT NULL,
ADD COLUMN     "card_number" TEXT NOT NULL,
ADD COLUMN     "card_type" TEXT NOT NULL,
ADD COLUMN     "cart_issuer" TEXT NOT NULL,
ADD COLUMN     "city" TEXT,
ADD COLUMN     "cvv" TEXT NOT NULL,
ADD COLUMN     "district" TEXT,
ADD COLUMN     "expiry_month" INTEGER NOT NULL,
ADD COLUMN     "expiry_year" INTEGER NOT NULL,
ADD COLUMN     "full_name" TEXT,
ADD COLUMN     "neighborhood" TEXT,
ALTER COLUMN "cardId" DROP NOT NULL,
ALTER COLUMN "addressId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_addressId_fkey" FOREIGN KEY ("addressId") REFERENCES "addresses"("id") ON DELETE SET NULL ON UPDATE CASCADE;
