-- CreateTable
CREATE TABLE "overwritten_algolia_indexes" (
    "overwrittenTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "indexId" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "overwritten_algolia_indexes_indexId_key" ON "overwritten_algolia_indexes"("indexId");
