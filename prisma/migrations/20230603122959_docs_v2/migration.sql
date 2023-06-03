-- CreateTable
CREATE TABLE "DocsV2" (
    "orgID" TEXT NOT NULL,
    "apiName" TEXT NOT NULL,
    "updatedTime" TIMESTAMP(3) NOT NULL,
    "domain" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "docsDefinition" BYTEA NOT NULL,

    CONSTRAINT "DocsV2_pkey" PRIMARY KEY ("domain","path")
);
