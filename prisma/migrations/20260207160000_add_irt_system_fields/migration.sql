-- BTS-42: Add IRT system fields to studies (replacing 4 legacy toggles in Bloc D)

ALTER TABLE "studies" ADD COLUMN "has_irt_system" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "studies" ADD COLUMN "irt_system_name" TEXT;
