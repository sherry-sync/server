/*
  Warnings:

  - Added the required column `userId` to the `Sherry` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Sherry" ADD COLUMN     "userId" UUID NOT NULL;

-- AddForeignKey
ALTER TABLE "Sherry" ADD CONSTRAINT "Sherry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;
