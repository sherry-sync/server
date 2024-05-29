/*
  Warnings:

  - A unique constraint covering the columns `[userId,name]` on the table `Sherry` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Sherry_sherryId_name_key";

-- CreateIndex
CREATE UNIQUE INDEX "Sherry_userId_name_key" ON "Sherry"("userId", "name");
