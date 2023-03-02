/*
  Warnings:

  - You are about to drop the column `name` on the `Environments` table. All the data in the column will be lost.
  - You are about to drop the column `url` on the `Environments` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Environments" DROP COLUMN "name",
DROP COLUMN "url",
ADD COLUMN     "description" TEXT;
