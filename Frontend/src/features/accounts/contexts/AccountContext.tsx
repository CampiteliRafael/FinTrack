import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { accountService } from '../services/accountService';

export interface Account {
  id: string;
  userId: string;
  name: string;
  initialBalance: number;
  currentBalance: number;
  availableBalance: number;
  reservedAmount: number;
  lastTransactionAt: string | null;
  type: 'checking' | 'savings' | 'cash';
  monthlyIncome?: number | null;
  monthlyIncomeDay?: number | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

interface AccountContextType {
  accounts: Account[];
  loading: boolean;
  error: string | null;
  fetchAccounts: () => Promise<void>;
  createAccount: (data: any) => Promise<void>;
  updateAccount: (id: string, data: any) => Promise<void>;
  deleteAccount: (id: string) => Promise<void>;
}

const AccountContext = createContext<AccountContextType | undefined>(undefined);

export function AccountProvider({ children }: { children: ReactNode }) {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAccounts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await accountService.getAll();
      setAccounts(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao carregar contas');
    } finally {
      setLoading(false);
    }
  }, []);

  const createAccount = useCallback(
    async (data: any) => {
      try {
        setError(null);
        await accountService.create(data);
        await fetchAccounts();
      } catch (err: any) {
        setError(err.response?.data?.message || 'Erro ao criar conta');
        throw err;
      }
    },
    [fetchAccounts]
  );

  const updateAccount = useCallback(
    async (id: string, data: any) => {
      try {
        setError(null);
        await accountService.update(id, data);
        await fetchAccounts();
      } catch (err: any) {
        setError(err.response?.data?.message || 'Erro ao atualizar conta');
        throw err;
      }
    },
    [fetchAccounts]
  );

  const deleteAccount = useCallback(
    async (id: string) => {
      try {
        setError(null);
        await accountService.delete(id);
        await fetchAccounts();
      } catch (err: any) {
        setError(err.response?.data?.message || 'Erro ao deletar conta');
        throw err;
      }
    },
    [fetchAccounts]
  );

  return (
    <AccountContext.Provider
      value={{
        accounts,
        loading,
        error,
        fetchAccounts,
        createAccount,
        updateAccount,
        deleteAccount,
      }}
    >
      {children}
    </AccountContext.Provider>
  );
}

export function useAccounts() {
  const context = useContext(AccountContext);
  if (!context) {
    throw new Error('useAccounts must be used within an AccountProvider');
  }
  return context;
}
