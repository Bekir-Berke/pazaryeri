/*
  Warnings:

  - Added the required column `vatPrice` to the `order_items` table without a default value. This is not possible if the table is not empty.
  - Added the required column `vatRate` to the `order_items` table without a default value. This is not possible if the table is not empty.
  - Added the required column `total_vat` to the `orders` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "order_items" ADD COLUMN     "vatPrice" DECIMAL(10,2) NOT NULL,
ADD COLUMN     "vatRate" DECIMAL(5,2) NOT NULL;

-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "total_vat" DECIMAL(10,2) NOT NULL;
