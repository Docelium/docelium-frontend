-- BTS-39: Add arm field to movements (for dispensation - links to study arms from Bloc D)

ALTER TABLE "movements" ADD COLUMN "arm" TEXT;
