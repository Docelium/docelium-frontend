import { prisma } from '@/lib/prisma';

interface VisitScheduleItem {
  visit_code: string;
  day: number;
  requires_dispense: boolean;
  arm?: string | null;
}

interface TreatmentCycles {
  cycle_length?: number | null;
  max_cycles?: number | null;
}

export interface GeneratedVisit {
  code: string;
  cycle: number;
  day: number;
  absoluteDay: number;
  requiresDispense: boolean;
  arm: string | null;
}

/**
 * Generate the full visit calendar from Bloc G data (visitSchedule + treatmentCycles).
 *
 * Logic:
 * - If treatmentCycles has cycle_length and max_cycles, replicate the visit
 *   template for each cycle, offsetting the day numbers.
 * - Visit codes are prefixed with the cycle number: C{n}{visit_code}
 *   e.g. visit_code "D1" in cycle 2 → "C2D1"
 * - If visit_code already starts with "C{digit}", we strip the cycle prefix
 *   before re-prefixing so we don't double up (C1D1 → D1 → C2D1).
 * - If no treatmentCycles or max_cycles is missing, return the visits as-is
 *   (single cycle).
 */
export function generateVisitCalendar(
  visitSchedule: VisitScheduleItem[] | null | undefined,
  treatmentCycles: TreatmentCycles | null | undefined,
): GeneratedVisit[] {
  if (!visitSchedule || visitSchedule.length === 0) {
    return [];
  }

  const cycleLength = treatmentCycles?.cycle_length;
  const maxCycles = treatmentCycles?.max_cycles;

  // No cycle info → return the raw visits as a single cycle
  if (!cycleLength || !maxCycles || maxCycles <= 0) {
    return visitSchedule.map((v) => ({
      code: v.visit_code,
      cycle: 1,
      day: v.day,
      absoluteDay: v.day,
      requiresDispense: v.requires_dispense,
      arm: v.arm ?? null,
    }));
  }

  const visits: GeneratedVisit[] = [];

  for (let cycle = 1; cycle <= maxCycles; cycle++) {
    const dayOffset = (cycle - 1) * cycleLength;

    for (const v of visitSchedule) {
      // Strip existing cycle prefix (e.g. "C1D1" → "D1") to avoid "C2C1D1"
      const baseCode = v.visit_code.replace(/^C\d+/, '');
      const code = `C${cycle}${baseCode}`;

      visits.push({
        code,
        cycle,
        day: v.day,
        absoluteDay: v.day + dayOffset,
        requiresDispense: v.requires_dispense,
        arm: v.arm ?? null,
      });
    }
  }

  return visits;
}

/**
 * Get the generated visit calendar for a study, optionally filtered to only
 * visits that require dispensation.
 */
export async function getStudyVisits(
  studyId: string,
  dispensationOnly = false,
): Promise<GeneratedVisit[]> {
  const study = await prisma.study.findUnique({
    where: { id: studyId },
    select: { visitSchedule: true, treatmentCycles: true },
  });

  if (!study) {
    throw new Error('Protocole non trouve');
  }

  const visits = generateVisitCalendar(
    study.visitSchedule as VisitScheduleItem[] | null,
    study.treatmentCycles as TreatmentCycles | null,
  );

  if (dispensationOnly) {
    return visits.filter((v) => v.requiresDispense);
  }

  return visits;
}
