/*
  - adds displayName as nullable column to Generator
  - sets displayName to id for all existing rows
  - makes displayName not nullable

*/
-- AlterTable
ALTER TABLE "Generator" ADD COLUMN "displayName" TEXT;
UPDATE "Generator" SET "displayName" = "id";
ALTER TABLE "Generator" ALTER COLUMN "displayName" SET NOT NULL;
