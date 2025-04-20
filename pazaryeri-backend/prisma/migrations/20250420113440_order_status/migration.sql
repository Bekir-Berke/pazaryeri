/*
  Warnings:

  - You are about to drop the column `status` on the `orders` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "order_items" ADD COLUMN     "status" "OrderStatus" NOT NULL DEFAULT 'PROCESSING';

-- AlterTable
ALTER TABLE "orders" DROP COLUMN "status";
