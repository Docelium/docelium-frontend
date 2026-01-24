import { NextRequest } from 'next/server';
import { requirePermission, handleApiError, successResponse } from '@/lib/auth-utils';
import { getMovementById } from '@/lib/services/movement.service';

interface Params {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    await requirePermission('MOVEMENT_READ');

    const movement = await getMovementById(id);
    if (!movement) {
      throw new Error('Not found');
    }

    return successResponse(movement);
  } catch (error) {
    return handleApiError(error);
  }
}
