import { NextRequest } from 'next/server';
import { requirePermission, handleApiError, successResponse } from '@/lib/auth-utils';
import { getAuditEventsForStudy } from '@/lib/services/audit.service';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requirePermission('STUDY_READ');
    const { id } = await params;
    const events = await getAuditEventsForStudy(id);
    return successResponse(events);
  } catch (error) {
    return handleApiError(error);
  }
}
