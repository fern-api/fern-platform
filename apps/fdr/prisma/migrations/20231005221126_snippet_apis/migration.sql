-- CreateTable
CREATE TABLE "SnippetApi" (
    "orgId" TEXT NOT NULL,
    "apiName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SnippetApi_pkey" PRIMARY KEY ("orgId","apiName")
);
