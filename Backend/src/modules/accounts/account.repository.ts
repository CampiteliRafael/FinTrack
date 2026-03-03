import prisma from '../../config/database';
import { Account, Prisma } from '@prisma/client';

export class AccountRepository {
  async findAll(userId: string): Promise<Account[]> {
    return prisma.account.findMany({
      where: {
        userId,
        deletedAt: null,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string, userId: string): Promise<Account | null> {
    return prisma.account.findFirst({
      where: { id, userId, deletedAt: null },
    });
  }

  async create(data: Prisma.AccountCreateInput): Promise<Account> {
    return prisma.$transaction(async (tx) => {
      const account = await tx.account.create({
        data: {
          ...data,
          currentBalance: data.initialBalance || 0,
          availableBalance: data.initialBalance || 0,
          reservedAmount: 0,
        },
      });

      // 2. Criar evento de saldo inicial se houver saldo
      if (Number(data.initialBalance || 0) !== 0) {
        await tx.accountEvent.create({
          data: {
            accountId: account.id,
            type: 'initial_balance',
            amount: data.initialBalance || 0,
            description: 'Saldo inicial da conta',
            balanceBefore: 0,
            balanceAfter: data.initialBalance || 0,
          },
        });
      }

      return account;
    });
  }

  async update(id: string, data: Prisma.AccountUpdateInput): Promise<Account> {
    return prisma.account.update({
      where: { id },
      data,
    });
  }

  async softDelete(id: string): Promise<void> {
    await prisma.account.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async updateWithBalanceAdjustment(
    id: string,
    oldAccount: { currentBalance: number | { toNumber(): number } },
    newBalance: number
  ): Promise<unknown> {
    return prisma.$transaction(async (tx) => {
      const balanceBefore = Number(oldAccount.currentBalance);
      const balanceAfter = newBalance;
      const adjustment = balanceAfter - balanceBefore;

      // Criar evento de ajuste manual
      await tx.accountEvent.create({
        data: {
          accountId: id,
          type: 'adjustment',
          amount: adjustment,
          description: 'Ajuste manual de saldo',
          balanceBefore,
          balanceAfter,
        },
      });

      // Atualizar saldo da conta
      return tx.account.update({
        where: { id },
        data: {
          currentBalance: balanceAfter,
          availableBalance: balanceAfter,
        },
      });
    });
  }
}
