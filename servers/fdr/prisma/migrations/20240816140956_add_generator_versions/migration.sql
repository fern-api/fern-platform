-- CreateEnum
CREATE TYPE "ReleaseType" AS ENUM ('ga', 'rc');

-- CreateTable
CREATE TABLE "GeneratorRelease" (
    "version" TEXT NOT NULL,
    "major" INTEGER NOT NULL,
    "minor" INTEGER NOT NULL,
    "patch" INTEGER NOT NULL,
    "generatorId" TEXT NOT NULL,
    "isYanked" BYTEA,
    "changelogEntry" BYTEA,
    "migration" BYTEA,
    "irVersion" TEXT NOT NULL,
    "customConfigSchema" TEXT,
    "releaseType" "ReleaseType" NOT NULL,
    "isLatest" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GeneratorRelease_pkey" PRIMARY KEY ("generatorId","version")
);

-- AddForeignKey
ALTER TABLE "GeneratorRelease" ADD CONSTRAINT "GeneratorRelease_generatorId_fkey" FOREIGN KEY ("generatorId") REFERENCES "Generator"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
