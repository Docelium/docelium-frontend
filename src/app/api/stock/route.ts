import { NextRequest } from 'next/server';
import { requirePermission, handleApiError, successResponse } from '@/lib/auth-utils';
import { getStock, quarantineStock, releaseFromQuarantine } from '@/lib/services/stock.service';
import { createAuditEvent } from '@/lib/services/audit.service';
import { StockItemStatus } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    await requirePermission('STOCK_READ');
    const searchParams = request.nextUrl.searchParams;

    const filters = {
      studyId: searchParams.get('studyId') || undefined,
      medicationId: searchParams.get('medicationId') || undefined,
      status: searchParams.get('status') as StockItemStatus | undefined,
      batchNumber: searchParams.get('batchNumber') || undefined,
      expiringBefore: searchParams.get('expiringBefore')
        ? new Date(searchParams.get('expiringBefore')!)
        : undefined,
    };

    const stock = await getStock(filters);
    return successResponse(stock);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, action, reason } = body;

    if (action === 'quarantine') {
      const user = await requirePermission('STOCK_QUARANTINE');
      const stockItem = await quarantineStock(id, reason);

      await createAuditEvent({
        userId: user.id,
        userRole: user.role,
        action: 'QUARANTINE_STOCK_ITEM',
        entityType: 'STOCK_ITEM',
        entityId: stockItem.id,
        studyId: stockItem.studyId,
        detailsAfter: { batchNumber: stockItem.batchNumber, reason, status: stockItem.status },
      }).catch(() => {});

      return successResponse(stockItem);
    } else if (action === 'release') {
      const user = await requirePermission('STOCK_QUARANTINE');
      const stockItem = await releaseFromQuarantine(id);

      await createAuditEvent({
        userId: user.id,
        userRole: user.role,
        action: 'RELEASE_STOCK_ITEM',
        entityType: 'STOCK_ITEM',
        entityId: stockItem.id,
        studyId: stockItem.studyId,
        detailsAfter: { batchNumber: stockItem.batchNumber, status: stockItem.status },
      }).catch(() => {});

      return successResponse(stockItem);
    }

    throw new Error('Action invalide');
  } catch (error) {
    return handleApiError(error);
  }
}
