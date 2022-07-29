-- CreateTable
CREATE TABLE "Api" (
    "apiId" TEXT NOT NULL,
    "orgName" TEXT NOT NULL,
    "clock" INTEGER NOT NULL,

    CONSTRAINT "Api_pkey" PRIMARY KEY ("apiId","orgName")
);

-- CreateTable
CREATE TABLE "ApiVersions" (
    "apiId" TEXT NOT NULL,
    "orgName" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "apiDefinitionS3Url" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "state" TEXT NOT NULL,
    "versionInfo" BYTEA NOT NULL,

    CONSTRAINT "ApiVersions_pkey" PRIMARY KEY ("apiId","orgName","version")
);

-- CreateIndex
CREATE UNIQUE INDEX "ApiVersions_apiDefinitionS3Url_key" ON "ApiVersions"("apiDefinitionS3Url");
