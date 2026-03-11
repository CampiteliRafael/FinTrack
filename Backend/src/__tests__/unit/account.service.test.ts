import { AccountService } from '../../modules/accounts/account.service';
import { IAccountRepository } from '../../core/interfaces/IAccountRepository';
import { NotFoundError } from '../../shared/errors/AppError';

describe('AccountService', () => {
  let accountService: AccountService;
  let mockAccountRepository: jest.Mocked<IAccountRepository>;

  beforeEach(() => {
    mockAccountRepository = {
      findById: jest.fn(),
      findAll: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      softDelete: jest.fn(),
      createWithInitialBalance: jest.fn(),
      updateWithBalanceAdjustment: jest.fn(),
    } as jest.Mocked<IAccountRepository>;

    accountService = new AccountService(mockAccountRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const userId = 'user-123';
    const createData = {
      name: 'Nubank',
      initialBalance: 1000.00,
      type: 'checking' as const,
      monthlyIncome: 5000.00,
      monthlyIncomeDay: 5,
    };

    it('should create account with initial balance', async () => {
      const mockAccount = {
        id: 'account-123',
        ...createData,
        userId,
        currentBalance: 1000.00,
        availableBalance: 1000.00,
        reservedAmount: 0,
      };

      mockAccountRepository.createWithInitialBalance.mockResolvedValue(mockAccount as any);

      const result = await accountService.create(userId, createData);

      expect(mockAccountRepository.createWithInitialBalance).toHaveBeenCalledWith({
        userId,
        name: createData.name,
        initialBalance: createData.initialBalance,
        type: createData.type,
      });

      expect(result).toEqual(mockAccount);
      expect(result.currentBalance).toBe(1000.00);
    });

    it('should create account without monthly income', async () => {
      const dataWithoutMonthlyIncome = {
        name: 'Carteira',
        initialBalance: 500.00,
        type: 'cash' as const,
      };

      const mockAccount = {
        id: 'account-456',
        name: dataWithoutMonthlyIncome.name,
        initialBalance: dataWithoutMonthlyIncome.initialBalance,
        currentBalance: 500.00,
        availableBalance: 500.00,
        reservedAmount: 0,
        type: dataWithoutMonthlyIncome.type,
        userId,
        monthlyIncome: null,
        monthlyIncomeDay: null,
        lastTransactionAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };

      mockAccountRepository.createWithInitialBalance.mockResolvedValue(mockAccount as any);

      const result = await accountService.create(userId, dataWithoutMonthlyIncome);

      expect(result.monthlyIncome).toBeNull();
      expect(result.monthlyIncomeDay).toBeNull();
    });
  });

  describe('update', () => {
    const userId = 'user-123';
    const accountId = 'account-123';

    it('should update account name without affecting balance', async () => {
      const existingAccount = {
        id: accountId,
        name: 'Old Name',
        currentBalance: 1000.00,
        userId,
      };

      const updateData = {
        name: 'New Name',
      };

      mockAccountRepository.findById.mockResolvedValue(existingAccount as any);
      mockAccountRepository.update.mockResolvedValue({
        ...existingAccount,
        name: 'New Name',
      } as any);

      const result: any = await accountService.update(accountId, userId, updateData);

      expect(mockAccountRepository.update).toHaveBeenCalledWith(accountId, updateData);
      expect(mockAccountRepository.updateWithBalanceAdjustment).not.toHaveBeenCalled();
      expect(result.name).toBe('New Name');
    });

    it('should update balance with adjustment event', async () => {
      const existingAccount = {
        id: accountId,
        name: 'Nubank',
        currentBalance: 1000.00,
        userId,
      };

      const updateData = {
        currentBalance: 1500.00, // Increased balance
      };

      mockAccountRepository.findById.mockResolvedValue(existingAccount as any);
      mockAccountRepository.updateWithBalanceAdjustment.mockResolvedValue({
        ...existingAccount,
        currentBalance: 1500.00,
      } as any);

      const result: any = await accountService.update(accountId, userId, updateData);

      expect(mockAccountRepository.updateWithBalanceAdjustment).toHaveBeenCalledWith(
        accountId,
        existingAccount,
        1500.00
      );
      expect(mockAccountRepository.update).not.toHaveBeenCalled();
      expect(result.currentBalance).toBe(1500.00);
    });

    it('should throw NotFoundError if account does not exist', async () => {
      mockAccountRepository.findById.mockResolvedValue(null);

      await expect(
        accountService.update(accountId, userId, { name: 'New Name' })
      ).rejects.toThrow(NotFoundError);
      await expect(
        accountService.update(accountId, userId, { name: 'New Name' })
      ).rejects.toThrow('Conta não encontrada');
    });

    it('should not trigger balance adjustment if value is the same', async () => {
      const existingAccount = {
        id: accountId,
        name: 'Nubank',
        initialBalance: 1000.00,
        currentBalance: 1000.00,
        availableBalance: 1000.00,
        reservedAmount: 0,
        type: 'checking' as const,
        userId,
        monthlyIncome: null,
        monthlyIncomeDay: null,
        lastTransactionAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };

      const updateData = {
        currentBalance: 1000.00, // Same value
      };

      mockAccountRepository.findById.mockResolvedValue(existingAccount as any);
      mockAccountRepository.update.mockResolvedValue(existingAccount as any);

      await accountService.update(accountId, userId, updateData);

      expect(mockAccountRepository.update).toHaveBeenCalled();
      expect(mockAccountRepository.updateWithBalanceAdjustment).not.toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    const userId = 'user-123';
    const accountId = 'account-123';

    it('should soft delete account', async () => {
      const mockAccount = {
        id: accountId,
        name: 'Nubank',
        userId,
      };

      mockAccountRepository.findById.mockResolvedValue(mockAccount as any);
      mockAccountRepository.softDelete.mockResolvedValue(undefined);

      await accountService.delete(accountId, userId);

      expect(mockAccountRepository.findById).toHaveBeenCalledWith(accountId, userId);
      expect(mockAccountRepository.softDelete).toHaveBeenCalledWith(accountId);
    });

    it('should throw NotFoundError if account does not exist', async () => {
      mockAccountRepository.findById.mockResolvedValue(null);

      await expect(accountService.delete(accountId, userId)).rejects.toThrow(NotFoundError);
      expect(mockAccountRepository.softDelete).not.toHaveBeenCalled();
    });
  });

  describe('getById', () => {
    it('should return account if found', async () => {
      const mockAccount = {
        id: 'account-123',
        name: 'Nubank',
        currentBalance: 1000.00,
        userId: 'user-123',
      };

      mockAccountRepository.findById.mockResolvedValue(mockAccount as any);

      const result = await accountService.getById('account-123', 'user-123');

      expect(result).toEqual(mockAccount);
      expect(mockAccountRepository.findById).toHaveBeenCalledWith('account-123', 'user-123');
    });

    it('should throw NotFoundError if account not found', async () => {
      mockAccountRepository.findById.mockResolvedValue(null);

      await expect(accountService.getById('account-123', 'user-123')).rejects.toThrow(
        NotFoundError
      );
      await expect(accountService.getById('account-123', 'user-123')).rejects.toThrow(
        'Conta não encontrada'
      );
    });
  });

  describe('getAll', () => {
    it('should return all user accounts', async () => {
      const userId = 'user-123';
      const mockAccounts = [
        { id: '1', name: 'Nubank', currentBalance: 1000.00, type: 'checking' },
        { id: '2', name: 'Carteira', currentBalance: 500.00, type: 'cash' },
      ];

      mockAccountRepository.findAll.mockResolvedValue(mockAccounts as any);

      const result = await accountService.getAll(userId);

      expect(mockAccountRepository.findAll).toHaveBeenCalledWith(userId);
      expect(result).toEqual(mockAccounts);
      expect(result).toHaveLength(2);
    });

    it('should return empty array if user has no accounts', async () => {
      mockAccountRepository.findAll.mockResolvedValue([]);

      const result = await accountService.getAll('user-123');

      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });
  });
});
