import prisma from '../../../config/database';
import { ITransactionRepository, TransactionWithRelations, TransactionFilters } from '../../../core/interfaces/ITransactionRepository';
import { Transaction } from '../../../core/entities/Transaction';
import { TransactionMapper } from '../mappers/TransactionMapper';
import { Prisma, TransactionType } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

export class TransactionRepositoryImpl implements ITransactionRepository {
  async findById(id: string, userId: string): Promise<Transaction | null> {
    const raw = await prisma.transaction.findFirst({
      where: { id, userId, deletedAt: null },
    });

    return raw ? TransactionMapper.toDomain(raw) : null;
  }

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
      }),
      prisma.transaction.count({ where }),
    ]);

    return {
      data: transactions.map(TransactionMapper.toDomain),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async create(transaction: Transaction): Promise<Transaction> {
    const raw = await prisma.transaction.create({
      data: {
        id: transaction.id,
        userId: transaction.userId,
        accountId: transaction.accountId,
        categoryId: transaction.categoryId,
        type: transaction.type,
        amount: transaction.amount,
        description: transaction.description,
        date: transaction.date,
      },
    });

    return TransactionMapper.toDomain(raw);
  }

  async update(id: string, data: Partial<Transaction>): Promise<Transaction> {
    const raw = await prisma.transaction.update({
      where: { id },
      data: {
        ...(data.type && { type: data.type }),
        ...(data.amount !== undefined && { amount: data.amount }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.date && { date: data.date }),
        ...(data.accountId && { accountId: data.accountId }),
        ...(data.categoryId && { categoryId: data.categoryId }),
      },
    });

    return TransactionMapper.toDomain(raw);
  }

  async softDelete(id: string): Promise<void> {
    await prisma.transaction.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async findByIdWithRelations(id: string, userId: string): Promise<TransactionWithRelations | null> {
    const raw = await prisma.transaction.findFirst({
      where: { id, userId, deletedAt: null },
      include: {
        account: true,
        category: true,
      },
    });

    if (!raw) return null;

    const transaction = TransactionMapper.toDomain(raw);
    return {
      ...transaction,
      account: {
        id: raw.account.id,
        currentBalance: raw.account.currentBalance.toNumber(),
      },
      category: {
        id: raw.category.id,
        name: raw.category.name,
      },
    } as TransactionWithRelations;
  }

  async findAllWithRelations(userId: string, filters: TransactionFilters): Promise<{ data: TransactionWithRelations[]; meta: any }> {
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
      data: transactions.map((raw) => {
        const transaction = TransactionMapper.toDomain(raw);
        return {
          ...transaction,
          account: {
            id: raw.account.id,
            currentBalance: raw.account.currentBalance.toNumber(),
          },
          category: {
            id: raw.category.id,
            name: raw.category.name,
          },
        } as TransactionWithRelations;
      }),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async createWithBalanceUpdate(
    transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>,
    accountId: string,
    type: TransactionType,
    amount: number
  ): Promise<Transaction> {
    const raw = await prisma.$transaction(async (tx) => {
      // 1. Buscar saldo atual da conta
      const account = await tx.account.findUniqueOrThrow({
        where: { id: accountId },
      });

      const balanceBefore = Number(account.currentBalance);
      const balanceAfter = type === 'income' ? balanceBefore + amount : balanceBefore - amount;

      // 2. Criar a transação
      const createdTransaction = await tx.transaction.create({
        data: {
          id: uuidv4(),
          userId: transaction.userId,
          accountId: transaction.accountId,
          categoryId: transaction.categoryId,
          type: transaction.type,
          amount: transaction.amount,
          description: transaction.description,
          date: transaction.date,
        },
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
          transactionId: createdTransaction.id,
          description: createdTransaction.description || `Transação ${type}`,
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
          lastTransactionAt: createdTransaction.date,
        },
      });

      return createdTransaction;
    });

    return TransactionMapper.toDomain(raw);
  }

  async updateWithBalanceUpdate(
    id: string,
    oldTransaction: TransactionWithRelations,
    updates: Partial<Transaction>,
    newAmount?: number,
    newType?: TransactionType,
    newAccountId?: string
  ): Promise<Transaction> {
    const raw = await prisma.$transaction(async (tx) => {
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
      const updatedTransaction = await tx.transaction.update({
        where: { id },
        data: {
          ...(updates.type && { type: updates.type }),
          ...(updates.amount !== undefined && { amount: updates.amount }),
          ...(updates.description !== undefined && { description: updates.description }),
          ...(updates.date && { date: updates.date }),
          ...(updates.accountId && { accountId: updates.accountId }),
          ...(updates.categoryId && { categoryId: updates.categoryId }),
        },
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
          lastTransactionAt: updatedTransaction.date,
        },
      });

      return updatedTransaction;
    });

    return TransactionMapper.toDomain(raw);
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
