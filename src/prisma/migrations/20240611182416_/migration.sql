/*
  Warnings:

  - A unique constraint covering the columns `[path]` on the table `SherryFile` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `updatedAt` to the `SherryFile` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "SherryFile" ADD COLUMN     "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMPTZ NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "SherryFile_path_key" ON "SherryFile"("path");
