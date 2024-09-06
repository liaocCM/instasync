/*
  Warnings:

  - You are about to drop the column `mode` on the `rooms` table. All the data in the column will be lost.
  - The `roles` column on the `users` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN');

-- AlterTable
ALTER TABLE "rooms" DROP COLUMN "mode",
ADD COLUMN     "enableModes" "RoomMode"[] DEFAULT ARRAY[]::"RoomMode"[];

-- AlterTable
ALTER TABLE "users" DROP COLUMN "roles",
ADD COLUMN     "roles" "UserRole"[] DEFAULT ARRAY[]::"UserRole"[];
