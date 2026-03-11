export class RefreshToken {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly token: string,
    public readonly expiresAt: Date,
    public readonly createdAt: Date
  ) {
    this.validate();
  }

  private validate(): void {
    if (!this.userId) {
      throw new Error('Refresh token must belong to a user');
    }

    if (this.token.length === 0) {
      throw new Error('Token cannot be empty');
    }

    if (!this.expiresAt || isNaN(this.expiresAt.getTime())) {
      throw new Error('Expiration date must be a valid date');
    }
  }

  isExpired(): boolean {
    return this.expiresAt < new Date();
  }

  isValid(): boolean {
    return !this.isExpired();
  }
}
