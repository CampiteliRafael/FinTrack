import prisma from '../../../config/database';

// Mock Prisma
jest.mock('../../../config/database', () => ({
  __esModule: true,
  default: {
    user: {
      findMany: jest.fn(),
      delete: jest.fn(),
    },
    transaction: {
      deleteMany: jest.fn(),
    },
  },
}));

describe('Cleanup Worker Logic', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('deleteExpiredUsers', () => {
    // Simular a função do worker
    async function deleteExpiredUsers() {
      const twentyFourHoursAgo = new Date();
      twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

      const expiredUsers = await prisma.user.findMany({
        where: {
          createdAt: {
            lt: twentyFourHoursAgo,
          },
          email: {
            not: 'campitelir8@gmail.com',
          },
        },
        select: {
          id: true,
          email: true,
          name: true,
          createdAt: true,
        },
      });

      if (expiredUsers.length === 0) {
        return {
          deletedUsers: 0,
          users: [],
        };
      }

      const deletedUsers: string[] = [];

      for (const user of expiredUsers) {
        try {
          await prisma.user.delete({
            where: { id: user.id },
          });
          deletedUsers.push(user.email);
        } catch (error) {
          console.error(`[CLEANUP] Erro ao deletar usuário ${user.email}:`, error);
        }
      }

      return {
        deletedUsers: deletedUsers.length,
        users: deletedUsers,
      };
    }

    it('should delete users older than 24 hours', async () => {
      const mockExpiredUsers = [
        {
          id: 'user-1',
          email: 'expired1@example.com',
          name: 'User 1',
          createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000), // 48 hours ago
        },
        {
          id: 'user-2',
          email: 'expired2@example.com',
          name: 'User 2',
          createdAt: new Date(Date.now() - 25 * 60 * 60 * 1000), // 25 hours ago
        },
      ];

      (prisma.user.findMany as jest.Mock).mockResolvedValue(mockExpiredUsers);
      (prisma.user.delete as jest.Mock).mockResolvedValue({});

      const result = await deleteExpiredUsers();

      expect(prisma.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            createdAt: expect.objectContaining({
              lt: expect.any(Date),
            }),
            email: {
              not: 'campitelir8@gmail.com',
            },
          }),
        })
      );

      expect(prisma.user.delete).toHaveBeenCalledTimes(2);
      expect(prisma.user.delete).toHaveBeenCalledWith({ where: { id: 'user-1' } });
      expect(prisma.user.delete).toHaveBeenCalledWith({ where: { id: 'user-2' } });

      expect(result).toEqual({
        deletedUsers: 2,
        users: ['expired1@example.com', 'expired2@example.com'],
      });
    });

    it('should not delete protected user (campitelir8@gmail.com)', async () => {
      const mockUsers = [
        {
          id: 'user-1',
          email: 'expired1@example.com',
          name: 'User 1',
          createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000),
        },
      ];

      (prisma.user.findMany as jest.Mock).mockResolvedValue(mockUsers);
      (prisma.user.delete as jest.Mock).mockResolvedValue({});

      await deleteExpiredUsers();

      // Verify the query excludes protected email
      expect(prisma.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            email: {
              not: 'campitelir8@gmail.com',
            },
          }),
        })
      );
    });

    it('should return zero if no expired users', async () => {
      (prisma.user.findMany as jest.Mock).mockResolvedValue([]);

      const result = await deleteExpiredUsers();

      expect(result).toEqual({
        deletedUsers: 0,
        users: [],
      });
      expect(prisma.user.delete).not.toHaveBeenCalled();
    });

    it('should handle deletion errors gracefully', async () => {
      const mockExpiredUsers = [
        {
          id: 'user-1',
          email: 'success@example.com',
          name: 'User 1',
          createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000),
        },
        {
          id: 'user-2',
          email: 'fail@example.com',
          name: 'User 2',
          createdAt: new Date(Date.now() - 25 * 60 * 60 * 1000),
        },
      ];

      (prisma.user.findMany as jest.Mock).mockResolvedValue(mockExpiredUsers);
      (prisma.user.delete as jest.Mock)
        .mockResolvedValueOnce({}) // Success for first user
        .mockRejectedValueOnce(new Error('Database error')); // Fail for second user

      const result = await deleteExpiredUsers();

      expect(prisma.user.delete).toHaveBeenCalledTimes(2);
      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining('fail@example.com'),
        expect.any(Error)
      );

      expect(result).toEqual({
        deletedUsers: 1,
        users: ['success@example.com'],
      });
    });
  });

  describe('deleteOldTransactions', () => {
    // Simular a função do worker
    async function deleteOldTransactions() {
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

      const result = await prisma.transaction.deleteMany({
        where: {
          createdAt: {
            lt: oneYearAgo,
          },
          user: {
            updatedAt: {
              lt: sixMonthsAgo,
            },
          },
        },
      });

      return {
        deletedTransactions: result.count,
      };
    }

    it('should delete transactions older than 1 year from inactive users', async () => {
      (prisma.transaction.deleteMany as jest.Mock).mockResolvedValue({ count: 150 });

      const result = await deleteOldTransactions();

      expect(prisma.transaction.deleteMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            createdAt: expect.objectContaining({
              lt: expect.any(Date),
            }),
            user: expect.objectContaining({
              updatedAt: expect.objectContaining({
                lt: expect.any(Date),
              }),
            }),
          }),
        })
      );

      expect(result).toEqual({
        deletedTransactions: 150,
      });
    });

    it('should return zero if no old transactions', async () => {
      (prisma.transaction.deleteMany as jest.Mock).mockResolvedValue({ count: 0 });

      const result = await deleteOldTransactions();

      expect(result).toEqual({
        deletedTransactions: 0,
      });
    });
  });
});
