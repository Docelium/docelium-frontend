import { prisma } from '@/lib/prisma';
import { AuditAction, AuditEntityType, UserRole } from '@prisma/client';
import crypto from 'crypto';

interface CreateAuditEventInput {
  userId: string;
  userRole: UserRole;
  action: AuditAction;
  entityType: AuditEntityType;
  entityId: string;
  studyId?: string;
  periodId?: string;
  batchId?: string;
  detailsBefore?: Record<string, unknown> | null;
  detailsAfter?: Record<string, unknown> | null;
}

function computeHash(data: Record<string, unknown>, previousHash?: string | null): string {
  const payload = JSON.stringify({ ...data, previousHash: previousHash || '' });
  return crypto.createHash('sha256').update(payload).digest('hex');
}

export async function createAuditEvent(input: CreateAuditEventInput) {
  // Get the last audit event for chaining
  const lastEvent = await prisma.auditEvent.findFirst({
    orderBy: { timestamp: 'desc' },
    select: { hash: true },
  });

  const hash = computeHash(
    {
      userId: input.userId,
      action: input.action,
      entityType: input.entityType,
      entityId: input.entityId,
      timestamp: new Date().toISOString(),
    },
    lastEvent?.hash
  );

  return prisma.auditEvent.create({
    data: {
      userId: input.userId,
      userRoleSnapshot: input.userRole,
      action: input.action,
      entityType: input.entityType,
      entityId: input.entityId,
      studyId: input.studyId,
      periodId: input.periodId,
      batchId: input.batchId,
      detailsBefore: input.detailsBefore ? (input.detailsBefore as Record<string, string>) : undefined,
      detailsAfter: input.detailsAfter ? (input.detailsAfter as Record<string, string>) : undefined,
      hash,
      previousHash: lastEvent?.hash ?? null,
    },
  });
}

export async function getAuditEventsForStudy(studyId: string) {
  return prisma.auditEvent.findMany({
    where: {
      OR: [
        { studyId },
        { entityType: 'STUDY', entityId: studyId },
      ],
    },
    include: {
      user: {
        select: { id: true, firstName: true, lastName: true, role: true },
      },
    },
    orderBy: { timestamp: 'desc' },
    take: 100,
  });
}
