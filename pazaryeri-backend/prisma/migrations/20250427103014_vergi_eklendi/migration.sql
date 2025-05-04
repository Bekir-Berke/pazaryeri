/*
  Warnings:

  - Added the required column `vatPrice` to the `products` table without a default value. This is not possible if the table is not empty.
  - Added the required column `vatRate` to the `products` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "products" ADD COLUMN     "vatPrice" DECIMAL(10,2) NOT NULL,
ADD COLUMN     "vatRate" DECIMAL(5,2) NOT NULL;
