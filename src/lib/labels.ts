import { StudyStatus, StudyPhase, DestructionPolicy, BlindingType, ReturnPolicy, TemperatureGovernance, DoseType } from '@prisma/client';

export const statusLabels: Record<StudyStatus, string> = {
  DRAFT: 'Brouillon',
  ACTIVE: 'Actif',
  TEMPORARILY_SUSPENDED: 'Suspendu temporairement',
  CLOSED_TO_ENROLLMENT: 'Ferme aux inclusions',
  CLOSED_TO_TREATMENT: 'Ferme aux traitements',
  TERMINATED: 'Termine',
  ARCHIVED: 'Archive',
};

export const phaseLabels: Record<StudyPhase, string> = {
  I: 'Phase I',
  Ia: 'Phase Ia',
  Ib: 'Phase Ib',
  I_II: 'Phase I/II',
  II: 'Phase II',
  IIa: 'Phase IIa',
  IIb: 'Phase IIb',
  III: 'Phase III',
  IIIa: 'Phase IIIa',
  IIIb: 'Phase IIIb',
  IIIc: 'Phase IIIc',
  IV: 'Phase IV',
  OTHER: 'Autre',
};

export const destructionPolicyLabels: Record<DestructionPolicy, string> = {
  LOCAL: 'Destruction locale',
  SPONSOR: 'Retour promoteur',
  MIXED: 'Mixte',
};

export const blindingLabels: Record<BlindingType, string> = {
  NONE: 'Ouvert',
  SINGLE: 'Simple aveugle',
  DOUBLE: 'Double aveugle',
  TRIPLE: 'Triple aveugle',
};

export const returnPolicyLabels: Record<ReturnPolicy, string> = {
  LOCAL_STOCK: 'Stock local',
  SPONSOR_RETURN: 'Retour promoteur',
};

export const temperatureGovernanceLabels: Record<TemperatureGovernance, string> = {
  BASIC: 'Basique',
  FULL: 'Complet',
};

export const doseTypeLabels: Record<DoseType, string> = {
  FIXED: 'Dose fixe',
  PER_KG: 'Par kg',
  PER_M2: 'Par m\u00b2',
};

export const contactRoleLabels: Record<string, string> = {
  PI: 'Investigateur principal',
  SC: 'Coordinateur etude',
  CRA: 'ARC',
  PM: 'Chef de projet',
  PHARMA: 'Pharmacien',
};
