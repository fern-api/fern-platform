/*
  Warnings:

  - You are about to drop the column `logo_s3_url` on the `Apis` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Apis" DROP COLUMN "logo_s3_url",
ADD COLUMN     "image_info" BYTEA;
