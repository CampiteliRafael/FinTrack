import { Account } from '../entities/Account';
import { AccountType } from '@prisma/client';

export type CreateAccountData = {
  userId: string;
  name: string;
  initialBalance: number;
  type: AccountType;
};

export interface IAccountRepository {
  findById(id: string, userId: string): Promise<Account | null>;
  findAll(userId: string): Promise<Account[]>;
  create(account: CreateAccountData): Promise<Account>;
  update(id: string, account: Partial<Account>): Promise<Account>;
  softDelete(id: string): Promise<void>;

  // Métodos de criação e ajuste de saldo com auditoria
  createWithInitialBalance(account: CreateAccountData): Promise<Account>;

  updateWithBalanceAdjustment(
    id: string,
    oldAccount: Account,
    newBalance: number
  ): Promise<Account>;
}
