import { NextRequest } from 'next/server';
import { requirePermission, handleApiError, successResponse } from '@/lib/auth-utils';
import { getEligibleItemsForDestruction } from '@/lib/services/destruction-batch.service';

export async function GET(request: NextRequest) {
  try {
    await requirePermission('DESTRUCTION_BATCH_CREATE');
    const searchParams = request.nextUrl.searchParams;

    const studyId = searchParams.get('studyId');
    if (!studyId) {
      throw new Error('studyId est requis');
    }

    const filters = {
      medicationId: searchParams.get('medicationId') || undefined,
      batchNumber: searchParams.get('batchNumber') || undefined,
    };

    const items = await getEligibleItemsForDestruction(studyId, filters);
    return successResponse(items);
  } catch (error) {
    return handleApiError(error);
  }
}
