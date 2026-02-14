import { NextRequest } from 'next/server';
import { z } from 'zod';
import { requirePermission, handleApiError, successResponse } from '@/lib/auth-utils';
import { duplicateStudy } from '@/lib/services/study.service';

const duplicateBodySchema = z.object({
  codeInternal: z
    .string()
    .min(1, 'Le code interne est requis')
    .max(50, 'Le code ne peut pas depasser 50 caracteres'),
});

interface Params {
  params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const user = await requirePermission('STUDY_CREATE');
    const body = await request.json();
    const { codeInternal } = duplicateBodySchema.parse(body);

    const study = await duplicateStudy(id, codeInternal, user.id, user.role);
    return successResponse(study, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
