import { z } from 'zod';

// Enum values for validation
const MovementTypeValues = ['RECEPTION', 'DISPENSATION', 'RETOUR', 'DESTRUCTION', 'TRANSFER'] as const;
const ReturnReasonValues = ['UNUSED', 'PARTIALLY_USED', 'EXPIRED', 'DAMAGED', 'PATIENT_WITHDRAWAL', 'PROTOCOL_DEVIATION', 'ADVERSE_EVENT', 'OTHER'] as const;
const ReturnDestinationValues = ['STOCK', 'QUARANTINE', 'DESTRUCTION', 'SPONSOR_RETURN'] as const;
const DestructionMethodValues = ['INCINERATION', 'CHEMICAL', 'RETURN_TO_SPONSOR', 'OTHER'] as const;

// Base movement schema
const baseMovementSchema = z.object({
  studyId: z.string().uuid('ID de protocole invalide'),
  medicationId: z.string().uuid('ID de medicament invalide').optional(),
  equipmentId: z.string().uuid('ID d\'equipement invalide').optional(),
  stockItemId: z.string().uuid('ID de lot invalide').optional(),
  quantity: z.number().int().positive('La quantite doit etre positive'),
  movementDate: z.coerce.date(),
  notes: z.string().max(1000).optional(),
});

// Reception
export const createReceptionSchema = baseMovementSchema.extend({
  type: z.literal('RECEPTION'),
  batchNumber: z.string().min(1, 'Le numero de lot est requis'),
  expiryDate: z.coerce.date().optional(),
  manufacturingDate: z.coerce.date().optional(),
  supplierName: z.string().optional(),
  deliveryNoteNumber: z.string().optional(),
  storageLocation: z.string().optional(),
});

// Dispensation
export const createDispensationSchema = baseMovementSchema.extend({
  type: z.literal('DISPENSATION'),
  patientId: z.string().min(1, 'L\'identifiant patient est requis'),
  visitNumber: z.string().optional(),
  iwrsConfirmationNumber: z.string().optional(),
});

// Return
export const createReturnSchema = baseMovementSchema.extend({
  type: z.literal('RETOUR'),
  patientId: z.string().min(1, 'L\'identifiant patient est requis'),
  returnReason: z.enum(ReturnReasonValues, {
    message: 'La raison du retour est requise',
  }),
  returnDestination: z.enum(ReturnDestinationValues, {
    message: 'La destination du retour est requise',
  }),
  returnedQuantityUsed: z.number().int().min(0).optional(),
  returnedQuantityUnused: z.number().int().min(0).optional(),
});

// Destruction
export const createDestructionSchema = baseMovementSchema.extend({
  type: z.literal('DESTRUCTION'),
  destructionMethod: z.enum(DestructionMethodValues, {
    message: 'La methode de destruction est requise',
  }),
  destructionWitnessName: z.string().optional(),
  destructionCertificateNumber: z.string().optional(),
});

// Transfer
export const createTransferSchema = baseMovementSchema.extend({
  type: z.literal('TRANSFER'),
  transferFromLocation: z.string().min(1, 'L\'emplacement source est requis'),
  transferToLocation: z.string().min(1, 'L\'emplacement destination est requis'),
});

// Union schema for all movement types
export const createMovementSchema = z.discriminatedUnion('type', [
  createReceptionSchema,
  createDispensationSchema,
  createReturnSchema,
  createDestructionSchema,
  createTransferSchema,
]);

// Types
export type CreateReceptionData = z.infer<typeof createReceptionSchema>;
export type CreateDispensationData = z.infer<typeof createDispensationSchema>;
export type CreateReturnData = z.infer<typeof createReturnSchema>;
export type CreateDestructionData = z.infer<typeof createDestructionSchema>;
export type CreateTransferData = z.infer<typeof createTransferSchema>;
export type CreateMovementData = z.infer<typeof createMovementSchema>;

// Export enum values for use in services
export { MovementTypeValues, ReturnReasonValues, ReturnDestinationValues, DestructionMethodValues };
