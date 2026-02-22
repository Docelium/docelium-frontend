import { describe, it, expect } from 'vitest';
import { createMedicationSchema } from '../medication';

describe('Medication Validators', () => {
  describe('createMedicationSchema', () => {
    it('should validate a valid medication', () => {
      const data = {
        studyId: '550e8400-e29b-41d4-a716-446655440000',
        code: 'MED-001',
        name: 'Test Medication',
        type: 'IMP',
        dosageForm: 'TABLET',
        storageCondition: 'ROOM_TEMPERATURE',
        countingUnit: 'UNIT',
      };

      const result = createMedicationSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should reject invalid studyId', () => {
      const data = {
        studyId: 'not-a-uuid',
        code: 'MED-001',
        name: 'Test Medication',
        type: 'IMP',
        dosageForm: 'TABLET',
        storageCondition: 'ROOM_TEMPERATURE',
        countingUnit: 'UNIT',
      };

      const result = createMedicationSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should reject invalid medication type', () => {
      const data = {
        studyId: '550e8400-e29b-41d4-a716-446655440000',
        code: 'MED-001',
        name: 'Test Medication',
        type: 'INVALID',
        dosageForm: 'TABLET',
        storageCondition: 'ROOM_TEMPERATURE',
        countingUnit: 'UNIT',
      };

      const result = createMedicationSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should validate with optional fields', () => {
      const data = {
        studyId: '550e8400-e29b-41d4-a716-446655440000',
        code: 'MED-001',
        name: 'Test Medication',
        type: 'IMP',
        dosageForm: 'INJECTION',
        strength: '100mg/ml',
        manufacturer: 'Test Pharma',
        storageCondition: 'REFRIGERATED',
        storageInstructions: 'Keep at 2-8C',
        countingUnit: 'VIAL',
        unitsPerPackage: 10,
        isBlinded: true,
        iwrsPerMovement: { reception: true, dispensation: true, retour: false },
      };

      const result = createMedicationSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should validate customLogFields with movementTypes', () => {
      const data = {
        studyId: '550e8400-e29b-41d4-a716-446655440000',
        code: 'MED-001',
        name: 'Test Medication',
        type: 'IMP',
        dosageForm: 'TABLET',
        storageCondition: 'ROOM_TEMPERATURE',
        countingUnit: 'UNIT',
        customLogFields: [
          { name: 'Temperature', type: 'NUMBER', movementTypes: ['RECEPTION'] },
          { name: 'Commentaire', type: 'TEXT', movementTypes: ['RECEPTION', 'DISPENSATION', 'RETOUR'] },
        ],
      };

      const result = createMedicationSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should reject customLogFields without movementTypes', () => {
      const data = {
        studyId: '550e8400-e29b-41d4-a716-446655440000',
        code: 'MED-001',
        name: 'Test Medication',
        type: 'IMP',
        dosageForm: 'TABLET',
        storageCondition: 'ROOM_TEMPERATURE',
        countingUnit: 'UNIT',
        customLogFields: [
          { name: 'Temperature', type: 'NUMBER' },
        ],
      };

      const result = createMedicationSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should reject customLogFields with empty movementTypes', () => {
      const data = {
        studyId: '550e8400-e29b-41d4-a716-446655440000',
        code: 'MED-001',
        name: 'Test Medication',
        type: 'IMP',
        dosageForm: 'TABLET',
        storageCondition: 'ROOM_TEMPERATURE',
        countingUnit: 'UNIT',
        customLogFields: [
          { name: 'Temperature', type: 'NUMBER', movementTypes: [] },
        ],
      };

      const result = createMedicationSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should reject customLogFields with invalid movementType', () => {
      const data = {
        studyId: '550e8400-e29b-41d4-a716-446655440000',
        code: 'MED-001',
        name: 'Test Medication',
        type: 'IMP',
        dosageForm: 'TABLET',
        storageCondition: 'ROOM_TEMPERATURE',
        countingUnit: 'UNIT',
        customLogFields: [
          { name: 'Temperature', type: 'NUMBER', movementTypes: ['INVALID'] },
        ],
      };

      const result = createMedicationSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });
});
