import { Transaction as PrismaTransaction } from '@prisma/client';
import { Transaction } from '../../../core/entities/Transaction';

export class TransactionMapper {
  static toDomain(raw: PrismaTransaction): Transaction {
    return new Transaction(
      raw.id,
      raw.userId,
      raw.accountId,
      raw.categoryId,
      raw.type,
      Number(raw.amount),
      raw.description,
      raw.date,
      raw.createdAt,
      raw.updatedAt,
      raw.deletedAt
    );
  }

  static toPrisma(domain: Transaction): PrismaTransaction {
    return {
      id: domain.id,
      userId: domain.userId,
      accountId: domain.accountId,
      categoryId: domain.categoryId,
      type: domain.type,
      amount: domain.amount,
      description: domain.description,
      date: domain.date,
      createdAt: domain.createdAt,
      updatedAt: domain.updatedAt,
      deletedAt: domain.deletedAt,
    } as PrismaTransaction;
  }
}
