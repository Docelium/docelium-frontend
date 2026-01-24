import { prisma } from '@/lib/prisma';
import { MovementType, StockItemStatus } from '@prisma/client';
import {
  CreateReceptionData,
  CreateDispensationData,
  CreateReturnData,
  CreateDestructionData,
  CreateTransferData,
} from '@/lib/validators/movement';

export interface MovementFilters {
  studyId?: string;
  type?: MovementType;
  medicationId?: string;
  startDate?: Date;
  endDate?: Date;
  patientId?: string;
}

export async function getMovements(filters?: MovementFilters) {
  const where: Record<string, unknown> = {};

  if (filters?.studyId) where['studyId'] = filters.studyId;
  if (filters?.type) where['type'] = filters.type;
  if (filters?.medicationId) where['medicationId'] = filters.medicationId;
  if (filters?.patientId) where['patientId'] = filters.patientId;
  if (filters?.startDate || filters?.endDate) {
    where['movementDate'] = {
      ...(filters.startDate && { gte: filters.startDate }),
      ...(filters.endDate && { lte: filters.endDate }),
    };
  }

  return prisma.movement.findMany({
    where,
    include: {
      study: { select: { id: true, codeInternal: true, title: true } },
      medication: { select: { id: true, code: true, name: true } },
      stockItem: { select: { id: true, batchNumber: true } },
      performedBy: { select: { id: true, firstName: true, lastName: true } },
    },
    orderBy: { movementDate: 'desc' },
  });
}

export async function getMovementById(id: string) {
  return prisma.movement.findUnique({
    where: { id },
    include: {
      study: true,
      medication: true,
      equipment: true,
      stockItem: true,
      performedBy: { select: { id: true, firstName: true, lastName: true, email: true } },
      destructionBatch: true,
      period: true,
    },
  });
}

// RECEPTION
export async function createReception(data: CreateReceptionData, performedById: string) {
  const { batchNumber, expiryDate, manufacturingDate, storageLocation, ...movementData } = data;

  return prisma.$transaction(async (tx) => {
    // Create or find stock item
    let stockItem = await tx.stockItem.findFirst({
      where: {
        studyId: data.studyId,
        medicationId: data.medicationId ?? undefined,
        equipmentId: data.equipmentId ?? undefined,
        batchNumber,
      },
    });

    if (stockItem) {
      // Update existing stock item
      stockItem = await tx.stockItem.update({
        where: { id: stockItem.id },
        data: {
          currentQuantity: stockItem.currentQuantity + data.quantity,
          initialQuantity: stockItem.initialQuantity + data.quantity,
        },
      });
    } else {
      // Create new stock item
      stockItem = await tx.stockItem.create({
        data: {
          studyId: data.studyId,
          medicationId: data.medicationId ?? null,
          equipmentId: data.equipmentId ?? null,
          batchNumber,
          initialQuantity: data.quantity,
          currentQuantity: data.quantity,
          expiryDate,
          manufacturingDate,
          receptionDate: data.movementDate,
          storageLocation,
          status: 'AVAILABLE',
        },
      });
    }

    // Create movement
    const movement = await tx.movement.create({
      data: {
        ...movementData,
        stockItemId: stockItem.id,
        performedById,
      },
    });

    return movement;
  });
}

// DISPENSATION
export async function createDispensation(data: CreateDispensationData, performedById: string) {
  return prisma.$transaction(async (tx) => {
    // Verify stock item has enough quantity
    const stockItem = await tx.stockItem.findUnique({
      where: { id: data.stockItemId! },
    });

    if (!stockItem) {
      throw new Error('Lot non trouve');
    }

    if (stockItem.status !== 'AVAILABLE') {
      throw new Error('Ce lot n\'est pas disponible pour dispensation');
    }

    if (stockItem.currentQuantity < data.quantity) {
      throw new Error(`Quantite insuffisante. Disponible: ${stockItem.currentQuantity}`);
    }

    // Update stock
    await tx.stockItem.update({
      where: { id: stockItem.id },
      data: {
        currentQuantity: stockItem.currentQuantity - data.quantity,
      },
    });

    // Create movement
    const movement = await tx.movement.create({
      data: {
        ...data,
        performedById,
      },
    });

    return movement;
  });
}

// RETURN
export async function createReturn(data: CreateReturnData, performedById: string) {
  return prisma.$transaction(async (tx) => {
    // Verify stock item exists
    const stockItem = await tx.stockItem.findUnique({
      where: { id: data.stockItemId! },
    });

    if (!stockItem) {
      throw new Error('Lot non trouve');
    }

    // Determine new stock status based on destination
    let newStatus: StockItemStatus = 'AVAILABLE';
    let quantityToAdd = data.quantity;

    switch (data.returnDestination) {
      case 'STOCK':
        newStatus = 'AVAILABLE';
        break;
      case 'QUARANTINE':
        newStatus = 'QUARANTINE';
        break;
      case 'DESTRUCTION':
        // Don't add back to stock
        quantityToAdd = 0;
        break;
      case 'SPONSOR_RETURN':
        newStatus = 'RETURNED_TO_SPONSOR';
        quantityToAdd = 0;
        break;
    }

    // Update stock if needed
    if (quantityToAdd > 0) {
      await tx.stockItem.update({
        where: { id: stockItem.id },
        data: {
          currentQuantity: stockItem.currentQuantity + quantityToAdd,
          status: newStatus,
        },
      });
    }

    // Create movement
    const movement = await tx.movement.create({
      data: {
        ...data,
        performedById,
      },
    });

    return movement;
  });
}

// DESTRUCTION
export async function createDestruction(data: CreateDestructionData, performedById: string) {
  return prisma.$transaction(async (tx) => {
    // Verify stock item
    const stockItem = await tx.stockItem.findUnique({
      where: { id: data.stockItemId! },
    });

    if (!stockItem) {
      throw new Error('Lot non trouve');
    }

    if (stockItem.currentQuantity < data.quantity) {
      throw new Error(`Quantite insuffisante. Disponible: ${stockItem.currentQuantity}`);
    }

    // Update stock
    const newQuantity = stockItem.currentQuantity - data.quantity;
    await tx.stockItem.update({
      where: { id: stockItem.id },
      data: {
        currentQuantity: newQuantity,
        status: newQuantity === 0 ? 'DESTROYED' : stockItem.status,
      },
    });

    // Create movement
    const movement = await tx.movement.create({
      data: {
        ...data,
        performedById,
      },
    });

    return movement;
  });
}

// TRANSFER
export async function createTransfer(data: CreateTransferData, performedById: string) {
  return prisma.$transaction(async (tx) => {
    // Verify stock item
    const stockItem = await tx.stockItem.findUnique({
      where: { id: data.stockItemId! },
    });

    if (!stockItem) {
      throw new Error('Lot non trouve');
    }

    if (stockItem.currentQuantity < data.quantity) {
      throw new Error(`Quantite insuffisante. Disponible: ${stockItem.currentQuantity}`);
    }

    // Update stock location
    await tx.stockItem.update({
      where: { id: stockItem.id },
      data: {
        storageLocation: data.transferToLocation,
      },
    });

    // Create movement
    const movement = await tx.movement.create({
      data: {
        ...data,
        performedById,
      },
    });

    return movement;
  });
}
