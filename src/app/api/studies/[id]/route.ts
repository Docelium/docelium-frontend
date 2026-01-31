import { NextRequest } from 'next/server';
import { requirePermission, handleApiError, successResponse } from '@/lib/auth-utils';
import { getStudyById, updateStudy, updateStudyStatus, deleteStudy } from '@/lib/services/study.service';
import { updateStudySchema } from '@/lib/validators/study';
import { StudyStatus } from '@prisma/client';

interface Params {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const user = await requirePermission('STUDY_READ');

    const study = await getStudyById(id, user.id, user.role);
    if (!study) {
      throw new Error('Not found');
    }

    return successResponse(study);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const user = await requirePermission('STUDY_UPDATE');
    const body = await request.json();

    // Check if this is a status update
    if (body.status && Object.keys(body).length === 1) {
      const study = await updateStudyStatus(id, body.status as StudyStatus, user.id, user.role);
      return successResponse(study);
    }

    const validatedData = updateStudySchema.parse(body);
    const study = await updateStudy(id, validatedData, user.id, user.role);

    return successResponse(study);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    await requirePermission('STUDY_DELETE');

    await deleteStudy(id);
    return successResponse({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
