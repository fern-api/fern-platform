-- CreateTable
CREATE TABLE "ApiDefinitionsLatest" (
    "orgId" TEXT NOT NULL,
    "apiName" TEXT NOT NULL,
    "apiDefinitionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "definition" BYTEA NOT NULL,

    CONSTRAINT "ApiDefinitionsLatest_pkey" PRIMARY KEY ("apiDefinitionId")
);
