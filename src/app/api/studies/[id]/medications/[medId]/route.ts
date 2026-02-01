import { NextRequest } from 'next/server';
import { requirePermission, handleApiError, successResponse } from '@/lib/auth-utils';
import { getMedicationById, updateMedication, deactivateMedication } from '@/lib/services/medication.service';
import { updateMedicationSchema } from '@/lib/validators/medication';
import { createAuditEvent } from '@/lib/services/audit.service';

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
    const user = await requirePermission('MEDICATION_UPDATE');
    const body = await request.json();

    const existing = await getMedicationById(medId);
    if (!existing) {
      throw new Error('Not found');
    }

    const validatedData = updateMedicationSchema.parse(body);
    const medication = await updateMedication(medId, validatedData);

    // Compute changed fields
    const changedFields: string[] = [];
    for (const key of Object.keys(validatedData) as (keyof typeof validatedData)[]) {
      if (validatedData[key] !== undefined && validatedData[key] !== (existing as Record<string, unknown>)[key]) {
        changedFields.push(key);
      }
    }

    await createAuditEvent({
      userId: user.id,
      userRole: user.role,
      action: 'UPDATE_MEDICATION',
      entityType: 'MEDICATION',
      entityId: medId,
      studyId: existing.studyId,
      detailsBefore: { code: existing.code, name: existing.name },
      detailsAfter: { code: medication.code, name: medication.name, changedFields },
    }).catch(() => {});

    return successResponse(medication);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const { medId } = await params;
    const user = await requirePermission('MEDICATION_DEACTIVATE');

    const existing = await getMedicationById(medId);
    if (!existing) {
      throw new Error('Not found');
    }

    await deactivateMedication(medId);

    await createAuditEvent({
      userId: user.id,
      userRole: user.role,
      action: 'DEACTIVATE_MEDICATION',
      entityType: 'MEDICATION',
      entityId: medId,
      studyId: existing.studyId,
      detailsAfter: { code: existing.code, name: existing.name },
    }).catch(() => {});

    return successResponse({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
