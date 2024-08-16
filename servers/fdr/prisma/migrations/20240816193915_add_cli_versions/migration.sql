-- CreateTable
CREATE TABLE "CliRelease" (
    "version" TEXT NOT NULL,
    "major" INTEGER NOT NULL,
    "minor" INTEGER NOT NULL,
    "patch" INTEGER NOT NULL,
    "nonce" TEXT NOT NULL,
    "irVersion" TEXT NOT NULL,
    "isYanked" BYTEA,
    "changelogEntry" BYTEA,
    "releaseType" "ReleaseType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CliRelease_pkey" PRIMARY KEY ("version")
);
