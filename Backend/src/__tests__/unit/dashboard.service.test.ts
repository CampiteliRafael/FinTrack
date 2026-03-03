import { DashboardService } from '../../modules/dashboard/dashboard.service';
import prisma from '../../config/database';

// Mock Prisma
jest.mock('../../config/database', () => ({
  __esModule: true,
  default: {
    transaction: {
      findMany: jest.fn(),
    },
    account: {
      findMany: jest.fn(),
    },
  },
}));

describe('DashboardService', () => {
  let dashboardService: DashboardService;

  beforeEach(() => {
    dashboardService = new DashboardService();
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('getSummary', () => {
    const userId = 'user-123';

    it('should calculate correct summary for current month', async () => {
      const mockTransactions = [
        {
          id: '1',
          type: 'income',
          amount: 5000.00,
          userId,
          date: new Date(),
          deletedAt: null,
        },
        {
          id: '2',
          type: 'expense',
          amount: 1500.00,
          userId,
          date: new Date(),
          deletedAt: null,
        },
        {
          id: '3',
          type: 'expense',
          amount: 800.00,
          userId,
          date: new Date(),
          deletedAt: null,
        },
        {
          id: '4',
          type: 'income',
          amount: 300.00,
          userId,
          date: new Date(),
          deletedAt: null,
        },
      ];

      const mockAccounts = [
        {
          id: 'account-1',
          currentBalance: 10000.00,
          userId,
          deletedAt: null,
        },
        {
          id: 'account-2',
          currentBalance: 3500.00,
          userId,
          deletedAt: null,
        },
      ];

      (prisma.transaction.findMany as jest.Mock).mockResolvedValue(mockTransactions);
      (prisma.account.findMany as jest.Mock).mockResolvedValue(mockAccounts);

      const result = await dashboardService.getSummary(userId);

      // Income: 5000 + 300 = 5300
      // Expense: 1500 + 800 = 2300
      // Balance: 5300 - 2300 = 3000
      // Total Balance: 10000 + 3500 = 13500

      expect(result).toEqual({
        income: 5300,
        expense: 2300,
        balance: 3000,
        totalBalance: 13500,
        transactionCount: 4,
      });
    });

    it('should return zero values when no transactions or accounts', async () => {
      (prisma.transaction.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.account.findMany as jest.Mock).mockResolvedValue([]);

      const result = await dashboardService.getSummary(userId);

      expect(result).toEqual({
        income: 0,
        expense: 0,
        balance: 0,
        totalBalance: 0,
        transactionCount: 0,
      });
    });

    it('should only include transactions from current month', async () => {
      const now = new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

      (prisma.transaction.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.account.findMany as jest.Mock).mockResolvedValue([]);

      await dashboardService.getSummary(userId);

      expect(prisma.transaction.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            userId,
            deletedAt: null,
            date: {
              gte: expect.any(Date),
              lte: expect.any(Date),
            },
          }),
        })
      );

      const callArgs = (prisma.transaction.findMany as jest.Mock).mock.calls[0][0];
      const dateFilter = callArgs.where.date;

      // Verify date range is correct
      expect(dateFilter.gte.getDate()).toBe(firstDayOfMonth.getDate());
      expect(dateFilter.lte.getDate()).toBe(lastDayOfMonth.getDate());
    });

    it('should handle negative balance correctly', async () => {
      const mockTransactions = [
        {
          id: '1',
          type: 'income',
          amount: 1000.00,
          userId,
          date: new Date(),
          deletedAt: null,
        },
        {
          id: '2',
          type: 'expense',
          amount: 3000.00,
          userId,
          date: new Date(),
          deletedAt: null,
        },
      ];

      const mockAccounts = [
        {
          id: 'account-1',
          currentBalance: 500.00,
          userId,
          deletedAt: null,
        },
      ];

      (prisma.transaction.findMany as jest.Mock).mockResolvedValue(mockTransactions);
      (prisma.account.findMany as jest.Mock).mockResolvedValue(mockAccounts);

      const result = await dashboardService.getSummary(userId);

      expect(result.balance).toBe(-2000); // 1000 - 3000
      expect(result.totalBalance).toBe(500);
    });
  });

  describe('getByCategory', () => {
    const userId = 'user-123';

    it('should aggregate transactions by category', async () => {
      const mockTransactions = [
        {
          id: '1',
          type: 'expense',
          amount: 500.00,
          userId,
          date: new Date(),
          deletedAt: null,
          category: {
            name: 'Alimentação',
            color: '#ff5722',
            icon: '🍔',
          },
        },
        {
          id: '2',
          type: 'expense',
          amount: 300.00,
          userId,
          date: new Date(),
          deletedAt: null,
          category: {
            name: 'Alimentação',
            color: '#ff5722',
            icon: '🍔',
          },
        },
        {
          id: '3',
          type: 'expense',
          amount: 1000.00,
          userId,
          date: new Date(),
          deletedAt: null,
          category: {
            name: 'Transporte',
            color: '#2196f3',
            icon: '🚗',
          },
        },
      ];

      (prisma.transaction.findMany as jest.Mock).mockResolvedValue(mockTransactions);

      const result = await dashboardService.getByCategory(userId);

      expect(result).toEqual([
        {
          category: 'Alimentação',
          color: '#ff5722',
          icon: '🍔',
          total: 800,
          count: 2,
        },
        {
          category: 'Transporte',
          color: '#2196f3',
          icon: '🚗',
          total: 1000,
          count: 1,
        },
      ]);
    });

    it('should return empty array if no transactions', async () => {
      (prisma.transaction.findMany as jest.Mock).mockResolvedValue([]);

      const result = await dashboardService.getByCategory(userId);

      expect(result).toEqual([]);
    });

    it('should only include current month transactions', async () => {
      (prisma.transaction.findMany as jest.Mock).mockResolvedValue([]);

      await dashboardService.getByCategory(userId);

      expect(prisma.transaction.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            userId,
            deletedAt: null,
            date: {
              gte: expect.any(Date),
              lte: expect.any(Date),
            },
          }),
          include: {
            category: true,
          },
        })
      );
    });
  });

  describe('getRecent', () => {
    const userId = 'user-123';

    it('should return 10 most recent transactions', async () => {
      const mockTransactions = Array.from({ length: 10 }, (_, i) => ({
        id: `transaction-${i}`,
        type: 'expense',
        amount: 100 * (i + 1),
        userId,
        date: new Date(Date.now() - i * 24 * 60 * 60 * 1000), // Different dates
        deletedAt: null,
        account: {
          id: 'account-1',
          name: 'Nubank',
        },
        category: {
          id: 'category-1',
          name: 'Diversos',
        },
      }));

      (prisma.transaction.findMany as jest.Mock).mockResolvedValue(mockTransactions);

      const result = await dashboardService.getRecent(userId);

      expect(prisma.transaction.findMany).toHaveBeenCalledWith({
        where: {
          userId,
          deletedAt: null,
        },
        take: 10,
        orderBy: { date: 'desc' },
        include: {
          account: true,
          category: true,
        },
      });

      expect(result).toHaveLength(10);
      expect(result).toEqual(mockTransactions);
    });

    it('should return empty array if no transactions', async () => {
      (prisma.transaction.findMany as jest.Mock).mockResolvedValue([]);

      const result = await dashboardService.getRecent(userId);

      expect(result).toEqual([]);
    });

    it('should include account and category relations', async () => {
      const mockTransactions = [
        {
          id: '1',
          type: 'income',
          amount: 5000.00,
          userId,
          date: new Date(),
          deletedAt: null,
          account: {
            id: 'account-1',
            name: 'Nubank',
            type: 'checking',
          },
          category: {
            id: 'category-1',
            name: 'Salário',
            color: '#4caf50',
            icon: '💰',
          },
        },
      ];

      (prisma.transaction.findMany as jest.Mock).mockResolvedValue(mockTransactions);

      const result = await dashboardService.getRecent(userId);

      expect(result[0]).toHaveProperty('account');
      expect(result[0]).toHaveProperty('category');
      expect(result[0].account.name).toBe('Nubank');
      expect(result[0].category.name).toBe('Salário');
    });
  });
});
