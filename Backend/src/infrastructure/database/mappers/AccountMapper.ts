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
      Number(raw.currentBalance),
      Number(raw.availableBalance),
      Number(raw.reservedAmount),
      raw.type,
      raw.monthlyIncome ? Number(raw.monthlyIncome) : null,
      raw.monthlyIncomeDay,
      raw.lastTransactionAt,
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
      currentBalance: new Decimal(domain.currentBalance),
      availableBalance: new Decimal(domain.availableBalance),
      reservedAmount: new Decimal(domain.reservedAmount),
      monthlyIncome: domain.monthlyIncome ? new Decimal(domain.monthlyIncome) : null,
      monthlyIncomeDay: domain.monthlyIncomeDay,
      lastTransactionAt: domain.lastTransactionAt,
      type: domain.type,
      createdAt: domain.createdAt,
      updatedAt: domain.updatedAt,
      deletedAt: domain.deletedAt,
    } as PrismaAccount;
  }
}
