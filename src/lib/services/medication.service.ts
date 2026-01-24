import { prisma } from '@/lib/prisma';
import { CreateMedicationData, UpdateMedicationData } from '@/lib/validators/medication';

export interface MedicationFilters {
  studyId?: string;
  type?: 'IMP' | 'NIMP';
  search?: string;
}

export async function getAllMedications(filters?: MedicationFilters) {
  const where: Record<string, unknown> = {
    isActive: true,
  };

  if (filters?.studyId) {
    where['studyId'] = filters.studyId;
  }
  if (filters?.type) {
    where['type'] = filters.type;
  }
  if (filters?.search) {
    where['OR'] = [
      { code: { contains: filters.search, mode: 'insensitive' } },
      { name: { contains: filters.search, mode: 'insensitive' } },
    ];
  }

  return prisma.medication.findMany({
    where,
    include: {
      study: {
        select: {
          id: true,
          codeInternal: true,
          title: true,
          protocolStatus: true,
        },
      },
      _count: {
        select: {
          stockItems: true,
          movements: true,
        },
      },
    },
    orderBy: [{ study: { codeInternal: 'asc' } }, { code: 'asc' }],
  });
}

export async function getMedicationsByStudy(studyId: string) {
  return prisma.medication.findMany({
    where: {
      studyId,
      isActive: true,
    },
    include: {
      _count: {
        select: {
          stockItems: true,
          movements: true,
        },
      },
    },
    orderBy: { code: 'asc' },
  });
}

export async function getMedicationById(id: string) {
  return prisma.medication.findUnique({
    where: { id },
    include: {
      study: {
        select: {
          id: true,
          codeInternal: true,
          title: true,
          protocolStatus: true,
        },
      },
      equipmentLinks: {
        include: {
          equipment: true,
        },
      },
      _count: {
        select: {
          stockItems: true,
          movements: true,
        },
      },
    },
  });
}

export async function createMedication(data: CreateMedicationData) {
  // Verify study exists and is not archived
  const study = await prisma.study.findUnique({
    where: { id: data.studyId },
  });

  if (!study) {
    throw new Error('Protocole non trouve');
  }

  if (study.protocolStatus === 'ARCHIVED' || study.protocolStatus === 'TERMINATED') {
    throw new Error('Impossible d\'ajouter un medicament a un protocole clos ou archive');
  }

  // Check for duplicate code within study
  const existing = await prisma.medication.findUnique({
    where: {
      studyId_code: {
        studyId: data.studyId,
        code: data.code,
      },
    },
  });

  if (existing) {
    throw new Error('Un medicament avec ce code existe deja pour ce protocole');
  }

  return prisma.medication.create({
    data,
  });
}

export async function updateMedication(id: string, data: UpdateMedicationData) {
  const medication = await prisma.medication.findUnique({
    where: { id },
    include: { study: true },
  });

  if (!medication) {
    throw new Error('Medicament non trouve');
  }

  if (medication.study.protocolStatus === 'ARCHIVED' || medication.study.protocolStatus === 'TERMINATED') {
    throw new Error('Impossible de modifier un medicament d\'un protocole clos ou archive');
  }

  // Check for duplicate code if code is being changed
  if (data.code && data.code !== medication.code) {
    const existing = await prisma.medication.findUnique({
      where: {
        studyId_code: {
          studyId: medication.studyId,
          code: data.code,
        },
      },
    });

    if (existing) {
      throw new Error('Un medicament avec ce code existe deja pour ce protocole');
    }
  }

  return prisma.medication.update({
    where: { id },
    data,
  });
}

export async function deactivateMedication(id: string) {
  const medication = await prisma.medication.findUnique({
    where: { id },
    include: {
      study: true,
      _count: {
        select: { stockItems: { where: { status: 'AVAILABLE' } } },
      },
    },
  });

  if (!medication) {
    throw new Error('Medicament non trouve');
  }

  if (medication.study.protocolStatus === 'ACTIVE' && medication._count.stockItems > 0) {
    throw new Error('Impossible de desactiver un medicament avec du stock disponible dans un protocole actif');
  }

  return prisma.medication.update({
    where: { id },
    data: { isActive: false },
  });
}

export async function linkEquipment(medicationId: string, equipmentId: string, isRequired = false) {
  return prisma.medicationEquipmentLink.create({
    data: {
      medicationId,
      equipmentId,
      isRequired,
    },
  });
}

export async function unlinkEquipment(medicationId: string, equipmentId: string) {
  return prisma.medicationEquipmentLink.delete({
    where: {
      medicationId_equipmentId: {
        medicationId,
        equipmentId,
      },
    },
  });
}
