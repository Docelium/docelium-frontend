-- CreateEnum AdministrationRoute
CREATE TYPE "AdministrationRoute" AS ENUM ('IV', 'PO', 'SC', 'IM', 'TOPICAL', 'INHALED', 'RECTAL', 'TRANSDERMAL', 'OPHTHALMIC', 'OTHER');

-- CreateEnum MedicationStatus
CREATE TYPE "MedicationStatus" AS ENUM ('DRAFT', 'ACTIVE', 'WITHDRAWN');

-- AlterTable: add new columns
ALTER TABLE "medications" ADD COLUMN "isPediatric" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "medications" ADD COLUMN "administrationRoute" "AdministrationRoute";
ALTER TABLE "medications" ADD COLUMN "status" "MedicationStatus" NOT NULL DEFAULT 'DRAFT';

-- Migrate data: map isActive to status
UPDATE "medications" SET "status" = 'ACTIVE' WHERE "isActive" = true;
UPDATE "medications" SET "status" = 'WITHDRAWN' WHERE "isActive" = false;

-- Drop old column
ALTER TABLE "medications" DROP COLUMN "isActive";
