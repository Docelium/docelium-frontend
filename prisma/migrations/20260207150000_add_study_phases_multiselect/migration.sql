-- BTS-25: Update StudyPhase enum and convert phase to phases (multi-select)

-- Add new enum values
ALTER TYPE "StudyPhase" ADD VALUE IF NOT EXISTS 'Ia';
ALTER TYPE "StudyPhase" ADD VALUE IF NOT EXISTS 'Ib';
ALTER TYPE "StudyPhase" ADD VALUE IF NOT EXISTS 'IIa';
ALTER TYPE "StudyPhase" ADD VALUE IF NOT EXISTS 'IIb';
ALTER TYPE "StudyPhase" ADD VALUE IF NOT EXISTS 'IIIa';
ALTER TYPE "StudyPhase" ADD VALUE IF NOT EXISTS 'IIIb';
ALTER TYPE "StudyPhase" ADD VALUE IF NOT EXISTS 'IIIc';

-- Add new phases column (array)
ALTER TABLE "studies" ADD COLUMN "phases" "StudyPhase"[];

-- Migrate existing data: convert single phase to array
UPDATE "studies" SET "phases" = ARRAY["phase"];

-- Drop old phase column
ALTER TABLE "studies" DROP COLUMN "phase";
