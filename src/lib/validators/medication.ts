import { z } from 'zod';

// Enum values for validation
const MedicationTypeValues = ['IMP', 'NIMP'] as const;
const DosageFormValues = ['TABLET', 'CAPSULE', 'INJECTION', 'SOLUTION', 'CREAM', 'PATCH', 'INHALER', 'SUPPOSITORY', 'POWDER', 'GEL', 'SPRAY', 'DROPS', 'OTHER'] as const;
const StorageConditionValues = ['ROOM_TEMPERATURE', 'REFRIGERATED', 'FROZEN', 'CONTROLLED_ROOM_TEMPERATURE', 'PROTECT_FROM_LIGHT', 'OTHER'] as const;
const CountingUnitValues = ['UNIT', 'BOX', 'VIAL', 'AMPOULE', 'SYRINGE', 'BOTTLE', 'SACHET', 'BLISTER', 'KIT', 'OTHER'] as const;
const DestructionPolicyValues = ['LOCAL', 'SPONSOR', 'MIXED'] as const;
const DoseTypeValues = ['FIXED', 'PER_KG', 'PER_M2'] as const;
const AdministrationRouteValues = ['IV', 'PO', 'SC', 'IM', 'TOPICAL', 'INHALED', 'RECTAL', 'TRANSDERMAL', 'OPHTHALMIC', 'OTHER'] as const;
const MedicationStatusValues = ['DRAFT', 'ACTIVE', 'WITHDRAWN'] as const;
const SupplyModeValues = ['MANUEL', 'AUTO'] as const;
const TreatmentAssignmentModeValues = ['IRT', 'MANUEL'] as const;

export const createMedicationSchema = z.object({
  studyId: z.string().uuid('ID de protocole invalide'),
  code: z
    .string()
    .min(1, 'Le code du medicament est requis')
    .max(50, 'Le code ne peut pas depasser 50 caracteres')
    .regex(/^[A-Z0-9-]+$/, 'Le code doit contenir uniquement des lettres majuscules, chiffres et tirets'),
  name: z
    .string()
    .min(1, 'Le nom est requis')
    .max(200, 'Le nom ne peut pas depasser 200 caracteres'),
  dciName: z.string().max(200).optional(),
  type: z.enum(MedicationTypeValues, {
    message: 'Le type de medicament est requis (IMP ou NIMP)',
  }),
  dosageForm: z.enum(DosageFormValues, {
    message: 'La forme galenique est requise',
  }),
  strength: z.string().max(50).optional(),
  manufacturer: z.string().max(100).optional(),
  storageCondition: z.enum(StorageConditionValues, {
    message: 'La condition de stockage est requise',
  }),
  storageInstructions: z.string().max(500).optional(),
  countingUnit: z.enum(CountingUnitValues, {
    message: 'L\'unite de comptage est requise',
  }),
  unitsPerPackage: z.number().int().positive().default(1),
  destructionPolicy: z.enum(DestructionPolicyValues).optional(),
  doseType: z.enum(DoseTypeValues).optional(),
  dosage: z.string().max(200).optional(),
  packaging: z.string().max(200).optional(),
  protocolRequiredDose: z.string().max(500).optional(),
  doseRounding: z.string().max(200).optional(),
  requiresAnthropometricData: z.boolean().default(false),
  requiresPreparation: z.boolean().default(false),
  preparationInstructions: z.string().max(500).optional(),
  requiresReconstitution: z.boolean().default(false),
  reconstitutionInstructions: z.string().max(500).optional(),
  stabilityAfterPreparation: z.string().max(500).optional(),
  dilutionType: z.string().max(200).optional(),
  dilutionVolume: z.string().max(200).optional(),
  dilutionFinalConcentration: z.string().max(200).optional(),
  dilutionSolution: z.string().max(200).optional(),
  requiredEquipments: z.string().max(500).optional(),
  iwrsRequired: z.boolean().default(false),
  requiresEsign: z.boolean().default(false),
  isBlinded: z.boolean().default(false),
  isPediatric: z.boolean().default(false),
  administrationRoute: z.enum(AdministrationRouteValues).optional(),
  status: z.enum(MedicationStatusValues).default('DRAFT'),
  initialSupplyMode: z.enum(SupplyModeValues).optional(),
  resupplyMode: z.enum(SupplyModeValues).optional(),
  treatmentAssignmentMode: z.enum(TreatmentAssignmentModeValues).optional(),
});

export const updateMedicationSchema = createMedicationSchema.partial().omit({ studyId: true });

export type CreateMedicationData = z.infer<typeof createMedicationSchema>;
export type UpdateMedicationData = z.infer<typeof updateMedicationSchema>;

// Export enum values for use in services
export { MedicationTypeValues, DosageFormValues, StorageConditionValues, CountingUnitValues, DestructionPolicyValues, DoseTypeValues, AdministrationRouteValues, MedicationStatusValues, SupplyModeValues, TreatmentAssignmentModeValues };
