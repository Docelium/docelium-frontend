-- AlterTable: Add Preparation & Reconstitution (Bloc C) fields to medications
ALTER TABLE "medications" ADD COLUMN "requiresPreparation" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "medications" ADD COLUMN "preparationInstructions" TEXT;
ALTER TABLE "medications" ADD COLUMN "requiresReconstitution" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "medications" ADD COLUMN "reconstitutionInstructions" TEXT;
ALTER TABLE "medications" ADD COLUMN "stabilityAfterPreparation" TEXT;
ALTER TABLE "medications" ADD COLUMN "dilutionType" TEXT;
ALTER TABLE "medications" ADD COLUMN "dilutionVolume" TEXT;
ALTER TABLE "medications" ADD COLUMN "dilutionFinalConcentration" TEXT;
ALTER TABLE "medications" ADD COLUMN "dilutionSolution" TEXT;
ALTER TABLE "medications" ADD COLUMN "requiredEquipments" TEXT;
