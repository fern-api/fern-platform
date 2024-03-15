/*
  Warnings:

  - You are about to drop the `Api` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ApiVersions` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "Api";

-- DropTable
DROP TABLE "ApiVersions";

-- CreateTable
CREATE TABLE "Environments" (
    "orgId" TEXT NOT NULL,
    "environmentId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,

    CONSTRAINT "Environments_pkey" PRIMARY KEY ("orgId","environmentId")
);

-- CreateTable
CREATE TABLE "Apis" (
    "orgId" TEXT NOT NULL,
    "apiId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "logo_s3_url" TEXT,
    "git_repo" BYTEA,

    CONSTRAINT "Apis_pkey" PRIMARY KEY ("orgId","apiId")
);

-- CreateTable
CREATE TABLE "ApiDefinitions" (
    "orgId" TEXT NOT NULL,
    "apiId" TEXT NOT NULL,
    "apiDefinitionId" TEXT NOT NULL,
    "environmentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "definition" BYTEA NOT NULL,

    CONSTRAINT "ApiDefinitions_pkey" PRIMARY KEY ("orgId","apiId","apiDefinitionId")
);

-- AddForeignKey
ALTER TABLE "ApiDefinitions" ADD CONSTRAINT "ApiDefinitions_orgId_apiId_fkey" FOREIGN KEY ("orgId", "apiId") REFERENCES "Apis"("orgId", "apiId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApiDefinitions" ADD CONSTRAINT "ApiDefinitions_orgId_environmentId_fkey" FOREIGN KEY ("orgId", "environmentId") REFERENCES "Environments"("orgId", "environmentId") ON DELETE RESTRICT ON UPDATE CASCADE;
