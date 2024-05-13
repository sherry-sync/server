/*
  Warnings:

  - The primary key for the `SherryPermission` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `sherryPermossionId` on the `SherryPermission` table. All the data in the column will be lost.
  - The required column `sherryPermissionId` was added to the `SherryPermission` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- CreateEnum
CREATE TYPE "SherryRole" AS ENUM ('OWNER', 'SHER');

-- AlterTable
ALTER TABLE "SherryPermission" DROP CONSTRAINT "SherryPermission_pkey",
DROP COLUMN "sherryPermossionId",
ADD COLUMN     "role" "SherryRole" NOT NULL DEFAULT 'SHER',
ADD COLUMN     "sherryPermissionId" UUID NOT NULL,
ADD CONSTRAINT "SherryPermission_pkey" PRIMARY KEY ("sherryPermissionId");
