import { Account as PrismaAccount } from '@prisma/client';
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
      initialBalance: domain.initialBalance,
      type: domain.type,
      createdAt: domain.createdAt,
      updatedAt: domain.updatedAt,
      deletedAt: domain.deletedAt,
    } as PrismaAccount;
  }
}
