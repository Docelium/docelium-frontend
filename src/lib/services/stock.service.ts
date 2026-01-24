import { prisma } from '@/lib/prisma';
import { StockItemStatus } from '@prisma/client';

export interface StockFilters {
  studyId?: string;
  medicationId?: string;
  status?: StockItemStatus;
  batchNumber?: string;
  expiringBefore?: Date;
}

export async function getStock(filters?: StockFilters) {
  const where: Record<string, unknown> = {};

  if (filters?.studyId) where['studyId'] = filters.studyId;
  if (filters?.medicationId) where['medicationId'] = filters.medicationId;
  if (filters?.status) where['status'] = filters.status;
  if (filters?.batchNumber) {
    where['batchNumber'] = { contains: filters.batchNumber, mode: 'insensitive' };
  }
  if (filters?.expiringBefore) {
    where['expiryDate'] = { lte: filters.expiringBefore };
  }

  return prisma.stockItem.findMany({
    where,
    include: {
      study: { select: { id: true, codeInternal: true, title: true } },
      medication: { select: { id: true, code: true, name: true, type: true, storageCondition: true } },
      equipment: { select: { id: true, code: true, name: true } },
    },
    orderBy: [
      { expiryDate: 'asc' },
      { batchNumber: 'asc' },
    ],
  });
}

export async function getStockById(id: string) {
  return prisma.stockItem.findUnique({
    where: { id },
    include: {
      study: true,
      medication: true,
      equipment: true,
      movements: {
        orderBy: { movementDate: 'desc' },
        take: 20,
        include: {
          performedBy: { select: { firstName: true, lastName: true } },
        },
      },
    },
  });
}

export async function getStockByStudy(studyId: string) {
  return prisma.stockItem.findMany({
    where: {
      studyId,
      currentQuantity: { gt: 0 },
    },
    include: {
      medication: { select: { id: true, code: true, name: true, type: true } },
      equipment: { select: { id: true, code: true, name: true } },
    },
    orderBy: [
      { medication: { code: 'asc' } },
      { batchNumber: 'asc' },
    ],
  });
}

export async function getStockSummaryByStudy(studyId: string) {
  const stockItems = await prisma.stockItem.findMany({
    where: { studyId },
    include: {
      medication: { select: { id: true, code: true, name: true, type: true } },
    },
  });

  // Group by medication
  const summary = stockItems.reduce((acc, item) => {
    const key = item.medicationId || 'equipment';
    if (!acc[key]) {
      acc[key] = {
        medicationId: item.medicationId,
        medicationCode: item.medication?.code,
        medicationName: item.medication?.name,
        medicationType: item.medication?.type,
        totalInitial: 0,
        totalCurrent: 0,
        batches: 0,
        availableBatches: 0,
      };
    }
    acc[key].totalInitial += item.initialQuantity;
    acc[key].totalCurrent += item.currentQuantity;
    acc[key].batches += 1;
    if (item.status === 'AVAILABLE' && item.currentQuantity > 0) {
      acc[key].availableBatches += 1;
    }
    return acc;
  }, {} as Record<string, {
    medicationId: string | null;
    medicationCode?: string;
    medicationName?: string;
    medicationType?: string;
    totalInitial: number;
    totalCurrent: number;
    batches: number;
    availableBatches: number;
  }>);

  return Object.values(summary);
}

export async function quarantineStock(id: string, reason: string) {
  const stockItem = await prisma.stockItem.findUnique({ where: { id } });

  if (!stockItem) {
    throw new Error('Lot non trouve');
  }

  if (stockItem.status !== 'AVAILABLE') {
    throw new Error('Seuls les lots disponibles peuvent etre mis en quarantaine');
  }

  return prisma.stockItem.update({
    where: { id },
    data: {
      status: 'QUARANTINE',
      quarantineReason: reason,
    },
  });
}

export async function releaseFromQuarantine(id: string) {
  const stockItem = await prisma.stockItem.findUnique({ where: { id } });

  if (!stockItem) {
    throw new Error('Lot non trouve');
  }

  if (stockItem.status !== 'QUARANTINE') {
    throw new Error('Ce lot n\'est pas en quarantaine');
  }

  return prisma.stockItem.update({
    where: { id },
    data: {
      status: 'AVAILABLE',
      quarantineReason: null,
    },
  });
}

export async function getExpiringStock(daysAhead: number = 30) {
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + daysAhead);

  return prisma.stockItem.findMany({
    where: {
      status: 'AVAILABLE',
      currentQuantity: { gt: 0 },
      expiryDate: {
        lte: futureDate,
        gte: new Date(),
      },
    },
    include: {
      study: { select: { id: true, codeInternal: true, title: true } },
      medication: { select: { id: true, code: true, name: true } },
    },
    orderBy: { expiryDate: 'asc' },
  });
}
