import { describe, it, expect } from 'vitest';
import { createDestructionBatchSchema } from '../destruction-batch';

const validUuid = '550e8400-e29b-41d4-a716-446655440000';
const validUuid2 = '660e8400-e29b-41d4-a716-446655440000';

const validData = {
  studyId: validUuid,
  destructionMethod: 'INCINERATION' as const,
  items: [
    { stockItemId: validUuid, medicationId: validUuid2, quantity: 5 },
  ],
};

describe('createDestructionBatchSchema', () => {
  it('should validate a valid destruction batch', () => {
    const result = createDestructionBatchSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('should validate with all optional fields', () => {
    const data = {
      ...validData,
      destructionDate: '2026-02-16',
      destructionLocation: 'Pharmacie centrale',
      witnessName: 'Dr. Dupont',
      witnessFn: 'Pharmacien',
      notes: 'Destruction de lot expire',
    };
    const result = createDestructionBatchSchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  it('should reject empty items array', () => {
    const data = { ...validData, items: [] };
    const result = createDestructionBatchSchema.safeParse(data);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe('Au moins un element est requis');
    }
  });

  it('should reject negative quantity', () => {
    const data = {
      ...validData,
      items: [{ stockItemId: validUuid, medicationId: validUuid2, quantity: -1 }],
    };
    const result = createDestructionBatchSchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  it('should reject zero quantity', () => {
    const data = {
      ...validData,
      items: [{ stockItemId: validUuid, medicationId: validUuid2, quantity: 0 }],
    };
    const result = createDestructionBatchSchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  it('should reject invalid studyId uuid', () => {
    const data = { ...validData, studyId: 'not-a-uuid' };
    const result = createDestructionBatchSchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  it('should reject invalid stockItemId uuid', () => {
    const data = {
      ...validData,
      items: [{ stockItemId: 'bad', medicationId: validUuid2, quantity: 1 }],
    };
    const result = createDestructionBatchSchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  it('should reject invalid medicationId uuid', () => {
    const data = {
      ...validData,
      items: [{ stockItemId: validUuid, medicationId: 'bad', quantity: 1 }],
    };
    const result = createDestructionBatchSchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  it('should reject invalid destruction method', () => {
    const data = { ...validData, destructionMethod: 'LASER' };
    const result = createDestructionBatchSchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  it('should reject missing studyId', () => {
    const { studyId: _, ...data } = validData;
    const result = createDestructionBatchSchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  it('should reject missing destructionMethod', () => {
    const { destructionMethod: _, ...data } = validData;
    const result = createDestructionBatchSchema.safeParse(data);
    expect(result.success).toBe(false);
  });
});
