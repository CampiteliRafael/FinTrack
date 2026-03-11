import { Transaction } from '../entities/Transaction';
import { TransactionType } from '@prisma/client';

// Tipo para transação com relacionamentos incluídos
export type TransactionWithRelations = Transaction & {
  account: {
    id: string;
    currentBalance: number;
  };
  category: {
    id: string;
    name: string;
  };
};

export interface TransactionFilters {
  type?: TransactionType;
  accountId?: string;
  categoryId?: string;
  startDate?: Date;
  endDate?: Date;
  page?: number;
  limit?: number;
}

export type CreateTransactionData = {
  userId: string;
  accountId: string;
  categoryId: string;
  type: TransactionType;
  amount: number;
  description: string | null;
  date: Date;
};

export interface ITransactionRepository {
  // Métodos básicos
  findById(id: string, userId: string): Promise<Transaction | null>;
  findAll(userId: string, filters: TransactionFilters): Promise<{ data: Transaction[]; meta: any }>;
  create(transaction: Transaction): Promise<Transaction>;
  update(id: string, transaction: Partial<Transaction>): Promise<Transaction>;
  softDelete(id: string): Promise<void>;

  // Métodos com relacionamentos
  findByIdWithRelations(id: string, userId: string): Promise<TransactionWithRelations | null>;
  findAllWithRelations(userId: string, filters: TransactionFilters): Promise<{ data: TransactionWithRelations[]; meta: any }>;

  // Métodos críticos de atualização de saldo
  createWithBalanceUpdate(
    transaction: CreateTransactionData,
    accountId: string,
    type: TransactionType,
    amount: number
  ): Promise<Transaction>;

  updateWithBalanceUpdate(
    id: string,
    oldTransaction: TransactionWithRelations,
    updates: Partial<Transaction>,
    newAmount?: number,
    newType?: TransactionType,
    newAccountId?: string
  ): Promise<Transaction>;

  softDeleteWithBalanceUpdate(transaction: Transaction): Promise<void>;
}
