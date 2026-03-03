import { TransactionType } from '@prisma/client';

export interface CreateTransactionDTO {
  type: TransactionType;
  amount: number;
  description?: string;
  date: Date;
  accountId: string;
  categoryId: string;
}

export interface UpdateTransactionDTO {
  type?: TransactionType;
  amount?: number;
  description?: string;
  date?: Date;
  accountId?: string;
  categoryId?: string;
}

export interface TransactionFilters {
  type?: TransactionType;
  accountId?: string;
  categoryId?: string;
  startDate?: Date;
  endDate?: Date;
  page?: number;
  limit?: number;
}
