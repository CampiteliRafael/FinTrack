export class Goal {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly name: string,
    public readonly targetAmount: number,
    public readonly currentAmount: number,
    public readonly deadline: Date | null,
    public readonly categoryId: string | null,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public readonly deletedAt: Date | null
  ) {
    this.validate();
  }

  private validate(): void {
    if (this.name.length === 0) {
      throw new Error('Goal name cannot be empty');
    }

    if (!this.userId) {
      throw new Error('Goal must belong to a user');
    }

    if (this.targetAmount <= 0) {
      throw new Error('Target amount must be positive');
    }

    if (this.currentAmount < 0) {
      throw new Error('Current amount cannot be negative');
    }

    if (this.deadline && this.deadline < new Date()) {
      // Allow past deadlines for existing goals, but validate they're valid dates
      if (isNaN(this.deadline.getTime())) {
        throw new Error('Deadline must be a valid date');
      }
    }
  }

  isCompleted(): boolean {
    return this.currentAmount >= this.targetAmount;
  }

  getProgress(): number {
    return (this.currentAmount / this.targetAmount) * 100;
  }

  remainingAmount(): number {
    return Math.max(0, this.targetAmount - this.currentAmount);
  }

  isDeleted(): boolean {
    return this.deletedAt !== null;
  }
}
