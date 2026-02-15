ALTER TABLE "medications" ADD COLUMN "temperatureMonitoringRequired" BOOLEAN DEFAULT false NOT NULL;
ALTER TABLE "medications" ADD COLUMN "stabilityAfterOpening" TEXT;
ALTER TABLE "medications" ADD COLUMN "excursionPolicy" TEXT;
