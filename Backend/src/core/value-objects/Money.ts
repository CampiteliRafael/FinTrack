export class Money {
  private readonly value: number;

  constructor(value: number) {
    if (value < 0) {
      throw new Error('Money cannot be negative');
    }

    this.value = Math.round(value * 100) / 100;
  }

  getValue(): number {
    return this.value;
  }

  add(other: Money): Money {
    return new Money(this.value + other.value);
  }

  subtract(other: Money): Money {
    return new Money(this.value - other.value);
  }

  multiply(factor: number): Money {
    return new Money(this.value * factor);
  }

  isGreaterThan(other: Money): boolean {
    return this.value > other.value;
  }

  isLessThan(other: Money): boolean {
    return this.value < other.value;
  }

  equals(other: Money): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value.toFixed(2);
  }
}
