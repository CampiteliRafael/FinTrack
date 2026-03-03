import { Account } from '../../accounts/types/account.types';
import { Category } from '../../categories/types/category.types';

export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  userId: string;
  accountId: string;
  categoryId: string;
  type: TransactionType;
  amount: number;
  description: string | null;
  date: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  account?: Account;
  category?: Category;
}

export interface CreateTransactionDTO {
  type: TransactionType;
  amount: number;
  description?: string;
  date: string;
  accountId: string;
  categoryId: string;
}

export interface UpdateTransactionDTO {
  type?: TransactionType;
  amount?: number;
  description?: string;
  date?: string;
  accountId?: string;
  categoryId?: string;
}

export interface TransactionFilters {
  type?: TransactionType;
  accountId?: string;
  categoryId?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
