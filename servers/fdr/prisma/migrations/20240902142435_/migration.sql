/*
  Warnings:

  - A unique constraint covering the columns `[dockerImage]` on the table `Generator` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Generator_dockerImage_key" ON "Generator"("dockerImage");
