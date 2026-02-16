import { NextRequest } from 'next/server';
import { requirePermission, handleApiError, successResponse } from '@/lib/auth-utils';
import { createDestructionBatch } from '@/lib/services/destruction-batch.service';
import { createDestructionBatchSchema } from '@/lib/validators/destruction-batch';
import { createAuditEvent } from '@/lib/services/audit.service';

export async function POST(request: NextRequest) {
  try {
    const user = await requirePermission('DESTRUCTION_BATCH_CREATE');
    const body = await request.json();
    const data = createDestructionBatchSchema.parse(body);

    const batch = await createDestructionBatch(data, user.id);

    await createAuditEvent({
      userId: user.id,
      userRole: user.role,
      action: 'CREATE_DESTRUCTION_BATCH',
      entityType: 'DESTRUCTION_BATCH',
      entityId: batch.id,
      studyId: data.studyId,
      batchId: batch.id,
      detailsAfter: {
        batchNumber: batch.batchNumber,
        destructionMethod: data.destructionMethod,
        itemCount: data.items.length,
      },
    }).catch(() => {});

    return successResponse(batch, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
