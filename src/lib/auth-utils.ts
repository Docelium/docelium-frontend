import { getServerSession } from 'next-auth';
import { authOptions, checkPermission, PermissionKey } from './auth';
import { NextResponse } from 'next/server';
import { UserRole, Prisma } from '@prisma/client';

export async function getSession() {
  return await getServerSession(authOptions);
}

export async function requireAuth() {
  const session = await getSession();
  if (!session?.user) {
    throw new Error('Unauthorized');
  }
  return session.user;
}

export async function requireRole(allowedRoles: UserRole[]) {
  const user = await requireAuth();
  if (!allowedRoles.includes(user.role)) {
    throw new Error('Forbidden');
  }
  return user;
}

export async function requirePermission(permission: PermissionKey) {
  const user = await requireAuth();
  if (!checkPermission(user.role, permission)) {
    throw new Error('Forbidden');
  }
  return user;
}

const uniqueFieldLabels: Record<string, string> = {
  code_internal: 'code interne',
  email: 'adresse email',
  batch_number: 'numero de lot',
};

export function handleApiError(error: unknown): NextResponse {
  console.error('API Error:', error);

  // Prisma unique constraint violation
  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
    const fields = (error.meta?.target as string[]) || [];
    const fieldLabel = fields.map((f) => uniqueFieldLabels[f] || f).join(', ');
    return NextResponse.json(
      { error: `Un enregistrement avec ce ${fieldLabel} existe deja.` },
      { status: 409 },
    );
  }

  if (error instanceof Error) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }
    if (error.message === 'Forbidden') {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }
    if (error.message === 'Not found') {
      return NextResponse.json({ error: 'Ressource non trouvée' }, { status: 404 });
    }
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
}

export function successResponse<T>(data: T, status = 200): NextResponse {
  return NextResponse.json({ data }, { status });
}
