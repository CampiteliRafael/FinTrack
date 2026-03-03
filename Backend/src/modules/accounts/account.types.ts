import { AccountType } from '@prisma/client';

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
