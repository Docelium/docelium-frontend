import { NextRequest } from 'next/server';
import { requirePermission, handleApiError, successResponse } from '@/lib/auth-utils';
import { getAuditEventsForEntity } from '@/lib/services/audit.service';
import { AuditEntityType } from '@prisma/client';

const validEntityTypes: Set<string> = new Set<string>(
  Object.values(AuditEntityType) as string[]
);

export async function GET(request: NextRequest) {
  try {
    await requirePermission('STUDY_READ');
    const searchParams = request.nextUrl.searchParams;

    const entityType = searchParams.get('entityType');
    const entityId = searchParams.get('entityId');

    if (!entityType || !entityId) {
      throw new Error('entityType et entityId sont requis');
    }

    if (!validEntityTypes.has(entityType)) {
      throw new Error('entityType invalide');
    }

    const events = await getAuditEventsForEntity(
      entityType as AuditEntityType,
      entityId
    );
    return successResponse(events);
  } catch (error) {
    return handleApiError(error);
  }
}
