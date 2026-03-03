import { Transaction } from '../../core/entities/Transaction';

describe('Transaction Entity', () => {
  const validData = {
    id: '123',
    userId: 'user-1',
    accountId: 'account-1',
    categoryId: 'category-1',
    type: 'expense' as const,
    amount: 100,
    description: 'Test transaction',
    date: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  describe('constructor', () => {
    it('should create a valid transaction', () => {
      const transaction = new Transaction(
        validData.id,
        validData.userId,
        validData.accountId,
        validData.categoryId,
        validData.type,
        validData.amount,
        validData.description,
        validData.date,
        validData.createdAt,
        validData.updatedAt
      );

      expect(transaction.id).toBe(validData.id);
      expect(transaction.amount).toBe(validData.amount);
      expect(transaction.type).toBe(validData.type);
    });

    it('should throw error for negative amount', () => {
      expect(() => {
        new Transaction(
          validData.id,
          validData.userId,
          validData.accountId,
          validData.categoryId,
          validData.type,
          -100,
          validData.description,
          validData.date,
          validData.createdAt,
          validData.updatedAt
        );
      }).toThrow('Amount must be positive');
    });

    it('should throw error for zero amount', () => {
      expect(() => {
        new Transaction(
          validData.id,
          validData.userId,
          validData.accountId,
          validData.categoryId,
          validData.type,
          0,
          validData.description,
          validData.date,
          validData.createdAt,
          validData.updatedAt
        );
      }).toThrow('Amount must be positive');
    });
  });
});
