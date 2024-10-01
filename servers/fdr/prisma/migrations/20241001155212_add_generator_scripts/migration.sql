-- AlterTable
ALTER TABLE "Generator" ADD COLUMN     "compileScript" BYTEA,
ADD COLUMN     "installScript" BYTEA,
ADD COLUMN     "preInstallScript" BYTEA,
ADD COLUMN     "testScript" BYTEA;
