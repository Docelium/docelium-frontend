import { NextRequest } from 'next/server';
import { requirePermission, handleApiError, successResponse } from '@/lib/auth-utils';
import { getMedicationsByStudy, createMedication } from '@/lib/services/medication.service';
import { createMedicationSchema } from '@/lib/validators/medication';

interface Params {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: Params) {
  try {
    const { id: studyId } = await params;
    await requirePermission('MEDICATION_READ');

    const medications = await getMedicationsByStudy(studyId);
    return successResponse(medications);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest, { params }: Params) {
  try {
    const { id: studyId } = await params;
    await requirePermission('MEDICATION_CREATE');
    const body = await request.json();

    const validatedData = createMedicationSchema.parse({
      ...body,
      studyId,
    });

    const medication = await createMedication(validatedData);
    return successResponse(medication, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
