import prisma from '../../config/database';

export class DashboardService {
  async getSummary(userId: string) {
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const [transactions, accounts] = await Promise.all([
      prisma.transaction.findMany({
        where: {
          userId,
          deletedAt: null,
          date: {
            gte: firstDayOfMonth,
            lte: lastDayOfMonth,
          },
        },
      }),
      prisma.account.findMany({
        where: {
          userId,
          deletedAt: null,
        },
      }),
    ]);

    const income = transactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const expense = transactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const monthBalance = income - expense;

    // Saldo total real de todas as contas
    const totalBalance = accounts.reduce((sum, account) => sum + Number(account.currentBalance), 0);

    return {
      income,
      expense,
      balance: monthBalance,
      totalBalance,
      transactionCount: transactions.length,
    };
  }

  async getByCategory(userId: string) {
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const transactions = await prisma.transaction.findMany({
      where: {
        userId,
        deletedAt: null,
        date: {
          gte: firstDayOfMonth,
          lte: lastDayOfMonth,
        },
      },
      include: {
        category: true,
      },
    });

    const byCategory = transactions.reduce(
      (acc, transaction) => {
        const categoryName = transaction.category.name;
        const amount = Number(transaction.amount);

        if (!acc[categoryName]) {
          acc[categoryName] = {
            category: categoryName,
            color: transaction.category.color,
            icon: transaction.category.icon,
            total: 0,
            count: 0,
          };
        }

        acc[categoryName].total += amount;
        acc[categoryName].count += 1;

        return acc;
      },
      {} as Record<string, any>
    );

    return Object.values(byCategory);
  }

  async getRecent(userId: string) {
    return prisma.transaction.findMany({
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
  }
}
