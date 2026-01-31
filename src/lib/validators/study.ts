import { z } from 'zod';

// Enum values selon la SPEC
const StudyPhaseValues = ['I', 'I_II', 'II', 'III', 'IV', 'OTHER'] as const;
const ComplexityLevelValues = ['LOW', 'MEDIUM', 'HIGH'] as const;
const BlindingTypeValues = ['NONE', 'SINGLE', 'DOUBLE', 'TRIPLE'] as const;
const DestructionPolicyValues = ['LOCAL', 'SPONSOR', 'MIXED'] as const;
const ReturnPolicyValues = ['LOCAL_STOCK', 'SPONSOR_RETURN'] as const;
const TemperatureGovernanceValues = ['BASIC', 'FULL'] as const;
const IwrsIntegrationModeValues = ['MANUAL', 'CSV', 'API'] as const;
const ContactRoleValues = ['PI', 'SC', 'CRA', 'PM'] as const;
const WeightReferenceValues = ['BASELINE', 'CURRENT'] as const;

// BLOC A - Identification du Protocole
export const blocASchema = z.object({
  codeInternal: z
    .string()
    .min(1, 'Le code interne est requis')
    .max(50, 'Le code ne peut pas depasser 50 caracteres'),
  euCtNumber: z.string().nullable().optional(),
  nctNumber: z.string().nullable().optional(),
  title: z
    .string()
    .min(1, 'Le titre est requis')
    .max(500, 'Le titre ne peut pas depasser 500 caracteres'),
  sponsor: z
    .string()
    .min(1, 'Le sponsor est requis')
    .max(255, 'Le nom du sponsor ne peut pas depasser 255 caracteres'),
  phase: z.enum(StudyPhaseValues, {
    message: 'La phase de l\'etude est requise',
  }),
  therapeuticArea: z.string().nullable().optional(),
  siteActivationDate: z.coerce.date().nullable().optional(),
  expectedRecruitment: z.number().int().positive().nullable().optional(),
  complexityLevel: z.enum(ComplexityLevelValues).default('LOW'),
});

// BLOC B - Organisation & Contacts
const contactSchema = z.object({
  role: z.enum(ContactRoleValues),
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
});

export const blocBSchema = z.object({
  contacts: z.array(contactSchema).nullable().optional(),
});

// BLOC C - Regulatory Identifiers
const amendmentSchema = z.object({
  version: z.string(),
  date: z.string(),
});

export const blocCSchema = z.object({
  protocolVersion: z.string().nullable().optional(),
  protocolVersionDate: z.coerce.date().nullable().optional(),
  amendments: z.array(amendmentSchema).nullable().optional(),
  euCtrApprovalReference: z.coerce.date().nullable().optional(),
  ethicsApprovalReference: z.string().nullable().optional(),
  insuranceReference: z.string().nullable().optional(),
  eudamedId: z.string().nullable().optional(),
});

// BLOC D - Parametres Operationnels
export const blocDSchema = z.object({
  blinded: z.enum(BlindingTypeValues).default('NONE'),
  arms: z.array(z.string()).nullable().optional(),
  cohorts: z.array(z.string()).nullable().optional(),
  destructionPolicy: z.enum(DestructionPolicyValues).default('LOCAL'),
  returnPolicy: z.enum(ReturnPolicyValues).default('LOCAL_STOCK'),
  requiresPatientForDispensation: z.boolean().default(true),
  allowsDispensationWithoutIwrs: z.boolean().default(false),
  temperatureTrackingEnabled: z.boolean().default(false),
  returnedMaterialReusable: z.boolean().default(false),
});

// BLOC E - Data Quality Profile
const dataQualityProfileSchema = z.object({
  requires_double_signature: z.boolean().default(false),
  requires_pharmacist_signature: z.boolean().default(true),
  requires_weight_recency_days: z.number().int().positive().nullable().optional(),
  comment_required_on_override: z.boolean().default(true),
});

export const blocESchema = z.object({
  dataQualityProfile: dataQualityProfileSchema.nullable().optional(),
});

// BLOC G - Visit Schedule / Treatment Schema
const visitScheduleItemSchema = z.object({
  visit_code: z.string(),
  day: z.number().int().positive(),
  requires_dispense: z.boolean(),
});

const treatmentCyclesSchema = z.object({
  cycle_length: z.number().int().positive().nullable().optional(),
  max_cycles: z.number().int().positive().nullable().optional(),
});

export const blocGSchema = z.object({
  visitSchedule: z.array(visitScheduleItemSchema).nullable().optional(),
  treatmentCycles: treatmentCyclesSchema.nullable().optional(),
});

// BLOC H - Patient Constraints
const patientConstraintsSchema = z.object({
  min_age: z.number().int().min(0).nullable().optional(),
  max_age: z.number().int().positive().nullable().optional(),
  min_weight: z.number().positive().nullable().optional(),
  requires_recent_weight_days: z.number().int().positive().nullable().optional(),
  weight_variation_threshold: z.number().positive().nullable().optional(),
  weight_reference: z.enum(WeightReferenceValues).default('CURRENT'),
});

