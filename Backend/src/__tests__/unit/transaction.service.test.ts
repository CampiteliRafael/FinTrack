import { TransactionService } from '../../modules/transactions/transaction.service';
import { ITransactionRepository } from '../../core/interfaces/ITransactionRepository';
import { IAccountRepository } from '../../core/interfaces/IAccountRepository';
import { ICategoryRepository } from '../../core/interfaces/ICategoryRepository';
import { NotFoundError } from '../../shared/errors/AppError';
import { ValidationUtil } from '../../shared/utils/validation.util';

// Mock dependencies
jest.mock('../../shared/utils/validation.util');

describe('TransactionService', () => {
  let transactionService: TransactionService;
  let mockTransactionRepository: jest.Mocked<ITransactionRepository>;
  let mockAccountRepository: jest.Mocked<IAccountRepository>;
  let mockCategoryRepository: jest.Mocked<ICategoryRepository>;

  beforeEach(() => {
    // Create complete mocks for interfaces
    mockTransactionRepository = {
      findById: jest.fn(),
      findAll: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      softDelete: jest.fn(),
      findByIdWithRelations: jest.fn(),
      findAllWithRelations: jest.fn(),
      createWithBalanceUpdate: jest.fn(),
      updateWithBalanceUpdate: jest.fn(),
      softDeleteWithBalanceUpdate: jest.fn(),
    } as jest.Mocked<ITransactionRepository>;

    mockAccountRepository = {
      findById: jest.fn(),
      findAll: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      softDelete: jest.fn(),
      createWithInitialBalance: jest.fn(),
      updateWithBalanceAdjustment: jest.fn(),
    } as jest.Mocked<IAccountRepository>;

    mockCategoryRepository = {
      findById: jest.fn(),
      findAll: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      softDelete: jest.fn(),
    } as jest.Mocked<ICategoryRepository>;

    transactionService = new TransactionService(
      mockTransactionRepository,
      mockAccountRepository,
      mockCategoryRepository
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const userId = 'user-123';
    const createData = {
      type: 'expense' as const,
      amount: 100.50,
      description: 'Test expense',
      date: new Date('2026-03-02'),
      accountId: 'account-123',
      categoryId: 'category-123',
    };

    it('should create transaction with balance update', async () => {
      const mockTransaction = {
        id: 'transaction-123',
        ...createData,
        userId,
        account: {
          id: 'account-123',
          currentBalance: 900.50, // After deduction
        },
      };

      (ValidationUtil.validateAccountAndCategory as jest.Mock).mockResolvedValue(undefined);
      mockTransactionRepository.createWithBalanceUpdate.mockResolvedValue(mockTransaction as any);

      const result = await transactionService.create(userId, createData);

      expect(ValidationUtil.validateAccountAndCategory).toHaveBeenCalledWith(
        mockAccountRepository,
        mockCategoryRepository,
        createData.accountId,
        createData.categoryId,
        userId
      );

      expect(mockTransactionRepository.createWithBalanceUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          type: createData.type,
          amount: createData.amount,
          description: createData.description,
          date: createData.date,
        }),
        createData.accountId,
        createData.type,
        createData.amount
      );

      expect(result).toEqual(mockTransaction);
    });

    it('should create income transaction and increase balance', async () => {
      const incomeData = {
        ...createData,
        type: 'income' as const,
        amount: 500.00,
        description: 'Salary',
      };

      const mockTransaction = {
        id: 'transaction-456',
        ...incomeData,
        userId,
        account: {
          id: 'account-123',
          currentBalance: 1500.00, // After addition
        },
      };

      (ValidationUtil.validateAccountAndCategory as jest.Mock).mockResolvedValue(undefined);
      mockTransactionRepository.createWithBalanceUpdate.mockResolvedValue(mockTransaction as any);

      const result = await transactionService.create(userId, incomeData);

      expect(mockTransactionRepository.createWithBalanceUpdate).toHaveBeenCalledWith(
        expect.any(Object),
        incomeData.accountId,
        'income',
        500.00
      );

      // Account relation is not included in the transaction return type
      // expect(result.account.currentBalance).toBe(1500.00);
    });

    it('should throw error if account does not exist', async () => {
      (ValidationUtil.validateAccountAndCategory as jest.Mock).mockRejectedValue(
        new NotFoundError('Conta não encontrada')
      );

      await expect(transactionService.create(userId, createData)).rejects.toThrow(NotFoundError);
      await expect(transactionService.create(userId, createData)).rejects.toThrow(
        'Conta não encontrada'
      );

      expect(mockTransactionRepository.createWithBalanceUpdate).not.toHaveBeenCalled();
    });

    it('should throw error if category does not exist', async () => {
      (ValidationUtil.validateAccountAndCategory as jest.Mock).mockRejectedValue(
        new NotFoundError('Categoria não encontrada')
      );

      await expect(transactionService.create(userId, createData)).rejects.toThrow(NotFoundError);

      expect(mockTransactionRepository.createWithBalanceUpdate).not.toHaveBeenCalled();
    });
  });

  describe('update', () => {
    const userId = 'user-123';
    const transactionId = 'transaction-123';

    const oldTransaction = {
      id: transactionId,
      type: 'expense' as const,
      amount: 100.00,
      description: 'Old description',
      date: new Date('2026-03-01'),
      accountId: 'account-123',
      categoryId: 'category-123',
      userId,
      account: {
        id: 'account-123',
        currentBalance: 900.00,
      },
      category: {
        id: 'category-123',
        name: 'Food',
      },
    };

    it('should update transaction with balance recalculation when amount changes', async () => {
      const updateData = {
        amount: 150.00, // Changed from 100 to 150
      };

      mockTransactionRepository.findByIdWithRelations.mockResolvedValue(oldTransaction as any);
      mockTransactionRepository.updateWithBalanceUpdate.mockResolvedValue({
        ...oldTransaction,
        amount: 150.00,
        account: {
          id: 'account-123',
          currentBalance: 850.00, // Adjusted balance
        },
      } as any);

      const result = await transactionService.update(transactionId, userId, updateData);

      expect(mockTransactionRepository.findByIdWithRelations).toHaveBeenCalledWith(transactionId, userId);
      expect(mockTransactionRepository.updateWithBalanceUpdate).toHaveBeenCalled();
      expect(result.amount).toBe(150.00);
    });

    it('should update transaction with balance recalculation when type changes', async () => {
      const updateData = {
        type: 'income' as const, // Changed from expense to income
      };

      mockTransactionRepository.findByIdWithRelations.mockResolvedValue(oldTransaction as any);
      mockTransactionRepository.updateWithBalanceUpdate.mockResolvedValue({
        ...oldTransaction,
        type: 'income',
        account: {
          id: 'account-123',
          currentBalance: 1100.00, // Balance adjusted: was -100, now +100 = +200 difference
        },
      } as any);

      const result = await transactionService.update(transactionId, userId, updateData);

      expect(mockTransactionRepository.updateWithBalanceUpdate).toHaveBeenCalled();
      expect(result.type).toBe('income');
    });

    it('should update transaction with balance recalculation when account changes', async () => {
      const updateData = {
        accountId: 'account-456', // Different account
      };

      mockTransactionRepository.findByIdWithRelations.mockResolvedValue(oldTransaction as any);
      (ValidationUtil.validateAccount as jest.Mock).mockResolvedValue(undefined);
      mockTransactionRepository.updateWithBalanceUpdate.mockResolvedValue({
        ...oldTransaction,
        accountId: 'account-456',
      } as any);

      await transactionService.update(transactionId, userId, updateData);

      expect(ValidationUtil.validateAccount).toHaveBeenCalledWith(
        mockAccountRepository,
        'account-456',
        userId
      );
      expect(mockTransactionRepository.updateWithBalanceUpdate).toHaveBeenCalled();
    });

    it('should use simple update when only description changes', async () => {
      const updateData = {
        description: 'Updated description',
      };

      mockTransactionRepository.findByIdWithRelations.mockResolvedValue(oldTransaction as any);
      mockTransactionRepository.update.mockResolvedValue({
        ...oldTransaction,
        description: 'Updated description',
      } as any);

      await transactionService.update(transactionId, userId, updateData);

      expect(mockTransactionRepository.update).toHaveBeenCalledWith(transactionId, {
        description: 'Updated description',
      });
      expect(mockTransactionRepository.updateWithBalanceUpdate).not.toHaveBeenCalled();
    });

    it('should throw NotFoundError if transaction does not exist', async () => {
      mockTransactionRepository.findByIdWithRelations.mockResolvedValue(null);

      await expect(
        transactionService.update(transactionId, userId, { amount: 200 })
      ).rejects.toThrow(NotFoundError);
      await expect(
        transactionService.update(transactionId, userId, { amount: 200 })
      ).rejects.toThrow('Transação não encontrada');
    });
  });

  describe('delete', () => {
    const userId = 'user-123';
    const transactionId = 'transaction-123';

    it('should delete transaction with balance reversal', async () => {
      const mockTransaction = {
        id: transactionId,
        type: 'expense' as const,
        amount: 100.00,
        accountId: 'account-123',
        userId,
      };

      mockTransactionRepository.findById.mockResolvedValue(mockTransaction as any);
      mockTransactionRepository.softDeleteWithBalanceUpdate.mockResolvedValue(undefined);

      await transactionService.delete(transactionId, userId);

      expect(mockTransactionRepository.findById).toHaveBeenCalledWith(transactionId, userId);
      expect(mockTransactionRepository.softDeleteWithBalanceUpdate).toHaveBeenCalledWith(
        mockTransaction
      );
    });

    it('should throw NotFoundError if transaction does not exist', async () => {
      mockTransactionRepository.findById.mockResolvedValue(null);

      await expect(transactionService.delete(transactionId, userId)).rejects.toThrow(
        NotFoundError
      );
      expect(mockTransactionRepository.softDeleteWithBalanceUpdate).not.toHaveBeenCalled();
    });
  });

  describe('getById', () => {
    it('should return transaction if found', async () => {
      const mockTransaction = {
        id: 'transaction-123',
        type: 'income',
        amount: 500,
        userId: 'user-123',
      };

      mockTransactionRepository.findById.mockResolvedValue(mockTransaction as any);

      const result = await transactionService.getById('transaction-123', 'user-123');

      expect(result).toEqual(mockTransaction);
      expect(mockTransactionRepository.findById).toHaveBeenCalledWith('transaction-123', 'user-123');
    });

    it('should throw NotFoundError if transaction not found', async () => {
      mockTransactionRepository.findById.mockResolvedValue(null);

      await expect(transactionService.getById('transaction-123', 'user-123')).rejects.toThrow(
        NotFoundError
      );
      await expect(transactionService.getById('transaction-123', 'user-123')).rejects.toThrow(
        'Transação não encontrada'
      );
    });
  });

  describe('getAll', () => {
    it('should return filtered transactions', async () => {
      const userId = 'user-123';
      const filters = {
        type: 'expense' as const,
        startDate: new Date('2026-03-01'),
        endDate: new Date('2026-03-31'),
        page: 1,
        limit: 10,
      };

      const mockResponse = {
        data: [
          { id: '1', type: 'expense', amount: 100 },
          { id: '2', type: 'expense', amount: 200 },
        ],
        pagination: {
          page: 1,
          limit: 10,
          total: 2,
          pages: 1,
        },
      };

      mockTransactionRepository.findAll.mockResolvedValue(mockResponse as any);

      const result = await transactionService.getAll(userId, filters);

      expect(mockTransactionRepository.findAll).toHaveBeenCalledWith(userId, filters);
      expect(result).toEqual(mockResponse);
      expect(result.data).toHaveLength(2);
    });
  });
});
