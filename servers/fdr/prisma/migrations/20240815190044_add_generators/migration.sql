-- CreateTable
CREATE TABLE "Generator" (
    "id" TEXT NOT NULL,
    "generatorType" JSONB NOT NULL,
    "dockerImage" TEXT NOT NULL,
    "generatorLanguage" "Language",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Generator_pkey" PRIMARY KEY ("id")
);
