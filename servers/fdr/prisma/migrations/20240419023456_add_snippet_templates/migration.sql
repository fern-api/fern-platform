-- CreateEnum
CREATE TYPE "SnippetTemplateSemanticVersion" AS ENUM ('v1');

-- CreateTable
CREATE TABLE "SnippetTemplate" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "apiName" TEXT NOT NULL,
    "apiDefinitionId" TEXT NOT NULL,
    "endpointPath" TEXT NOT NULL,
    "endpointMethod" "HttpMethod" NOT NULL,
    "sdkId" TEXT NOT NULL,
    "version" "SnippetTemplateSemanticVersion" NOT NULL,
    "functionInvocation" BYTEA NOT NULL,
    "clientInstantiation" BYTEA NOT NULL,

    CONSTRAINT "SnippetTemplate_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "SnippetTemplate" ADD CONSTRAINT "SnippetTemplate_sdkId_fkey" FOREIGN KEY ("sdkId") REFERENCES "Sdk"("id") ON DELETE CASCADE ON UPDATE CASCADE;
