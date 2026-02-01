import { NextRequest } from 'next/server';
import { requirePermission, handleApiError, successResponse } from '@/lib/auth-utils';
import { getAllMedications, createMedication } from '@/lib/services/medication.service';
import { createMedicationSchema } from '@/lib/validators/medication';
import { createAuditEvent } from '@/lib/services/audit.service';
import { MedicationType } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    await requirePermission('MEDICATION_READ');
    const searchParams = request.nextUrl.searchParams;

    const filters = {
      studyId: searchParams.get('studyId') || undefined,
      type: searchParams.get('type') as MedicationType | undefined,
      search: searchParams.get('search') || undefined,
    };

    const medications = await getAllMedications(filters);
    return successResponse(medications);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requirePermission('MEDICATION_CREATE');
    const body = await request.json();

    const validatedData = createMedicationSchema.parse(body);
    const medication = await createMedication(validatedData);

    await createAuditEvent({
      userId: user.id,
      userRole: user.role,
      action: 'CREATE_MEDICATION',
      entityType: 'MEDICATION',
      entityId: medication.id,
      studyId: medication.studyId,
      detailsAfter: { code: medication.code, name: medication.name, type: medication.type },
    }).catch(() => {});

    return successResponse(medication, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
