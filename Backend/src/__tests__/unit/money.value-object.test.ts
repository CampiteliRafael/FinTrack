import { Money } from '../../core/value-objects/Money';

describe('Money Value Object', () => {
  describe('constructor', () => {
    it('should create a valid Money object', () => {
      const money = new Money(100);

      expect(money.getValue()).toBe(100);
    });

    it('should throw error for negative amount', () => {
      expect(() => {
        new Money(-100);
      }).toThrow('Money cannot be negative');
    });

    it('should accept zero amount', () => {
      const money = new Money(0);
      expect(money.getValue()).toBe(0);
    });

    it('should round to 2 decimal places', () => {
      const money = new Money(100.456);
      expect(money.getValue()).toBe(100.46);
    });
  });

  describe('add', () => {
    it('should add two money objects', () => {
      const money1 = new Money(100);
      const money2 = new Money(50);
      const result = money1.add(money2);

      expect(result.getValue()).toBe(150);
    });
  });

  describe('subtract', () => {
    it('should subtract two money objects', () => {
      const money1 = new Money(100);
      const money2 = new Money(30);
      const result = money1.subtract(money2);

      expect(result.getValue()).toBe(70);
    });

    it('should throw error when result is negative', () => {
      const money1 = new Money(50);
      const money2 = new Money(100);

      expect(() => {
        money1.subtract(money2);
      }).toThrow('Money cannot be negative');
    });
  });

  describe('multiply', () => {
    it('should multiply money by a factor', () => {
      const money = new Money(100);
      const result = money.multiply(2);

      expect(result.getValue()).toBe(200);
    });

    it('should throw error for negative result', () => {
      const money = new Money(100);

      expect(() => {
        money.multiply(-2);
      }).toThrow('Money cannot be negative');
    });
  });

  describe('equals', () => {
    it('should return true for equal money objects', () => {
      const money1 = new Money(100);
      const money2 = new Money(100);

      expect(money1.equals(money2)).toBe(true);
    });

    it('should return false for different amounts', () => {
      const money1 = new Money(100);
      const money2 = new Money(50);

      expect(money1.equals(money2)).toBe(false);
    });
  });

  describe('isGreaterThan', () => {
    it('should return true when amount is greater', () => {
      const money1 = new Money(100);
      const money2 = new Money(50);

      expect(money1.isGreaterThan(money2)).toBe(true);
    });

    it('should return false when amount is less', () => {
      const money1 = new Money(50);
      const money2 = new Money(100);

      expect(money1.isGreaterThan(money2)).toBe(false);
    });
  });

  describe('toString', () => {
    it('should format to 2 decimal places', () => {
      const money = new Money(100);
      expect(money.toString()).toBe('100.00');
    });
  });
});
