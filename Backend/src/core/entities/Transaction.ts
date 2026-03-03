import { TransactionType } from '@prisma/client';

export class Transaction {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly accountId: string,
    public readonly categoryId: string,
    public readonly type: TransactionType,
    public readonly amount: number,
    public readonly description: string | null,
    public readonly date: Date,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public readonly deletedAt: Date | null
  ) {
    this.validate();
  }

  private validate(): void {
    if (this.amount <= 0) {
      throw new Error('Amount must be positive');
    }

    if (!this.userId || !this.accountId || !this.categoryId) {
      throw new Error('Missing required relationships');
    }
  }

  isDeleted(): boolean {
    return this.deletedAt !== null;
  }

  isIncome(): boolean {
    return this.type === 'income';
  }

  isExpense(): boolean {
    return this.type === 'expense';
  }
}
