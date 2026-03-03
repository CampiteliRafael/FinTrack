export class Category {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly name: string,
    public readonly color: string,
    public readonly icon: string,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public readonly deletedAt: Date | null
  ) {
    this.validate();
  }

  private validate(): void {
    if (this.name.length === 0) {
      throw new Error('Category name cannot be empty');
    }

    if (!this.isValidColor(this.color)) {
      throw new Error('Invalid color format');
    }

    if (!this.userId) {
      throw new Error('Category must belong to a user');
    }
  }

  private isValidColor(color: string): boolean {
    return /^#[0-9A-F]{6}$/i.test(color);
  }

  isDeleted(): boolean {
    return this.deletedAt !== null;
  }
}
