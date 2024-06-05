-- DropForeignKey
ALTER TABLE "FileName" DROP CONSTRAINT "FileName_sherryId_fkey";

-- DropForeignKey
ALTER TABLE "FileType" DROP CONSTRAINT "FileType_sherryId_fkey";

-- AddForeignKey
ALTER TABLE "FileType" ADD CONSTRAINT "FileType_sherryId_fkey" FOREIGN KEY ("sherryId") REFERENCES "Sherry"("sherryId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FileName" ADD CONSTRAINT "FileName_sherryId_fkey" FOREIGN KEY ("sherryId") REFERENCES "Sherry"("sherryId") ON DELETE CASCADE ON UPDATE CASCADE;
