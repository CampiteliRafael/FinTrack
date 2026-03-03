import { Account as PrismaAccount } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import { Account } from '../../../core/entities/Account';

export class AccountMapper {
  static toDomain(raw: PrismaAccount): Account {
    return new Account(
      raw.id,
      raw.userId,
      raw.name,
      Number(raw.initialBalance),
      raw.type,
      raw.createdAt,
      raw.updatedAt,
      raw.deletedAt
    );
  }

  static toPrisma(domain: Account): PrismaAccount {
    return {
      id: domain.id,
      userId: domain.userId,
      name: domain.name,
      initialBalance: new Decimal(domain.initialBalance),
      currentBalance: new Decimal(domain.initialBalance),
      availableBalance: new Decimal(domain.initialBalance),
      reservedAmount: new Decimal(0),
      monthlyIncome: null,
      monthlyIncomeDay: null,
      lastTransactionAt: null,
      type: domain.type,
      createdAt: domain.createdAt,
      updatedAt: domain.updatedAt,
      deletedAt: domain.deletedAt,
    } as PrismaAccount;
  }
}
