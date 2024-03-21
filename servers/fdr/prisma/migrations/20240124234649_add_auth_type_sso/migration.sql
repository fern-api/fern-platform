-- CreateEnum
CREATE TYPE "AuthType" AS ENUM ('PUBLIC', 'WORKOS_SSO');

-- AlterTable
ALTER TABLE "DocsV2" ADD COLUMN     "authType" "AuthType" NOT NULL DEFAULT 'PUBLIC';
