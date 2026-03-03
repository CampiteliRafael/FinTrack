import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import {
  Installment,
  CreateInstallmentData,
  UpdateInstallmentData,
  InstallmentFilters,
} from '../types/installment.types';
import { installmentService } from '../services/installment.service';

interface InstallmentContextType {
  installments: Installment[];
  total: number;
  loading: boolean;
  error: string | null;
  fetchInstallments: (filters?: InstallmentFilters) => Promise<void>;
  createInstallment: (data: CreateInstallmentData) => Promise<void>;
  updateInstallment: (id: string, data: UpdateInstallmentData) => Promise<void>;
  deleteInstallment: (id: string) => Promise<void>;
  payInstallment: (id: string) => Promise<void>;
}

const InstallmentContext = createContext<InstallmentContextType | undefined>(undefined);

export function InstallmentProvider({ children }: { children: ReactNode }) {
  const [installments, setInstallments] = useState<Installment[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchInstallments = useCallback(async (filters?: InstallmentFilters) => {
    try {
      setLoading(true);
      setError(null);
      const data = await installmentService.getInstallments(filters);
      setInstallments(data.installments);
      setTotal(data.total);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch installments');
    } finally {
      setLoading(false);
    }
  }, []);

  const createInstallment = useCallback(
    async (data: CreateInstallmentData) => {
      try {
        setError(null);
        await installmentService.createInstallment(data);
        await fetchInstallments();
      } catch (err: any) {
        setError(err.response?.data?.error || 'Failed to create installment');
        throw err;
      }
    },
    [fetchInstallments]
  );

  const updateInstallment = useCallback(
    async (id: string, data: UpdateInstallmentData) => {
      try {
        setError(null);
        await installmentService.updateInstallment(id, data);
        await fetchInstallments();
      } catch (err: any) {
        setError(err.response?.data?.error || 'Failed to update installment');
        throw err;
      }
    },
    [fetchInstallments]
  );

  const deleteInstallment = useCallback(
    async (id: string) => {
      try {
        setError(null);
        await installmentService.deleteInstallment(id);
        await fetchInstallments();
      } catch (err: any) {
        setError(err.response?.data?.error || 'Failed to delete installment');
        throw err;
      }
    },
    [fetchInstallments]
  );

  const payInstallment = useCallback(
    async (id: string) => {
      try {
        setError(null);
        await installmentService.payInstallment(id);
        await fetchInstallments();
      } catch (err: any) {
        setError(err.response?.data?.error || 'Failed to pay installment');
        throw err;
      }
    },
    [fetchInstallments]
  );

  return (
    <InstallmentContext.Provider
      value={{
        installments,
        total,
        loading,
        error,
        fetchInstallments,
        createInstallment,
        updateInstallment,
        deleteInstallment,
        payInstallment,
      }}
    >
      {children}
    </InstallmentContext.Provider>
  );
}

export function useInstallments() {
  const context = useContext(InstallmentContext);
  if (!context) {
    throw new Error('useInstallments must be used within an InstallmentProvider');
  }
  return context;
}
