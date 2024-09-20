-- AlterTable
ALTER TABLE "CliRelease" ADD COLUMN     "tags" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- AlterTable
ALTER TABLE "GeneratorRelease" ADD COLUMN     "tags" TEXT[] DEFAULT ARRAY[]::TEXT[];
