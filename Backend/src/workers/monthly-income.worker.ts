import { Worker } from 'bullmq';
import { queueConnection } from '../queues/queue.config';
import prisma from '../config/database';

/**
 * Worker para processar receitas mensais automáticas
 * Roda diariamente verificando contas com receita mensal configurada
 */
export const monthlyIncomeWorker = new Worker(
  'monthly-income',
  async (job) => {
    const { type } = job.data;

    switch (type) {
      case 'process-monthly-incomes':
        return await processMonthlyIncomes();

      default:
        throw new Error(`Unknown job type: ${type}`);
    }
  },
  {
    connection: queueConnection,
    concurrency: 1,
  }
);

/**
 * Processa todas as receitas mensais que devem ser criadas hoje
 */
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

      const newBalance = account.currentBalance.toNumber() + account.monthlyIncome!.toNumber();

      await prisma.account.update({
        where: { id: account.id },
        data: {
          currentBalance: newBalance,
          availableBalance: newBalance,
          lastTransactionAt: today,
        },
      });

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
        amount: account.monthlyIncome!.toNumber(),
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

monthlyIncomeWorker.on('failed', (job, err) => {
  console.error(`[MONTHLY INCOME] Job ${job?.id} falhou:`, err.message);
});

monthlyIncomeWorker.on('error', (err) => {
  console.error('[MONTHLY INCOME] Worker error:', err);
});
