-- Replace ethics_approval_reference (String) with ethics_approval_date (DateTime)
-- and add ansm_approval_date (DateTime)
ALTER TABLE "studies" ADD COLUMN "ethics_approval_date" TIMESTAMP(3);
ALTER TABLE "studies" ADD COLUMN "ansm_approval_date" TIMESTAMP(3);
