import { prisma } from '@/lib/prisma';
import { StudyStatus, UserRole, Prisma } from '@prisma/client';
import { getAccessibleStudyIds } from '@/lib/auth';
import { createAuditEvent } from '@/lib/services/audit.service';

export interface StudyFilters {
  status?: StudyStatus;
  phase?: string;
  search?: string;
}

export async function getStudies(userId: string, role: UserRole, filters?: StudyFilters) {
  const accessibleStudyIds = await getAccessibleStudyIds(userId, role);

  const where: Record<string, unknown> = {
    isActive: true,
    ...(role !== 'ADMIN' && { id: { in: accessibleStudyIds } }),
  };

  if (filters?.status) {
    where['protocolStatus'] = filters.status;
  }
  if (filters?.phase) {
    where['phase'] = filters.phase;
  }
  if (filters?.search) {
    where['OR'] = [
      { codeInternal: { contains: filters.search, mode: 'insensitive' } },
      { title: { contains: filters.search, mode: 'insensitive' } },
      { sponsor: { contains: filters.search, mode: 'insensitive' } },
    ];
  }

  return prisma.study.findMany({
    where,
    include: {
      _count: {
        select: {
          medications: true,
          movements: true,
          stockItems: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getStudyById(id: string, userId: string, role: UserRole) {
  const accessibleStudyIds = await getAccessibleStudyIds(userId, role);

  if (role !== 'ADMIN' && !accessibleStudyIds.includes(id)) {
    return null;
  }

  return prisma.study.findUnique({
    where: { id },
    include: {
      medications: {
        where: { isActive: true },
        orderBy: { code: 'asc' },
      },
      equipments: {
        where: { isActive: true },
        orderBy: { code: 'asc' },
      },
      userAssignments: {
        include: {
          user: {
            select: {
              id: true,
              email: true,
              phone: true,
              firstName: true,
              lastName: true,
              role: true,
            },
          },
        },
      },
      _count: {
        select: {
          medications: true,
          movements: true,
          stockItems: true,
          accountingPeriods: true,
        },
      },
    },
  });
}

export interface CreateStudyInput {
  // Bloc A - Identification
  codeInternal: string;
  euCtNumber?: string | null;
  nctNumber?: string | null;
  title: string;
  sponsor: string;
  phase: string;
  therapeuticArea?: string | null;
  siteActivationDate?: Date | null;
  expectedRecruitment?: number | null;
  complexityLevel?: string;

  // Bloc B - Contacts
  contacts?: Array<{
    role: 'PI' | 'SC' | 'CRA' | 'PM';
    name: string;
    email: string;
    phone?: string;
  }> | null;

  // Bloc C - Regulatory
  protocolVersion?: string | null;
  protocolVersionDate?: Date | null;
  amendments?: Array<{ version: string; date: string }> | null;
  euCtrApprovalReference?: Date | null;
  ethicsApprovalReference?: string | null;
  insuranceReference?: string | null;
  eudamedId?: string | null;

  // Bloc D - Parametres operationnels
  blinded?: string;
  arms?: string[] | null;
  cohorts?: string[] | null;
  destructionPolicy?: string;
  returnPolicy?: string;
  requiresPatientForDispensation?: boolean;
  allowsDispensationWithoutIwrs?: boolean;
  temperatureTrackingEnabled?: boolean;
  returnedMaterialReusable?: boolean;

  // Bloc E - Data Quality
  dataQualityProfile?: {
    requires_double_signature?: boolean;
    requires_pharmacist_signature?: boolean;
    requires_weight_recency_days?: number | null;
    comment_required_on_override?: boolean;
  } | null;

  // Bloc G - Visit Schedule
  visitSchedule?: Array<{
    visit_code: string;
    day: number;
    requires_dispense: boolean;
  }> | null;
  treatmentCycles?: {
    cycle_length?: number | null;
    max_cycles?: number | null;
  } | null;

  // Bloc H - Patient Constraints
  patientConstraints?: {
    min_age?: number | null;
    max_age?: number | null;
    min_weight?: number | null;
    requires_recent_weight_days?: number | null;
    weight_variation_threshold?: number | null;
    weight_reference?: 'BASELINE' | 'CURRENT';
  } | null;

  // Bloc I - Temperature
  temperatureGovernance?: string | null;
  excursionActionRequired?: boolean;
  excursionTimeThreshold?: string | null;

  // Bloc L - IWRS
  iwrsGovernance?: {
    iwrs_integration?: boolean;
    iwrs_integration_mode?: 'MANUAL' | 'CSV' | 'API';
    iwrs_allows_partial_data?: boolean;
    iwrs_requires_visit_code?: boolean;
    iwrs_endpoint?: string | null;
  } | null;

  // Bloc M - Equipment
  protocolRequiredEquipments?: string[];

  // Bloc N - Site Overrides
  siteOverrides?: {
    requires_local_quarantine_step?: boolean;
    requires_extra_reception_fields?: string[];
    local_procedure_references?: Array<{ name: string; reference: string }>;
  } | null;

  // Dates
  startDate?: Date | null;
  expectedEndDate?: Date | null;

  // Commentaires par bloc
  blockComments?: Record<string, string> | null;

  // Metadata
  createdById?: string | null;
}

export async function createStudy(data: CreateStudyInput) {
  // Use a transaction to create the study and auto-assign the creator
  return prisma.$transaction(async (tx) => {
    // Verify the creator exists before proceeding
    if (data.createdById) {
      const userExists = await tx.user.findUnique({
        where: { id: data.createdById },
        select: { id: true },
      });
      if (!userExists) {
        throw new Error('Utilisateur non trouve. Veuillez vous reconnecter.');
      }
    }

    const study = await tx.study.create({
      data: {
        // Bloc A
        codeInternal: data.codeInternal,
        euCtNumber: data.euCtNumber,
        nctNumber: data.nctNumber,
        title: data.title,
        sponsor: data.sponsor,
        phase: data.phase as never,
        therapeuticArea: data.therapeuticArea,
        siteActivationDate: data.siteActivationDate,
        expectedRecruitment: data.expectedRecruitment,
        complexityLevel: (data.complexityLevel || 'LOW') as never,
        protocolStatus: 'DRAFT',

        // Bloc B
        contacts: data.contacts ?? undefined,

        // Bloc C
        protocolVersion: data.protocolVersion,
        protocolVersionDate: data.protocolVersionDate,
        amendments: data.amendments ?? undefined,
        euCtrApprovalReference: data.euCtrApprovalReference,
        ethicsApprovalReference: data.ethicsApprovalReference,
        insuranceReference: data.insuranceReference,
        eudamedId: data.eudamedId,

        // Bloc D
        blinded: (data.blinded || 'NONE') as never,
        arms: data.arms ?? undefined,
        cohorts: data.cohorts ?? undefined,
        destructionPolicy: (data.destructionPolicy || 'LOCAL') as never,
        returnPolicy: (data.returnPolicy || 'LOCAL_STOCK') as never,
        requiresPatientForDispensation: data.requiresPatientForDispensation ?? true,
        allowsDispensationWithoutIwrs: data.allowsDispensationWithoutIwrs ?? false,
        temperatureTrackingEnabled: data.temperatureTrackingEnabled ?? false,
        returnedMaterialReusable: data.returnedMaterialReusable ?? false,

        // Bloc E
        dataQualityProfile: data.dataQualityProfile ?? undefined,

        // Bloc G
        visitSchedule: data.visitSchedule ?? undefined,
        treatmentCycles: data.treatmentCycles ?? undefined,

        // Bloc H
        patientConstraints: data.patientConstraints ?? undefined,

        // Bloc I
        temperatureGovernance: data.temperatureGovernance as never,
        excursionActionRequired: data.excursionActionRequired ?? false,
        excursionTimeThreshold: data.excursionTimeThreshold,

        // Bloc L
        iwrsGovernance: data.iwrsGovernance ?? undefined,

        // Bloc M
        protocolRequiredEquipments: data.protocolRequiredEquipments || [],

        // Bloc N
        siteOverrides: data.siteOverrides ?? undefined,

        // Dates
        startDate: data.startDate,
        expectedEndDate: data.expectedEndDate,

        // Commentaires
        blockComments: data.blockComments ?? undefined,

        // Metadata
        createdById: data.createdById,
      },
    });

    // Auto-assign the creator to the study (if createdById is provided and verified above)
    if (data.createdById) {
      await tx.studyUserAssignment.create({
        data: {
          studyId: study.id,
          userId: data.createdById,
        },
      });
    }

    // Audit trail
    if (data.createdById) {
      await createAuditEvent({
        userId: data.createdById,
        userRole: 'PHARMACIEN',
        action: 'CREATE_STUDY',
        entityType: 'STUDY',
        entityId: study.id,
        studyId: study.id,
        detailsAfter: { codeInternal: study.codeInternal, title: study.title, phase: study.phase },
      }).catch(() => {}); // Don't fail study creation if audit fails
    }

    return study;
  });
}

// Helper to handle JSON null values for Prisma
function jsonValue(val: unknown) {
  return val === null ? Prisma.DbNull : val;
}

export async function updateStudy(id: string, data: Partial<CreateStudyInput>, userId?: string, userRole?: UserRole) {
  const existing = await prisma.study.findUnique({ where: { id } });
  if (!existing) {
    throw new Error('Not found');
  }

  const study = await prisma.study.update({
    where: { id },
    data: {
      // Only update fields that are provided
      ...(data.codeInternal !== undefined && { codeInternal: data.codeInternal }),
      ...(data.euCtNumber !== undefined && { euCtNumber: data.euCtNumber }),
      ...(data.nctNumber !== undefined && { nctNumber: data.nctNumber }),
      ...(data.title !== undefined && { title: data.title }),
      ...(data.sponsor !== undefined && { sponsor: data.sponsor }),
      ...(data.phase !== undefined && { phase: data.phase as never }),
      ...(data.therapeuticArea !== undefined && { therapeuticArea: data.therapeuticArea }),
      ...(data.siteActivationDate !== undefined && { siteActivationDate: data.siteActivationDate }),
      ...(data.expectedRecruitment !== undefined && { expectedRecruitment: data.expectedRecruitment }),
      ...(data.complexityLevel !== undefined && { complexityLevel: data.complexityLevel as never }),
      ...(data.contacts !== undefined && { contacts: jsonValue(data.contacts) }),
      ...(data.protocolVersion !== undefined && { protocolVersion: data.protocolVersion }),
      ...(data.protocolVersionDate !== undefined && { protocolVersionDate: data.protocolVersionDate }),
      ...(data.amendments !== undefined && { amendments: jsonValue(data.amendments) }),
      ...(data.euCtrApprovalReference !== undefined && { euCtrApprovalReference: data.euCtrApprovalReference }),
      ...(data.ethicsApprovalReference !== undefined && { ethicsApprovalReference: data.ethicsApprovalReference }),
      ...(data.insuranceReference !== undefined && { insuranceReference: data.insuranceReference }),
      ...(data.eudamedId !== undefined && { eudamedId: data.eudamedId }),
      ...(data.blinded !== undefined && { blinded: data.blinded as never }),
      ...(data.arms !== undefined && { arms: jsonValue(data.arms) }),
      ...(data.cohorts !== undefined && { cohorts: jsonValue(data.cohorts) }),
      ...(data.destructionPolicy !== undefined && { destructionPolicy: data.destructionPolicy as never }),
      ...(data.returnPolicy !== undefined && { returnPolicy: data.returnPolicy as never }),
      ...(data.requiresPatientForDispensation !== undefined && { requiresPatientForDispensation: data.requiresPatientForDispensation }),
      ...(data.allowsDispensationWithoutIwrs !== undefined && { allowsDispensationWithoutIwrs: data.allowsDispensationWithoutIwrs }),
      ...(data.temperatureTrackingEnabled !== undefined && { temperatureTrackingEnabled: data.temperatureTrackingEnabled }),
      ...(data.returnedMaterialReusable !== undefined && { returnedMaterialReusable: data.returnedMaterialReusable }),
      ...(data.dataQualityProfile !== undefined && { dataQualityProfile: jsonValue(data.dataQualityProfile) }),
      ...(data.visitSchedule !== undefined && { visitSchedule: jsonValue(data.visitSchedule) }),
      ...(data.treatmentCycles !== undefined && { treatmentCycles: jsonValue(data.treatmentCycles) }),
      ...(data.patientConstraints !== undefined && { patientConstraints: jsonValue(data.patientConstraints) }),
      ...(data.temperatureGovernance !== undefined && { temperatureGovernance: data.temperatureGovernance as never }),
      ...(data.excursionActionRequired !== undefined && { excursionActionRequired: data.excursionActionRequired }),
      ...(data.excursionTimeThreshold !== undefined && { excursionTimeThreshold: data.excursionTimeThreshold }),
      ...(data.iwrsGovernance !== undefined && { iwrsGovernance: jsonValue(data.iwrsGovernance) }),
      ...(data.protocolRequiredEquipments !== undefined && { protocolRequiredEquipments: data.protocolRequiredEquipments }),
      ...(data.siteOverrides !== undefined && { siteOverrides: jsonValue(data.siteOverrides) }),
      ...(data.startDate !== undefined && { startDate: data.startDate }),
      ...(data.expectedEndDate !== undefined && { expectedEndDate: data.expectedEndDate }),
      ...(data.blockComments !== undefined && { blockComments: jsonValue(data.blockComments) }),
    },
  });

  // Audit trail — compare DB snapshots before and after update
  if (userId) {
    // Re-fetch the updated record so both snapshots have identical Prisma formatting
    const updated = await prisma.study.findUnique({ where: { id } });

    const trackableFields = [
      'codeInternal', 'euCtNumber', 'nctNumber', 'title', 'sponsor', 'phase',
      'therapeuticArea', 'siteActivationDate', 'expectedRecruitment', 'complexityLevel',
      'contacts', 'protocolVersion', 'protocolVersionDate', 'amendments',
      'euCtrApprovalReference', 'ethicsApprovalReference', 'insuranceReference', 'eudamedId',
      'blinded', 'arms', 'cohorts', 'destructionPolicy', 'returnPolicy',
      'requiresPatientForDispensation', 'allowsDispensationWithoutIwrs',
      'temperatureTrackingEnabled', 'returnedMaterialReusable',
      'dataQualityProfile', 'visitSchedule', 'treatmentCycles', 'patientConstraints',
      'temperatureGovernance', 'excursionActionRequired', 'excursionTimeThreshold',
      'iwrsGovernance', 'protocolRequiredEquipments', 'siteOverrides',
      'startDate', 'expectedEndDate', 'blockComments',
    ] as const;

    const changedFields: string[] = [];
    if (updated) {
      for (const key of trackableFields) {
        if (data[key as keyof typeof data] === undefined) continue;
        const oldVal = existing[key as keyof typeof existing];
        const newVal = updated[key as keyof typeof updated];
        if (JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
          changedFields.push(key);
        }
      }
    }

    if (changedFields.length > 0) {
      await createAuditEvent({
        userId,
        userRole: userRole || 'PHARMACIEN',
        action: 'UPDATE_STUDY',
        entityType: 'STUDY',
        entityId: id,
        studyId: id,
        detailsBefore: { codeInternal: existing.codeInternal, title: existing.title },
        detailsAfter: { changedFields, codeInternal: study.codeInternal, title: study.title },
      }).catch(() => {});
    }
  }

  return study;
}

export async function updateStudyStatus(id: string, status: StudyStatus, userId?: string, userRole?: UserRole) {
  const study = await prisma.study.findUnique({ where: { id } });
  if (!study) {
    throw new Error('Not found');
  }

  // Validate status transitions
  const validTransitions: Record<StudyStatus, StudyStatus[]> = {
    DRAFT: ['ACTIVE'],
    ACTIVE: ['TEMPORARILY_SUSPENDED', 'CLOSED_TO_ENROLLMENT', 'TERMINATED'],
    TEMPORARILY_SUSPENDED: ['ACTIVE', 'TERMINATED'],
    CLOSED_TO_ENROLLMENT: ['CLOSED_TO_TREATMENT', 'TERMINATED'],
    CLOSED_TO_TREATMENT: ['TERMINATED', 'ARCHIVED'],
    TERMINATED: ['ARCHIVED'],
    ARCHIVED: [],
  };

  if (!validTransitions[study.protocolStatus].includes(status)) {
    throw new Error(`Transition de ${study.protocolStatus} vers ${status} non autorisee`);
  }

  const updateData: Record<string, unknown> = { protocolStatus: status };

  // Set dates based on status
  if (status === 'ACTIVE' && !study.startDate) {
    updateData['startDate'] = new Date();
  }
  if (status === 'TERMINATED' || status === 'ARCHIVED') {
    updateData['actualEndDate'] = new Date();
  }

  const updated = await prisma.study.update({
    where: { id },
    data: updateData,
  });

  // Audit trail
  if (userId) {
    const statusActionMap: Record<string, string> = {
      ACTIVE: 'ACTIVATE_STUDY',
      TEMPORARILY_SUSPENDED: 'SUSPEND_STUDY',
      CLOSED_TO_ENROLLMENT: 'CLOSE_STUDY',
      CLOSED_TO_TREATMENT: 'CLOSE_STUDY',
      TERMINATED: 'CLOSE_STUDY',
      ARCHIVED: 'ARCHIVE_STUDY',
    };
    const action = statusActionMap[status] || 'UPDATE_STUDY';

    await createAuditEvent({
      userId,
      userRole: userRole || 'PHARMACIEN',
      action: action as never,
      entityType: 'STUDY',
      entityId: id,
      studyId: id,
      detailsBefore: { status: study.protocolStatus },
      detailsAfter: { status },
    }).catch(() => {});
  }

  return updated;
}

export async function deleteStudy(id: string) {
  const study = await prisma.study.findUnique({
    where: { id },
    include: { _count: { select: { movements: true } } },
  });

  if (!study) {
    throw new Error('Not found');
  }

  // Can only delete DRAFT studies with no movements
  if (study.protocolStatus !== 'DRAFT') {
    throw new Error('Seuls les protocoles en brouillon peuvent etre supprimes');
  }

  if (study._count.movements > 0) {
    throw new Error('Impossible de supprimer un protocole avec des mouvements');
  }

  // Soft delete
  return prisma.study.update({
    where: { id },
    data: { isActive: false },
  });
}

export async function assignUserToStudy(studyId: string, userId: string) {
  return prisma.studyUserAssignment.create({
    data: { studyId, userId },
  });
}

export async function removeUserFromStudy(studyId: string, userId: string) {
  return prisma.studyUserAssignment.delete({
    where: {
      studyId_userId: { studyId, userId },
    },
  });
}
