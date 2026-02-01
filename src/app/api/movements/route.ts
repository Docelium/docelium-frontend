import { NextRequest } from 'next/server';
import { requirePermission, handleApiError, successResponse } from '@/lib/auth-utils';
import {
  getMovements,
  createReception,
  createDispensation,
  createReturn,
  createDestruction,
  createTransfer,
} from '@/lib/services/movement.service';
import {
  createReceptionSchema,
  createDispensationSchema,
  createReturnSchema,
  createDestructionSchema,
  createTransferSchema,
} from '@/lib/validators/movement';
import { createAuditEvent } from '@/lib/services/audit.service';
import { AuditAction, MovementType } from '@prisma/client';

const movementTypeToAuditAction: Record<MovementType, AuditAction> = {
  RECEPTION: 'CREATE_MOVEMENT_RECEPTION',
  DISPENSATION: 'CREATE_MOVEMENT_DISPENSATION',
  RETOUR: 'CREATE_MOVEMENT_RETOUR',
  DESTRUCTION: 'CREATE_MOVEMENT_DESTRUCTION',
  TRANSFER: 'CREATE_MOVEMENT_TRANSFER',
};

export async function GET(request: NextRequest) {
  try {
    await requirePermission('MOVEMENT_READ');
    const searchParams = request.nextUrl.searchParams;

    const filters = {
      studyId: searchParams.get('studyId') || undefined,
      type: searchParams.get('type') as MovementType | undefined,
      medicationId: searchParams.get('medicationId') || undefined,
      patientId: searchParams.get('patientId') || undefined,
      startDate: searchParams.get('startDate') ? new Date(searchParams.get('startDate')!) : undefined,
      endDate: searchParams.get('endDate') ? new Date(searchParams.get('endDate')!) : undefined,
    };

    const movements = await getMovements(filters);
    return successResponse(movements);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requirePermission('MOVEMENT_CREATE');
    const body = await request.json();

    let movement;

    switch (body.type as MovementType) {
      case 'RECEPTION': {
        const data = createReceptionSchema.parse(body);
        movement = await createReception(data, user.id);
        break;
      }
      case 'DISPENSATION': {
        const data = createDispensationSchema.parse(body);
        movement = await createDispensation(data, user.id);
        break;
      }
      case 'RETOUR': {
        const data = createReturnSchema.parse(body);
        movement = await createReturn(data, user.id);
        break;
      }
      case 'DESTRUCTION': {
        const data = createDestructionSchema.parse(body);
        movement = await createDestruction(data, user.id);
        break;
      }
      case 'TRANSFER': {
        const data = createTransferSchema.parse(body);
        movement = await createTransfer(data, user.id);
        break;
      }
      default:
        throw new Error('Type de mouvement invalide');
    }

    const movementType = movement.type as MovementType;
    await createAuditEvent({
      userId: user.id,
      userRole: user.role,
      action: movementTypeToAuditAction[movementType],
      entityType: 'MOVEMENT',
      entityId: movement.id,
      studyId: movement.studyId,
      detailsAfter: {
        type: movement.type,
        quantity: movement.quantity,
        medicationId: movement.medicationId,
        stockItemId: movement.stockItemId,
      },
    }).catch(() => {});

    return successResponse(movement, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
