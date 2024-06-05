/*
  Warnings:

  - The values [SHER] on the enum `SherryRole` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "SherryRole_new" AS ENUM ('READ', 'WRITE', 'OWNER');
ALTER TABLE "SherryPermission" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "SherryPermission" ALTER COLUMN "role" TYPE "SherryRole_new" USING ("role"::text::"SherryRole_new");
ALTER TYPE "SherryRole" RENAME TO "SherryRole_old";
ALTER TYPE "SherryRole_new" RENAME TO "SherryRole";
DROP TYPE "SherryRole_old";
ALTER TABLE "SherryPermission" ALTER COLUMN "role" SET DEFAULT 'READ';
COMMIT;

-- AlterTable
ALTER TABLE "SherryPermission" ALTER COLUMN "role" SET DEFAULT 'READ';
