import prisma from '../../../config/database';
import { ITransactionRepository } from '../../../core/interfaces/ITransactionRepository';
import { Transaction } from '../../../core/entities/Transaction';
import { TransactionMapper } from '../mappers/TransactionMapper';
import { Prisma } from '@prisma/client';

export class TransactionRepositoryImpl implements ITransactionRepository {
  async findById(id: string, userId: string): Promise<Transaction | null> {
    const raw = await prisma.transaction.findFirst({
      where: { id, userId, deletedAt: null },
    });

    return raw ? TransactionMapper.toDomain(raw) : null;
  }

  async findAll(userId: string, filters: any) {
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
}
