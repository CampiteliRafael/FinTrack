import prisma from '../../../config/database';
import { IAccountRepository } from '../../../core/interfaces/IAccountRepository';
import { Account } from '../../../core/entities/Account';
import { AccountMapper } from '../mappers/AccountMapper';
import { v4 as uuidv4 } from 'uuid';

export class AccountRepositoryImpl implements IAccountRepository {
  async findById(id: string, userId: string): Promise<Account | null> {
    const raw = await prisma.account.findFirst({
      where: { id, userId, deletedAt: null },
    });

    return raw ? AccountMapper.toDomain(raw) : null;
  }

  async findAll(userId: string): Promise<Account[]> {
    const raw = await prisma.account.findMany({
      where: { userId, deletedAt: null },
      orderBy: { createdAt: 'desc' },
    });

    return raw.map(AccountMapper.toDomain);
  }

  async create(
    account: Omit<Account, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>
  ): Promise<Account> {
    const raw = await prisma.account.create({
      data: {
        id: uuidv4(),
        userId: account.userId,
        name: account.name,
        initialBalance: account.initialBalance,
        type: account.type,
      },
    });

    return AccountMapper.toDomain(raw);
  }

  async update(id: string, data: Partial<Account>): Promise<Account> {
    const raw = await prisma.account.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.type && { type: data.type }),
      },
    });

    return AccountMapper.toDomain(raw);
  }

  async softDelete(id: string): Promise<void> {
    await prisma.account.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
