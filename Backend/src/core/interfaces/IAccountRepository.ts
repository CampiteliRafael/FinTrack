import { Account } from '../entities/Account';

export interface IAccountRepository {
  findById(id: string, userId: string): Promise<Account | null>;
  findAll(userId: string): Promise<Account[]>;
  create(account: Omit<Account, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>): Promise<Account>;
  update(id: string, account: Partial<Account>): Promise<Account>;
  softDelete(id: string): Promise<void>;
}
