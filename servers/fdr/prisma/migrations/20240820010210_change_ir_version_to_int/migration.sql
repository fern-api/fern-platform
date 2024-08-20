/*
  Warnings:

  - Changed the type of `irVersion` on the `CliRelease` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `irVersion` on the `GeneratorRelease` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/

-- This migration should be fine since we don't have any records in these tables
-- AlterTable
ALTER TABLE "CliRelease" DROP COLUMN "irVersion",
ADD COLUMN     "irVersion" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "GeneratorRelease" DROP COLUMN "irVersion",
ADD COLUMN     "irVersion" INTEGER NOT NULL;
