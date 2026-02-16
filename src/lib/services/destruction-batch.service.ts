import { prisma } from '@/lib/prisma';
import { CreateDestructionBatchData } from '@/lib/validators/destruction-batch';

export type EligibleItemSource = 'EXPIRED' | 'RETURNED_PATIENT';

export interface EligibleItem {
  id: string;
  batchNumber: string;
  kitNumber: string | null;
  currentQuantity: number;
  expiryDate: Date | null;
  status: string;
  source: EligibleItemSource;
  medication: {
    id: string;
    code: string;
    name: string;
    countingUnit: string;
  };
  returnPatientId?: string;
  returnVisitNumber?: string;
}

export interface EligibleItemFilters {
  medicationId?: string;
  batchNumber?: string;
}

export async function getEligibleItemsForDestruction(
  studyId: string,
  filters?: EligibleItemFilters
): Promise<EligibleItem[]> {
  const medicationWhere = filters?.medicationId
    ? { medicationId: filters.medicationId }
    : {};
  const batchWhere = filters?.batchNumber
    ? { batchNumber: { contains: filters.batchNumber, mode: 'insensitive' as const } }
    : {};

  const commonWhere = {
    studyId,
    currentQuantity: { gt: 0 },
    status: { notIn: ['DESTROYED' as const, 'RETURNED_TO_SPONSOR' as const] },
    medicationId: { not: null },
    ...medicationWhere,
    ...batchWhere,
  };

  // Query 1: Expired items (status EXPIRED or expiryDate < now)
  const expiredItems = await prisma.stockItem.findMany({
    where: {
      ...commonWhere,
      OR: [
        { status: 'EXPIRED' },
        { expiryDate: { lt: new Date() } },
      ],
    },
    include: {
      medication: { select: { id: true, code: true, name: true, countingUnit: true } },
    },
  });

  // Query 2: Items with RETOUR movements (returned from patient)
  const returnedItems = await prisma.stockItem.findMany({
    where: {
      ...commonWhere,
      movements: {
        some: { type: 'RETOUR' },
      },
    },
    include: {
      medication: { select: { id: true, code: true, name: true, countingUnit: true } },
      movements: {
        where: { type: 'RETOUR' },
        orderBy: { movementDate: 'desc' },
        take: 1,
        select: { patientId: true, visitNumber: true },
      },
    },
  });

  // Merge and dedup
  const itemMap = new Map<string, EligibleItem>();

  for (const item of expiredItems) {
    if (!item.medication) continue;
    itemMap.set(item.id, {
      id: item.id,
      batchNumber: item.batchNumber,
      kitNumber: item.kitNumber,
      currentQuantity: item.currentQuantity,
      expiryDate: item.expiryDate,
      status: item.status,
      source: 'EXPIRED',
      medication: item.medication,
    });
  }

  for (const item of returnedItems) {
    if (!item.medication) continue;
    // If already present as expired, keep expired source (takes priority)
    if (itemMap.has(item.id)) continue;
    const lastReturn = item.movements[0];
    itemMap.set(item.id, {
      id: item.id,
      batchNumber: item.batchNumber,
      kitNumber: item.kitNumber,
      currentQuantity: item.currentQuantity,
      expiryDate: item.expiryDate,
      status: item.status,
      source: 'RETURNED_PATIENT',
      medication: item.medication,
      returnPatientId: lastReturn?.patientId ?? undefined,
      returnVisitNumber: lastReturn?.visitNumber ?? undefined,
    });
  }

  return Array.from(itemMap.values());
}

export async function createDestructionBatch(
  data: CreateDestructionBatchData,
  performedById: string
) {
  return prisma.$transaction(async (tx) => {
    // Generate batch number
    const count = await tx.destructionBatch.count({
      where: { studyId: data.studyId },
    });
    const batchNumber = `DEST-${String(count + 1).padStart(3, '0')}`;

    // Create the batch
    const batch = await tx.destructionBatch.create({
      data: {
        studyId: data.studyId,
        batchNumber,
        destructionMethod: data.destructionMethod,
        destructionDate: data.destructionDate ?? null,
        destructionLocation: data.destructionLocation ?? null,
        witnessName: data.witnessName ?? null,
        witnessFn: data.witnessFn ?? null,
        status: 'DRAFT',
      },
    });

    // Process each item
    for (const item of data.items) {
      const stockItem = await tx.stockItem.findUnique({
        where: { id: item.stockItemId },
      });

      if (!stockItem) {
        throw new Error(`Lot non trouve: ${item.stockItemId}`);
      }

      if (stockItem.currentQuantity < item.quantity) {
        throw new Error(
          `Quantite insuffisante pour le lot ${stockItem.batchNumber}. Disponible: ${stockItem.currentQuantity}`
        );
      }

      // Decrement stock
      const newQuantity = stockItem.currentQuantity - item.quantity;
      await tx.stockItem.update({
        where: { id: stockItem.id },
        data: {
          currentQuantity: newQuantity,
          status: newQuantity === 0 ? 'DESTROYED' : stockItem.status,
        },
      });

      // Create destruction movement
      await tx.movement.create({
        data: {
          studyId: data.studyId,
          medicationId: item.medicationId,
          stockItemId: item.stockItemId,
          type: 'DESTRUCTION',
          quantity: item.quantity,
          movementDate: data.destructionDate ?? new Date(),
          destructionMethod: data.destructionMethod,
          destructionBatchId: batch.id,
          destructionWitnessName: data.witnessName ?? null,
          notes: data.notes ?? null,
          performedById,
        },
      });
    }

    return batch;
  });
}
