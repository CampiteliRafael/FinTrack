export class Installment {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly transactionId: string | null,
    public readonly description: string,
    public readonly totalAmount: number,
    public readonly installments: number,
    public readonly currentInstallment: number,
    public readonly accountId: string,
    public readonly categoryId: string,
    public readonly startDate: Date,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public readonly deletedAt: Date | null
  ) {
    this.validate();
  }

  private validate(): void {
    if (this.description.length === 0) {
      throw new Error('Installment description cannot be empty');
    }

    if (!this.userId) {
      throw new Error('Installment must belong to a user');
    }

    if (this.totalAmount <= 0) {
      throw new Error('Total amount must be positive');
    }

    if (this.installments <= 0) {
      throw new Error('Number of installments must be positive');
    }

    if (this.currentInstallment < 0) {
      throw new Error('Current installment cannot be negative');
    }

    if (this.currentInstallment > this.installments) {
      throw new Error('Current installment cannot exceed total installments');
    }

    if (!this.accountId) {
      throw new Error('Installment must have an account');
    }

    if (!this.categoryId) {
      throw new Error('Installment must have a category');
    }
  }

  isCompleted(): boolean {
    return this.currentInstallment >= this.installments;
  }

  getProgress(): number {
    return (this.currentInstallment / this.installments) * 100;
  }

  remainingInstallments(): number {
    return Math.max(0, this.installments - this.currentInstallment);
  }

  installmentAmount(): number {
    return this.totalAmount / this.installments;
  }

  isDeleted(): boolean {
    return this.deletedAt !== null;
  }
}
