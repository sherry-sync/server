/*
  Warnings:

  - A unique constraint covering the columns `[sherryId,name]` on the table `Sherry` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "FileName" DROP CONSTRAINT "FileName_sherryId_fkey";

-- DropForeignKey
ALTER TABLE "FileType" DROP CONSTRAINT "FileType_sherryId_fkey";

-- CreateIndex
CREATE UNIQUE INDEX "Sherry_sherryId_name_key" ON "Sherry"("sherryId", "name");

-- AddForeignKey
ALTER TABLE "FileType" ADD CONSTRAINT "FileType_sherryId_fkey" FOREIGN KEY ("sherryId") REFERENCES "Sherry"("sherryId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FileName" ADD CONSTRAINT "FileName_sherryId_fkey" FOREIGN KEY ("sherryId") REFERENCES "Sherry"("sherryId") ON DELETE CASCADE ON UPDATE CASCADE;
