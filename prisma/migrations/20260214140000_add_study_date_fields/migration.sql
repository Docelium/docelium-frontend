-- AlterTable: Add 5 date fields to studies (Bloc A)
ALTER TABLE "studies" ADD COLUMN "setup_date" TIMESTAMP(3);
ALTER TABLE "studies" ADD COLUMN "site_center_closure_date" TIMESTAMP(3);
ALTER TABLE "studies" ADD COLUMN "recruitment_start_date" TIMESTAMP(3);
ALTER TABLE "studies" ADD COLUMN "recruitment_suspension_date" TIMESTAMP(3);
ALTER TABLE "studies" ADD COLUMN "recruitment_end_date" TIMESTAMP(3);
