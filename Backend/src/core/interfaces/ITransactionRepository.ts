import { Transaction } from '../entities/Transaction';

export interface ITransactionRepository {
  findById(id: string, userId: string): Promise<Transaction | null>;
  findAll(userId: string, filters: any): Promise<{ data: Transaction[]; meta: any }>;
  create(transaction: Transaction): Promise<Transaction>;
  update(id: string, transaction: Partial<Transaction>): Promise<Transaction>;
  softDelete(id: string): Promise<void>;
}
