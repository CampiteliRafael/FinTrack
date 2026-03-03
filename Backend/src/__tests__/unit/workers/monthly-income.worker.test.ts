import prisma from '../../../config/database';

// Mock Prisma
jest.mock('../../../config/database', () => ({
  __esModule: true,
  default: {
    account: {
      findMany: jest.fn(),
      update: jest.fn(),
    },
    transaction: {
      findFirst: jest.fn(),
      create: jest.fn(),
    },
    category: {
      findFirst: jest.fn(),
      create: jest.fn(),
    },
    accountEvent: {
      create: jest.fn(),
    },
  },
}));

describe('Monthly Income Worker Logic', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('processMonthlyIncomes', () => {
    // Simular a função principal do worker
    async function processMonthlyIncomes() {
      const today = new Date();
      const currentDay = today.getDate();
      const currentMonth = today.getMonth();
      const currentYear = today.getFullYear();

      const accounts = await prisma.account.findMany({
        where: {
          monthlyIncome: {
            not: null,
            gt: 0,
          },
          monthlyIncomeDay: currentDay,
          deletedAt: null,
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
            },
          },
        },
      });

      if (accounts.length === 0) {
        return {
          processedAccounts: 0,
          createdTransactions: 0,
        };
      }

      const results = [];

      for (const account of accounts) {
        try {
          // Check if already processed this month
          const startOfMonth = new Date(currentYear, currentMonth, 1);
          const endOfMonth = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59);

          const existingTransaction = await prisma.transaction.findFirst({
            where: {
              accountId: account.id,
              type: 'income',
              description: {
                contains: '[Receita Mensal Automática]',
              },
              date: {
                gte: startOfMonth,
                lte: endOfMonth,
              },
            },
          });

          if (existingTransaction) {
            continue;
          }

          // Find or create category
          let category = await prisma.category.findFirst({
            where: {
              userId: account.userId,
              name: 'Receita Mensal Fixa',
            },
          });

          if (!category) {
            category = await prisma.category.create({
              data: {
                userId: account.userId,
                name: 'Receita Mensal Fixa',
                color: '#10b981',
                icon: '💰',
              },
            });
          }

          // Create transaction
          const transaction = await prisma.transaction.create({
            data: {
              userId: account.userId,
              accountId: account.id,
              categoryId: category.id,
              type: 'income',
              amount: account.monthlyIncome!,
              description: `[Receita Mensal Automática] ${account.name}`,
              date: today,
            },
          });

          // Update account balance
          const newBalance = Number(account.currentBalance) + Number(account.monthlyIncome!);

          await prisma.account.update({
            where: { id: account.id },
            data: {
              currentBalance: newBalance,
              availableBalance: newBalance,
              lastTransactionAt: today,
            },
          });

          // Create account event
          await prisma.accountEvent.create({
            data: {
              accountId: account.id,
              type: 'transaction_income',
              amount: account.monthlyIncome!,
              transactionId: transaction.id,
              description: 'Receita mensal automática',
              balanceBefore: account.currentBalance,
              balanceAfter: newBalance,
            },
          });

          results.push({
            accountId: account.id,
            accountName: account.name,
            amount: Number(account.monthlyIncome!),
            transactionId: transaction.id,
          });
        } catch (error) {
          console.error(`Erro ao processar receita mensal da conta ${account.id}:`, error);
        }
      }

      return {
        processedAccounts: accounts.length,
        createdTransactions: results.length,
        transactions: results,
      };
    }

    it('should process monthly income for accounts on the correct day', async () => {
      const today = new Date();
      const currentDay = today.getDate();

      const mockAccounts = [
        {
          id: 'account-1',
          name: 'Nubank - Salário',
          userId: 'user-1',
          monthlyIncome: 5000.00,
          monthlyIncomeDay: currentDay,
          currentBalance: 1000.00,
          user: {
            id: 'user-1',
            email: 'user@example.com',
          },
        },
      ];

      const mockCategory = {
        id: 'category-123',
        name: 'Receita Mensal Fixa',
        userId: 'user-1',
      };

      const mockTransaction = {
        id: 'transaction-123',
        accountId: 'account-1',
        amount: 5000.00,
      };

      (prisma.account.findMany as jest.Mock).mockResolvedValue(mockAccounts);
      (prisma.transaction.findFirst as jest.Mock).mockResolvedValue(null); // No existing transaction
      (prisma.category.findFirst as jest.Mock).mockResolvedValue(mockCategory);
      (prisma.transaction.create as jest.Mock).mockResolvedValue(mockTransaction);
      (prisma.account.update as jest.Mock).mockResolvedValue({});
      (prisma.accountEvent.create as jest.Mock).mockResolvedValue({});

      const result = await processMonthlyIncomes();

      expect(prisma.account.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            monthlyIncome: expect.objectContaining({
              not: null,
              gt: 0,
            }),
            monthlyIncomeDay: currentDay,
          }),
        })
      );

      expect(prisma.transaction.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            type: 'income',
            amount: 5000.00,
            description: expect.stringContaining('[Receita Mensal Automática]'),
          }),
        })
      );

      expect(prisma.account.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'account-1' },
          data: expect.objectContaining({
            currentBalance: 6000.00, // 1000 + 5000
            availableBalance: 6000.00,
          }),
        })
      );

      expect(result).toEqual({
        processedAccounts: 1,
        createdTransactions: 1,
        transactions: [
          {
            accountId: 'account-1',
            accountName: 'Nubank - Salário',
            amount: 5000.00,
            transactionId: 'transaction-123',
          },
        ],
      });
    });

    it('should skip if transaction already exists for this month', async () => {
      const today = new Date();
      const currentDay = today.getDate();

      const mockAccounts = [
        {
          id: 'account-1',
          name: 'Nubank',
          userId: 'user-1',
          monthlyIncome: 5000.00,
          monthlyIncomeDay: currentDay,
          currentBalance: 1000.00,
          user: { id: 'user-1', email: 'user@example.com' },
        },
      ];

      (prisma.account.findMany as jest.Mock).mockResolvedValue(mockAccounts);
      (prisma.transaction.findFirst as jest.Mock).mockResolvedValue({
        id: 'existing-transaction',
      }); // Transaction already exists

      const result = await processMonthlyIncomes();

      expect(prisma.transaction.create).not.toHaveBeenCalled();
      expect(prisma.account.update).not.toHaveBeenCalled();

      expect(result).toEqual({
        processedAccounts: 1,
        createdTransactions: 0,
        transactions: [],
      });
    });

    it('should create category if it does not exist', async () => {
      const today = new Date();
      const currentDay = today.getDate();

      const mockAccounts = [
        {
          id: 'account-1',
          name: 'Nubank',
          userId: 'user-1',
          monthlyIncome: 3000.00,
          monthlyIncomeDay: currentDay,
          currentBalance: 500.00,
          user: { id: 'user-1', email: 'user@example.com' },
        },
      ];

      const mockNewCategory = {
        id: 'new-category-123',
        name: 'Receita Mensal Fixa',
        userId: 'user-1',
      };

      (prisma.account.findMany as jest.Mock).mockResolvedValue(mockAccounts);
      (prisma.transaction.findFirst as jest.Mock).mockResolvedValue(null);
      (prisma.category.findFirst as jest.Mock).mockResolvedValue(null); // Category doesn't exist
      (prisma.category.create as jest.Mock).mockResolvedValue(mockNewCategory);
      (prisma.transaction.create as jest.Mock).mockResolvedValue({ id: 'trans-123' });
      (prisma.account.update as jest.Mock).mockResolvedValue({});
      (prisma.accountEvent.create as jest.Mock).mockResolvedValue({});

      await processMonthlyIncomes();

      expect(prisma.category.create).toHaveBeenCalledWith({
        data: {
          userId: 'user-1',
          name: 'Receita Mensal Fixa',
          color: '#10b981',
          icon: '💰',
        },
      });

      expect(prisma.transaction.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            categoryId: 'new-category-123',
          }),
        })
      );
    });

    it('should return zero if no accounts to process', async () => {
      (prisma.account.findMany as jest.Mock).mockResolvedValue([]);

      const result = await processMonthlyIncomes();

      expect(result).toEqual({
        processedAccounts: 0,
        createdTransactions: 0,
      });

      expect(prisma.transaction.create).not.toHaveBeenCalled();
    });

    it('should handle errors gracefully and continue processing other accounts', async () => {
      const today = new Date();
      const currentDay = today.getDate();

      const mockAccounts = [
        {
          id: 'account-1',
          name: 'Success Account',
          userId: 'user-1',
          monthlyIncome: 2000.00,
          monthlyIncomeDay: currentDay,
          currentBalance: 1000.00,
          user: { id: 'user-1', email: 'user@example.com' },
        },
        {
          id: 'account-2',
          name: 'Fail Account',
          userId: 'user-2',
          monthlyIncome: 3000.00,
          monthlyIncomeDay: currentDay,
          currentBalance: 500.00,
          user: { id: 'user-2', email: 'user2@example.com' },
        },
      ];

      (prisma.account.findMany as jest.Mock).mockResolvedValue(mockAccounts);
      (prisma.transaction.findFirst as jest.Mock).mockResolvedValue(null);
      (prisma.category.findFirst as jest.Mock).mockResolvedValue({ id: 'cat-123' });
      (prisma.transaction.create as jest.Mock)
        .mockResolvedValueOnce({ id: 'trans-1' }) // Success for first
        .mockRejectedValueOnce(new Error('Database error')); // Fail for second

      const result = await processMonthlyIncomes();

      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining('account-2'),
        expect.any(Error)
      );

      expect(result.processedAccounts).toBe(2);
      expect(result.createdTransactions).toBeLessThan(2);
    });
  });
});
