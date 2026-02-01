import { NextRequest } from 'next/server';
import { requirePermission, handleApiError, successResponse } from '@/lib/auth-utils';
import { getStudyVisits } from '@/lib/services/visit.service';

interface Params {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    await requirePermission('STUDY_READ');

    const dispensationOnly = request.nextUrl.searchParams.get('dispensationOnly') === 'true';
    const visits = await getStudyVisits(id, dispensationOnly);

    return successResponse(visits);
  } catch (error) {
    return handleApiError(error);
  }
}
