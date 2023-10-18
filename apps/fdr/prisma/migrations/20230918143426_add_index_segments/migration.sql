-- AlterTable
ALTER TABLE "DocsV2" ADD COLUMN     "indexSegmentIds" JSONB;

-- CreateTable
CREATE TABLE "index_segments" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "version" TEXT,

    CONSTRAINT "index_segments_pkey" PRIMARY KEY ("id")
);
