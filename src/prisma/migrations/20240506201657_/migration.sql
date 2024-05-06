/*
  Warnings:

  - Added the required column `type` to the `FileType` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "FileType" ADD COLUMN     "type" VARCHAR(255) NOT NULL;
