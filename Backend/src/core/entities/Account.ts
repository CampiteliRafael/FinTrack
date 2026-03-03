import { AccountType } from '@prisma/client';

export class Account {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly name: string,
    public readonly initialBalance: number,
    public readonly type: AccountType,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public readonly deletedAt: Date | null
  ) {
    this.validate();
  }

  private validate(): void {
    if (this.name.length === 0) {
      throw new Error('Account name cannot be empty');
    }

    if (!this.userId) {
      throw new Error('Account must belong to a user');
    }
  }

  isDeleted(): boolean {
    return this.deletedAt !== null;
  }
}
