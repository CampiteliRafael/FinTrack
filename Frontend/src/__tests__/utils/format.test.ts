import { describe, it, expect } from 'vitest';
import {
  formatCurrency,
  formatDate,
  formatDateTime,
  formatPercentage,
  truncateText,
} from '../../utils/format';

describe('Format Utilities', () => {
  describe('formatCurrency', () => {
    it('should format positive amounts correctly', () => {
      expect(formatCurrency(100)).toBe('$100.00');
      expect(formatCurrency(1234.56)).toBe('$1,234.56');
    });

    it('should format zero correctly', () => {
      expect(formatCurrency(0)).toBe('$0.00');
    });

    it('should format negative amounts correctly', () => {
      expect(formatCurrency(-50)).toBe('-$50.00');
    });

    it('should format large amounts with commas', () => {
      expect(formatCurrency(1000000)).toBe('$1,000,000.00');
    });
  });

  describe('formatDate', () => {
    it('should format Date object', () => {
      const date = new Date('2024-01-15T12:00:00Z');
      const result = formatDate(date);
      expect(result).toContain('Jan');
      expect(result).toContain('2024');
    });

    it('should format ISO string', () => {
      const result = formatDate('2024-01-15T00:00:00Z');
      expect(result).toContain('2024');
    });
  });

  describe('formatDateTime', () => {
    it('should format date with time', () => {
      const date = new Date('2024-01-15T14:30:00');
      const result = formatDateTime(date);
      expect(result).toContain('Jan');
      expect(result).toContain('15');
      expect(result).toContain('2024');
    });

    it('should format ISO string with time', () => {
      const result = formatDateTime('2024-01-15T14:30:00Z');
      expect(result).toBeTruthy();
    });
  });

  describe('formatPercentage', () => {
    it('should format with default 1 decimal', () => {
      expect(formatPercentage(75.5)).toBe('75.5%');
    });

    it('should format with custom decimals', () => {
      expect(formatPercentage(75.567, 2)).toBe('75.57%');
    });

    it('should format zero percentage', () => {
      expect(formatPercentage(0)).toBe('0.0%');
    });

    it('should format 100%', () => {
      expect(formatPercentage(100)).toBe('100.0%');
    });

    it('should round correctly', () => {
      expect(formatPercentage(33.333, 1)).toBe('33.3%');
    });
  });

  describe('truncateText', () => {
    it('should not truncate short text', () => {
      expect(truncateText('Hello', 10)).toBe('Hello');
    });

    it('should truncate long text', () => {
      expect(truncateText('Hello World', 8)).toBe('Hello Wo...');
    });

    it('should handle exact length', () => {
      expect(truncateText('Hello', 5)).toBe('Hello');
    });

    it('should add ellipsis when truncated', () => {
      const result = truncateText('This is a long text', 10);
      expect(result).toContain('...');
      expect(result.length).toBe(13);
    });
  });
});
