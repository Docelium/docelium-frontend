-- CreateEnum
CREATE TYPE "DoseType" AS ENUM ('FIXED', 'PER_KG', 'PER_M2');

-- AlterTable
ALTER TABLE "medications" ADD COLUMN "doseType" "DoseType";
ALTER TABLE "medications" ADD COLUMN "dosage" TEXT;
ALTER TABLE "medications" ADD COLUMN "packaging" TEXT;
ALTER TABLE "medications" ADD COLUMN "protocolRequiredDose" TEXT;
ALTER TABLE "medications" ADD COLUMN "doseRounding" TEXT;
ALTER TABLE "medications" ADD COLUMN "requiresAnthropometricData" BOOLEAN NOT NULL DEFAULT false;
