-- AlterTable
ALTER TABLE "DocsV2" ADD COLUMN     "docsConfigInstanceId" TEXT;

-- CreateTable
CREATE TABLE "DocsConfigInstances" (
    "docsConfigInstanceId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "referencedApiDefinitionIds" JSONB,
    "docsConfig" BYTEA NOT NULL,

    CONSTRAINT "DocsConfigInstances_pkey" PRIMARY KEY ("docsConfigInstanceId")
);
