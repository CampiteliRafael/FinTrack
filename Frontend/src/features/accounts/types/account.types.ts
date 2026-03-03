export type AccountType = 'checking' | 'savings' | 'cash';

export interface Account {
  id: string;
  userId: string;
  name: string;
  initialBalance: number;
  currentBalance: number;
  availableBalance: number;
  reservedAmount: number;
  lastTransactionAt: string | null;
  type: AccountType;
  monthlyIncome?: number | null;
  monthlyIncomeDay?: number | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface CreateAccountDTO {
  name: string;
  initialBalance: number;
  type: AccountType;
  monthlyIncome?: number;
  monthlyIncomeDay?: number;
}

export interface UpdateAccountDTO {
  name?: string;
  type?: AccountType;
  currentBalance?: number;
  monthlyIncome?: number | null;
  monthlyIncomeDay?: number | null;
}
