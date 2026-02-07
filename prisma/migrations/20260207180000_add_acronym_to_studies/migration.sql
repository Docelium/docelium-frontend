-- BTS-27: Add acronym field to studies (Bloc A - Identification)

ALTER TABLE "studies" ADD COLUMN "acronym" TEXT NOT NULL DEFAULT '';
