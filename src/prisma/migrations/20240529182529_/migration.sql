-- DropForeignKey
ALTER TABLE "SherryPermission" DROP CONSTRAINT "SherryPermission_sherryId_fkey";

-- AddForeignKey
ALTER TABLE "SherryPermission" ADD CONSTRAINT "SherryPermission_sherryId_fkey" FOREIGN KEY ("sherryId") REFERENCES "Sherry"("sherryId") ON DELETE CASCADE ON UPDATE CASCADE;
