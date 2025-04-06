/*
  Warnings:

  - You are about to drop the column `companyTypeId` on the `stores` table. All the data in the column will be lost.
  - Added the required column `company_type_id` to the `stores` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "stores" DROP CONSTRAINT "stores_companyTypeId_fkey";

-- DropIndex
DROP INDEX "stores_companyTypeId_key";

-- AlterTable
ALTER TABLE "stores" DROP COLUMN "companyTypeId",
ADD COLUMN     "company_type_id" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "stores" ADD CONSTRAINT "stores_company_type_id_fkey" FOREIGN KEY ("company_type_id") REFERENCES "company_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
