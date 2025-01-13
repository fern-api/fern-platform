-- AlterTable
ALTER TABLE "ApiDefinitionsLatest" ADD COLUMN     "s3Key" TEXT,
ALTER COLUMN "definition" DROP NOT NULL;
