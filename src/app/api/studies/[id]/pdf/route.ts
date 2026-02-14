import { NextRequest, NextResponse } from 'next/server';
import { requirePermission, handleApiError } from '@/lib/auth-utils';
import { getStudyById } from '@/lib/services/study.service';
import { generateStudyPdf } from '@/lib/pdf/study-pdf';

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

    const pdfBuffer = generateStudyPdf(study as Parameters<typeof generateStudyPdf>[0]);
    const filename = `protocole_${study.codeInternal.replace(/[^a-zA-Z0-9-_]/g, '_')}.pdf`;

    return new NextResponse(new Uint8Array(pdfBuffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
