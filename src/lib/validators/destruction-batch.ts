import { z } from 'zod';

const DestructionMethodValues = ['INCINERATION', 'CHEMICAL', 'RETURN_TO_SPONSOR', 'OTHER'] as const;

export const createDestructionBatchSchema = z.object({
  studyId: z.string().uuid('ID de protocole invalide'),
  destructionMethod: z.enum(DestructionMethodValues, {
    message: 'La methode de destruction est requise',
  }),
  destructionDate: z.coerce.date().optional(),
  destructionLocation: z.string().max(500).optional(),
  witnessName: z.string().max(200).optional(),
  witnessFn: z.string().max(200).optional(),
  notes: z.string().max(2000).optional(),
  items: z
    .array(
      z.object({
        stockItemId: z.string().uuid('ID de lot invalide'),
        medicationId: z.string().uuid('ID de medicament invalide'),
        quantity: z.number().int().positive('La quantite doit etre positive'),
      })
    )
    .min(1, 'Au moins un element est requis'),
});

export type CreateDestructionBatchData = z.infer<typeof createDestructionBatchSchema>;