export const blocHSchema = z.object({
  patientConstraints: patientConstraintsSchema.nullable().optional(),
});

// BLOC I - Temperature Governance
export const blocISchema = z.object({
  temperatureGovernance: z.enum(TemperatureGovernanceValues).nullable().optional(),
  excursionActionRequired: z.boolean().default(false),
  excursionTimeThreshold: z.string().nullable().optional(),
});

// BLOC L - IWRS Governance
const iwrsGovernanceSchema = z.object({
  iwrs_integration: z.boolean(),
  iwrs_integration_mode: z.enum(IwrsIntegrationModeValues),
  iwrs_allows_partial_data: z.boolean().default(false),
  iwrs_requires_visit_code: z.boolean().default(false),
  iwrs_endpoint: z.string().nullable().optional(),
});

export const blocLSchema = z.object({
  iwrsGovernance: iwrsGovernanceSchema.nullable().optional(),
});

// BLOC M - Equipment Requirements
export const blocMSchema = z.object({
  protocolRequiredEquipments: z.array(z.string()).default([]),
});

// BLOC N - Site Overrides
const localProcedureSchema = z.object({
  name: z.string(),
  reference: z.string(),
});

const siteOverridesSchema = z.object({
  requires_local_quarantine_step: z.boolean().default(false),
  requires_extra_reception_fields: z.array(z.string()).default([]),
  local_procedure_references: z.array(localProcedureSchema).default([]),
});

export const blocNSchema = z.object({
  siteOverrides: siteOverridesSchema.nullable().optional(),
});

// Dates
export const datesSchema = z.object({
  startDate: z.coerce.date().nullable().optional(),
  expectedEndDate: z.coerce.date().nullable().optional(),
});

// Schema complet de creation de protocole
export const createStudySchema = z.object({
  // BLOC A - Identification (requis)
  ...blocASchema.shape,
  // BLOC B - Contacts
  ...blocBSchema.shape,
  // BLOC C - Regulatory
  ...blocCSchema.shape,
  // BLOC D - Parametres operationnels
  ...blocDSchema.shape,
  // BLOC E - Data Quality Profile
  ...blocESchema.shape,
  // BLOC G - Visit Schedule
  ...blocGSchema.shape,
  // BLOC H - Patient Constraints
  ...blocHSchema.shape,
  // BLOC I - Temperature
  ...blocISchema.shape,
  // BLOC L - IWRS
  ...blocLSchema.shape,
  // BLOC M - Equipment
  ...blocMSchema.shape,
  // BLOC N - Site Overrides
  ...blocNSchema.shape,
  // Dates
  ...datesSchema.shape,
  // Commentaires par bloc
  blockComments: z.record(z.string(), z.string()).nullable().optional(),
});

export const updateStudySchema = createStudySchema.partial();

// Types
export type BlocAData = z.infer<typeof blocASchema>;
export type BlocBData = z.infer<typeof blocBSchema>;
export type BlocCData = z.infer<typeof blocCSchema>;
export type BlocDData = z.infer<typeof blocDSchema>;
export type BlocEData = z.infer<typeof blocESchema>;
export type BlocGData = z.infer<typeof blocGSchema>;
export type BlocHData = z.infer<typeof blocHSchema>;
export type BlocIData = z.infer<typeof blocISchema>;
export type BlocLData = z.infer<typeof blocLSchema>;
export type BlocMData = z.infer<typeof blocMSchema>;
export type BlocNData = z.infer<typeof blocNSchema>;
export type DatesData = z.infer<typeof datesSchema>;
export type CreateStudyData = z.infer<typeof createStudySchema>;
export type UpdateStudyData = z.infer<typeof updateStudySchema>;

// Export enum values
export {
  StudyPhaseValues,
  ComplexityLevelValues,
  BlindingTypeValues,
  DestructionPolicyValues,
  ReturnPolicyValues,
  TemperatureGovernanceValues,
  IwrsIntegrationModeValues,
  ContactRoleValues,
  WeightReferenceValues,
};

// Configuration des blocs pour le stepper
export const STUDY_BLOCKS = [
  { id: 'A', label: 'Identification', schema: blocASchema, required: true },
  { id: 'B', label: 'Contacts', schema: blocBSchema, required: false },
  { id: 'C', label: 'Reglementaire', schema: blocCSchema, required: false },
  { id: 'D', label: 'Parametres operationnels', schema: blocDSchema, required: false },
  { id: 'E', label: 'Qualite donnees', schema: blocESchema, required: false },
  { id: 'G', label: 'Calendrier visites', schema: blocGSchema, required: false },
  { id: 'H', label: 'Contraintes patient', schema: blocHSchema, required: false },
  { id: 'I', label: 'Temperature', schema: blocISchema, required: false },
  { id: 'L', label: 'IWRS', schema: blocLSchema, required: false },
  { id: 'M', label: 'Equipements', schema: blocMSchema, required: false },
  { id: 'N', label: 'Site local', schema: blocNSchema, required: false },
] as const;
