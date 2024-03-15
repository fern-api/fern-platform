/*
  Warnings:

  - You are about to drop the column `apiName` on the `DocsV2` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "DocsV2" DROP COLUMN "apiName",
ADD COLUMN     "isPreview" BOOLEAN NOT NULL DEFAULT false;
