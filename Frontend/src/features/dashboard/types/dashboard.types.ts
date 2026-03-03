import { Transaction } from '../../transactions/types/transaction.types';

export interface DashboardSummary {
  income: number;
  expense: number;
  balance: number;
  totalBalance: number;
  transactionCount: number;
}

export interface CategoryStats {
  category: string;
  color: string;
  icon: string;
  total: number;
  count: number;
}
