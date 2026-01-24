import { NextRequest } from 'next/server';
import { requirePermission, handleApiError, successResponse } from '@/lib/auth-utils';
import { getMedicationById, updateMedication, deactivateMedication } from '@/lib/services/medication.service';
import { updateMedicationSchema } from '@/lib/validators/medication';

interface Params {
  params: Promise<{ id: string; medId: string }>;
}

export async function GET(request: NextRequest, { params }: Params) {
  try {
    const { medId } = await params;
    await requirePermission('MEDICATION_READ');

    const medication = await getMedicationById(medId);
    if (!medication) {
      throw new Error('Not found');
    }

    return successResponse(medication);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const { medId } = await params;
    await requirePermission('MEDICATION_UPDATE');
    const body = await request.json();

    const validatedData = updateMedicationSchema.parse(body);
    const medication = await updateMedication(medId, validatedData);

    return successResponse(medication);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const { medId } = await params;
    await requirePermission('MEDICATION_DEACTIVATE');

    await deactivateMedication(medId);
    return successResponse({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
