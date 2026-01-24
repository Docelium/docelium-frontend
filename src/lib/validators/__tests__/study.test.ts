import { describe, it, expect } from 'vitest';
import { blocASchema, createStudySchema } from '../study';

describe('Study Validators', () => {
  describe('blocASchema', () => {
    it('should validate a valid block A', () => {
      const data = {
        codeInternal: 'PROTO-2025-001',
        title: 'Test Study',
        sponsor: 'Test Sponsor',
        phase: 'III',
      };

      const result = blocASchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should reject empty codeInternal', () => {
      const data = {
        codeInternal: '',
        title: 'Test Study',
        sponsor: 'Test Sponsor',
        phase: 'III',
      };

      const result = blocASchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should reject invalid phase', () => {
      const data = {
        codeInternal: 'PROTO-2025-001',
        title: 'Test Study',
        sponsor: 'Test Sponsor',
        phase: 'INVALID_PHASE',
      };

      const result = blocASchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });

  describe('createStudySchema', () => {
    it('should validate a complete study', () => {
      const data = {
        codeInternal: 'PROTO-2025-001',
        title: 'Test Study',
        sponsor: 'Test Sponsor',
        phase: 'III',
        destructionPolicy: 'LOCAL',
        blinded: 'NONE',
      };

      const result = createStudySchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should validate with optional fields', () => {
      const data = {
        codeInternal: 'PROTO-2025-001',
        title: 'Test Study',
        sponsor: 'Test Sponsor',
        phase: 'III',
        therapeuticArea: 'Oncology',
        euCtNumber: '2025-123456-12',
        startDate: new Date('2025-01-01'),
        expectedEndDate: new Date('2026-12-31'),
      };

      const result = createStudySchema.safeParse(data);
      expect(result.success).toBe(true);
    });
  });
});
