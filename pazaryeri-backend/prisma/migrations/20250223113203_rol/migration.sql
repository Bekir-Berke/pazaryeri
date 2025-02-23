-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'STORE', 'ADMIN');

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "role" "Role" NOT NULL DEFAULT 'USER';
