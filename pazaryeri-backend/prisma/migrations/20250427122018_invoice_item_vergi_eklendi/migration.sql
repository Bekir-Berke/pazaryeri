/*
  Warnings:

  - Added the required column `vat_rate` to the `invoice_items` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "invoice_items" ADD COLUMN     "vat_rate" DECIMAL(5,2) NOT NULL;
