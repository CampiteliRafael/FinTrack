import { describe, it, expect } from 'vitest';
import {
  isValidEmail,
  isStrongPassword,
  isPositiveNumber,
  isWithinRange,
  isEmpty,
} from '../../utils/validation';

describe('Validation Utilities', () => {
  describe('isValidEmail', () => {
    it('should validate correct emails', () => {
      expect(isValidEmail('test@example.com')).toBe(true);
      expect(isValidEmail('user.name@domain.co.uk')).toBe(true);
      expect(isValidEmail('user+tag@example.com')).toBe(true);
    });

    it('should reject invalid emails', () => {
      expect(isValidEmail('invalid')).toBe(false);
      expect(isValidEmail('invalid@')).toBe(false);
      expect(isValidEmail('@example.com')).toBe(false);
      expect(isValidEmail('invalid@domain')).toBe(false);
      expect(isValidEmail('invalid @domain.com')).toBe(false);
    });

    it('should reject empty string', () => {
      expect(isValidEmail('')).toBe(false);
    });
  });

  describe('isStrongPassword', () => {
    it('should validate strong passwords', () => {
      expect(isStrongPassword('Test1234')).toBe(true);
      expect(isStrongPassword('MyP@ssw0rd')).toBe(true);
    });

    it('should reject short passwords', () => {
      expect(isStrongPassword('Test12')).toBe(false);
    });

    it('should reject passwords without uppercase', () => {
      expect(isStrongPassword('test1234')).toBe(false);
    });

    it('should reject passwords without lowercase', () => {
      expect(isStrongPassword('TEST1234')).toBe(false);
    });

    it('should reject passwords without numbers', () => {
      expect(isStrongPassword('TestTest')).toBe(false);
    });

    it('should reject empty password', () => {
      expect(isStrongPassword('')).toBe(false);
    });
  });

  describe('isPositiveNumber', () => {
    it('should return true for positive numbers', () => {
      expect(isPositiveNumber(1)).toBe(true);
      expect(isPositiveNumber(100)).toBe(true);
      expect(isPositiveNumber(0.5)).toBe(true);
    });

    it('should return false for zero', () => {
      expect(isPositiveNumber(0)).toBe(false);
    });

    it('should return false for negative numbers', () => {
      expect(isPositiveNumber(-1)).toBe(false);
      expect(isPositiveNumber(-100)).toBe(false);
    });

    it('should return false for NaN', () => {
      expect(isPositiveNumber(NaN)).toBe(false);
    });
  });

  describe('isWithinRange', () => {
    it('should return true for values within range', () => {
      expect(isWithinRange(5, 1, 10)).toBe(true);
      expect(isWithinRange(1, 1, 10)).toBe(true);
      expect(isWithinRange(10, 1, 10)).toBe(true);
    });

    it('should return false for values outside range', () => {
      expect(isWithinRange(0, 1, 10)).toBe(false);
      expect(isWithinRange(11, 1, 10)).toBe(false);
      expect(isWithinRange(-5, 1, 10)).toBe(false);
    });
  });

  describe('isEmpty', () => {
    it('should return true for empty values', () => {
      expect(isEmpty('')).toBe(true);
      expect(isEmpty('   ')).toBe(true);
      expect(isEmpty(null)).toBe(true);
      expect(isEmpty(undefined)).toBe(true);
    });

    it('should return false for non-empty values', () => {
      expect(isEmpty('hello')).toBe(false);
      expect(isEmpty('  hello  ')).toBe(false);
    });
  });
});
