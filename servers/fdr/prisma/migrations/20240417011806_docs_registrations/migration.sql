-- CreateTable
CREATE TABLE "DocsRegistrations" (
    "registrationID" TEXT NOT NULL,
    "orgID" TEXT NOT NULL,
    "fernURL" TEXT NOT NULL,
    "customURLs" TEXT[],
    "isPreview" BOOLEAN NOT NULL,
    "authType" "AuthType" NOT NULL,
    "s3FileInfos" BYTEA NOT NULL,

    CONSTRAINT "DocsRegistrations_pkey" PRIMARY KEY ("registrationID")
);
