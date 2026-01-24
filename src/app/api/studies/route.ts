import { NextRequest, NextResponse } from 'next/server';
import { requirePermission, handleApiError, successResponse } from '@/lib/auth-utils';
import { getStudies, createStudy } from '@/lib/services/study.service';
import { createStudySchema } from '@/lib/validators/study';
import { StudyStatus } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    const user = await requirePermission('STUDY_READ');
    const searchParams = request.nextUrl.searchParams;

    const filters = {
      status: searchParams.get('status') as StudyStatus | undefined,
      phase: searchParams.get('phase') || undefined,
      search: searchParams.get('search') || undefined,
    };

    const studies = await getStudies(user.id, user.role, filters);
    return successResponse(studies);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requirePermission('STUDY_CREATE');
    const body = await request.json();

    console.log('[API] Creating study with user:', { id: user.id, email: user.email, role: user.role });

    const validatedData = createStudySchema.parse(body);
    // Pass the creator's user ID to auto-assign them to the study
    const study = await createStudy({
      ...validatedData,
      createdById: user.id,
    });

    return successResponse(study, 201);
  } catch (error) {
    console.error('[API] Error creating study:', error);
    return handleApiError(error);
  }
}
