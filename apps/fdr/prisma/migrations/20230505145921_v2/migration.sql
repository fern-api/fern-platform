/*
  Warnings:

  - You are about to drop the `ApiDefinitions` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Apis` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Environments` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ApiDefinitions" DROP CONSTRAINT "ApiDefinitions_orgId_apiId_fkey";

-- DropForeignKey
ALTER TABLE "ApiDefinitions" DROP CONSTRAINT "ApiDefinitions_orgId_environmentId_fkey";

-- DropTable
DROP TABLE "ApiDefinitions";

-- DropTable
DROP TABLE "Apis";

-- DropTable
DROP TABLE "Environments";

-- CreateTable
CREATE TABLE "ApiDefinitionsV2" (
    "orgId" TEXT NOT NULL,
    "apiName" TEXT NOT NULL,
    "apiDefinitionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "definition" BYTEA NOT NULL,

    CONSTRAINT "ApiDefinitionsV2_pkey" PRIMARY KEY ("apiDefinitionId")
);

-- CreateTable
CREATE TABLE "Docs" (
    "url" TEXT NOT NULL,
    "docsDefinition" BYTEA NOT NULL,

    CONSTRAINT "Docs_pkey" PRIMARY KEY ("url")
);
