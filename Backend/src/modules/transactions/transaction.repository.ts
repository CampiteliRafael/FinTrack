import prisma from '../../config/database';
import { Transaction, Prisma } from '@prisma/client';
import { TransactionFilters } from './transaction.types';

// Tipo para transação com relacionamentos incluídos
export type TransactionWithRelations = Transaction & {
  account: { currentBalance: number | { toNumber(): number } };
  category: { name: string };
};

export class TransactionRepository {
  async findAll(userId: string, filters: TransactionFilters) {
    const { page = 1, limit = 20, type, accountId, categoryId, startDate, endDate } = filters;
    const skip = (page - 1) * limit;

    const where: Prisma.TransactionWhereInput = {
      userId,
      deletedAt: null,
      ...(type && { type }),
      ...(accountId && { accountId }),
      ...(categoryId && { categoryId }),
      ...(startDate || endDate
        ? {
            date: {
              ...(startDate && { gte: startDate }),
              ...(endDate && { lte: endDate }),
            },
          }
        : {}),
    };

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        skip,
        take: limit,
        orderBy: { date: 'desc' },
        include: {
          account: true,
          category: true,
        },
      }),
      prisma.transaction.count({ where }),
    ]);

    return {
      data: transactions,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findById(id: string, userId: string): Promise<TransactionWithRelations | null> {
    return prisma.transaction.findFirst({
      where: { id, userId, deletedAt: null },
      include: {
        account: true,
        category: true,
      },
    }) as Promise<TransactionWithRelations | null>;
  }

  async create(data: Prisma.TransactionCreateInput): Promise<Transaction> {
    return prisma.transaction.create({
      data,
      include: {
        account: true,
        category: true,
      },
    });
  }

  async createWithBalanceUpdate(
    transactionData: Prisma.TransactionCreateInput,
    accountId: string,
    type: 'income' | 'expense',
    amount: number
  ): Promise<Transaction> {
    return prisma.$transaction(async (tx) => {
      // 1. Buscar saldo atual da conta
      const account = await tx.account.findUniqueOrThrow({
        where: { id: accountId },
      });

      const balanceBefore = Number(account.currentBalance);
      const balanceAfter = type === 'income' ? balanceBefore + amount : balanceBefore - amount;

      // 2. Criar a transação
      const transaction = await tx.transaction.create({
        data: transactionData,
        include: {
          account: true,
          category: true,
        },
      });

      // 3. Criar evento de conta
      await tx.accountEvent.create({
        data: {
          accountId,
          type: type === 'income' ? 'transaction_income' : 'transaction_expense',
          amount,
          transactionId: transaction.id,
          description: transaction.description || `Transação ${type}`,
          balanceBefore,
          balanceAfter,
        },
      });

      // 4. Atualizar saldo da conta
      await tx.account.update({
        where: { id: accountId },
        data: {
          currentBalance: balanceAfter,
          availableBalance: balanceAfter,
          lastTransactionAt: transaction.date,
        },
      });

      return transaction;
    });
  }

  async update(id: string, data: Prisma.TransactionUpdateInput): Promise<Transaction> {
    return prisma.transaction.update({
      where: { id },
      data,
      include: {
        account: true,
        category: true,
      },
    });
  }

  async updateWithBalanceUpdate(
    id: string,
    oldTransaction: Transaction & { account: { currentBalance: number | { toNumber(): number } } },
    updateData: Prisma.TransactionUpdateInput,
    newAmount?: number,
    newType?: 'income' | 'expense',
    newAccountId?: string
  ): Promise<Transaction> {
    return prisma.$transaction(async (tx) => {
      const oldAmount = Number(oldTransaction.amount);
      const oldType = oldTransaction.type;
      const oldAccountId = oldTransaction.accountId;

      // Se mudou de conta, reverter saldo da conta antiga
      if (newAccountId && newAccountId !== oldAccountId) {
        const oldAccount = await tx.account.findUniqueOrThrow({
          where: { id: oldAccountId },
        });
        const oldBalanceBefore = Number(oldAccount.currentBalance);
        const oldBalanceAfter =
          oldType === 'income' ? oldBalanceBefore - oldAmount : oldBalanceBefore + oldAmount;

        await tx.accountEvent.create({
          data: {
            accountId: oldAccountId,
            type: 'adjustment',
            amount: -oldAmount,
            transactionId: id,
            description: 'Ajuste por alteração de transação',
            balanceBefore: oldBalanceBefore,
            balanceAfter: oldBalanceAfter,
          },
        });

        await tx.account.update({
          where: { id: oldAccountId },
          data: {
            currentBalance: oldBalanceAfter,
            availableBalance: oldBalanceAfter,
          },
        });
      }

      // Calcular impacto na conta (nova ou mesma)
      const targetAccountId = newAccountId || oldAccountId;
      const finalAmount = newAmount !== undefined ? newAmount : oldAmount;
      const finalType = newType || oldType;

      const targetAccount = await tx.account.findUniqueOrThrow({
        where: { id: targetAccountId },
      });

      let balanceBefore = Number(targetAccount.currentBalance);

      // Se for a mesma conta e houve mudança de valor/tipo, reverter valor antigo
      if (targetAccountId === oldAccountId && (newAmount !== undefined || newType)) {
        balanceBefore =
          oldType === 'income' ? balanceBefore - oldAmount : balanceBefore + oldAmount;
      }

      const balanceAfter =
        finalType === 'income' ? balanceBefore + finalAmount : balanceBefore - finalAmount;

      // Atualizar transação
      const transaction = await tx.transaction.update({
        where: { id },
        data: updateData,
        include: {
          account: true,
          category: true,
        },
      });

      // Criar evento de ajuste
      await tx.accountEvent.create({
        data: {
          accountId: targetAccountId,
          type: 'adjustment',
          amount: finalAmount,
          transactionId: id,
          description: 'Ajuste por alteração de transação',
          balanceBefore,
          balanceAfter,
        },
      });

      // Atualizar saldo da conta
      await tx.account.update({
        where: { id: targetAccountId },
        data: {
          currentBalance: balanceAfter,
          availableBalance: balanceAfter,
          lastTransactionAt: transaction.date,
        },
      });

      return transaction;
    });
  }

  async softDelete(id: string): Promise<void> {
    await prisma.transaction.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async softDeleteWithBalanceUpdate(transaction: Transaction): Promise<void> {
    await prisma.$transaction(async (tx) => {
      const amount = Number(transaction.amount);
      const account = await tx.account.findUniqueOrThrow({
        where: { id: transaction.accountId },
      });

      const balanceBefore = Number(account.currentBalance);
      // Reverter o efeito da transação
      const balanceAfter =
        transaction.type === 'income' ? balanceBefore - amount : balanceBefore + amount;

      // Marcar transação como deletada
      await tx.transaction.update({
        where: { id: transaction.id },
        data: { deletedAt: new Date() },
      });

      // Criar evento de ajuste
      await tx.accountEvent.create({
        data: {
          accountId: transaction.accountId,
          type: 'adjustment',
          amount: -amount,
          transactionId: transaction.id,
          description: 'Ajuste por exclusão de transação',
          balanceBefore,
          balanceAfter,
        },
      });

      // Atualizar saldo da conta
      await tx.account.update({
        where: { id: transaction.accountId },
        data: {
          currentBalance: balanceAfter,
          availableBalance: balanceAfter,
        },
      });
    });
  }
}
