-- AlterTable: Add Safety & Compliance (Bloc D) fields to medications
ALTER TABLE "medications" ADD COLUMN "hazardCategories" TEXT[] DEFAULT '{}';
ALTER TABLE "medications" ADD COLUMN "wasteCategory" TEXT;
ALTER TABLE "medications" ADD COLUMN "complianceRequired" BOOLEAN DEFAULT false NOT NULL;
ALTER TABLE "medications" ADD COLUMN "complianceMethod" TEXT;
