-- Bloc F: Regles Avancees & Tracabilite
ALTER TABLE "medications" ADD COLUMN "iwrsPerMovement" JSONB;
ALTER TABLE "medications" ADD COLUMN "isAtmp" BOOLEAN DEFAULT false NOT NULL;
ALTER TABLE "medications" ADD COLUMN "dosageEscalationScheme" TEXT;
ALTER TABLE "medications" ADD COLUMN "customLogFields" JSONB;
ALTER TABLE "medications" DROP COLUMN "iwrsRequired";
