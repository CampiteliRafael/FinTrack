import api from '../../../services/api';
import {
  Transaction,
  CreateTransactionDTO,
  UpdateTransactionDTO,
  TransactionFilters,
  PaginatedResponse,
} from '../types/transaction.types';

export const transactionService = {
  async getAll(filters?: TransactionFilters): Promise<PaginatedResponse<Transaction>> {
    const params = new URLSearchParams();
    if (filters?.type) params.append('type', filters.type);
    if (filters?.accountId) params.append('accountId', filters.accountId);
    if (filters?.categoryId) params.append('categoryId', filters.categoryId);
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());

    const { data } = await api.get(`/transactions?${params.toString()}`);
    return data;
  },

  async getById(id: string): Promise<Transaction> {
    const { data } = await api.get(`/transactions/${id}`);
    return data;
  },

  async create(dto: CreateTransactionDTO): Promise<Transaction> {
    const { data } = await api.post('/transactions', dto);
    return data;
  },

  async update(id: string, dto: UpdateTransactionDTO): Promise<Transaction> {
    const { data } = await api.patch(`/transactions/${id}`, dto);
    return data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/transactions/${id}`);
  },
};
