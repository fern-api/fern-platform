-- CreateEnum
CREATE TYPE "PullRequestState" AS ENUM ('open', 'closed', 'merged');

-- CreateEnum
CREATE TYPE "RepositorySystemType" AS ENUM ('github');

-- CreateEnum
CREATE TYPE "RepositoryContentType" AS ENUM ('sdk', 'config');

-- CreateTable
CREATE TABLE "PullRequest" (
    "pullRequestNumber" INTEGER NOT NULL,
    "repositoryOwner" TEXT NOT NULL,
    "repositoryName" TEXT NOT NULL,
    "author" BYTEA NOT NULL,
    "reviewers" BYTEA NOT NULL,
    "checks" BYTEA NOT NULL,
    "title" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "state" "PullRequestState" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3),
    "mergedAt" TIMESTAMP(3),
    "closedAt" TIMESTAMP(3),

    CONSTRAINT "PullRequest_pkey" PRIMARY KEY ("pullRequestNumber","repositoryOwner","repositoryName")
);

-- CreateTable
CREATE TABLE "Repository" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "owner" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "repositoryOwnerOrganizationId" TEXT NOT NULL,
    "defaultBranchChecks" BYTEA NOT NULL,
    "contentType" "RepositoryContentType" NOT NULL,
    "systemType" "RepositorySystemType" NOT NULL,
    "rawRepository" BYTEA NOT NULL,

    CONSTRAINT "Repository_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Repository_fullName_key" ON "Repository"("fullName");

-- CreateIndex
CREATE UNIQUE INDEX "Repository_owner_name_key" ON "Repository"("owner", "name");

-- AddForeignKey
ALTER TABLE "PullRequest" ADD CONSTRAINT "PullRequest_repositoryOwner_repositoryName_fkey" FOREIGN KEY ("repositoryOwner", "repositoryName") REFERENCES "Repository"("owner", "name") ON DELETE CASCADE ON UPDATE CASCADE;
