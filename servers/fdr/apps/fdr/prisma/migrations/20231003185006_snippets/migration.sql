-- CreateEnum
CREATE TYPE "HttpMethod" AS ENUM ('PUT', 'POST', 'GET', 'PATCH', 'DELETE');

-- CreateEnum
CREATE TYPE "Language" AS ENUM ('TYPESCRIPT', 'PYTHON', 'GO', 'JAVA');

-- CreateTable
CREATE TABLE "Snippet" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "apiName" TEXT NOT NULL,
    "endpointPath" TEXT NOT NULL,
    "endpointMethod" "HttpMethod" NOT NULL,
    "sdkId" TEXT NOT NULL,
    "snippet" BYTEA NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Snippet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Sdk" (
    "id" TEXT NOT NULL,
    "language" "Language" NOT NULL,
    "sdk" BYTEA NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Sdk_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Snippet" ADD CONSTRAINT "Snippet_sdkId_fkey" FOREIGN KEY ("sdkId") REFERENCES "Sdk"("id") ON DELETE CASCADE ON UPDATE CASCADE;
