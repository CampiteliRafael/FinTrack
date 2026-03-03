import api from '../../../services/api';
import {
  Installment,
  CreateInstallmentData,
  UpdateInstallmentData,
  InstallmentFilters,
} from '../types/installment.types';

export const installmentService = {
  async getInstallments(filters?: InstallmentFilters) {
    const params = new URLSearchParams();

    if (filters?.accountId) params.append('accountId', filters.accountId);
    if (filters?.categoryId) params.append('categoryId', filters.categoryId);
    if (filters?.completed !== undefined) params.append('completed', String(filters.completed));
    if (filters?.page) params.append('page', String(filters.page));
    if (filters?.limit) params.append('limit', String(filters.limit));

    const response = await api.get<{ installments: Installment[]; total: number }>(
      `/installments?${params.toString()}`
    );
    return response.data;
  },

  async getInstallmentById(id: string) {
    const response = await api.get<Installment>(`/installments/${id}`);
    return response.data;
  },

  async createInstallment(data: CreateInstallmentData) {
    const response = await api.post<Installment>('/installments', data);
    return response.data;
  },

  async updateInstallment(id: string, data: UpdateInstallmentData) {
    const response = await api.patch<Installment>(`/installments/${id}`, data);
    return response.data;
  },

  async deleteInstallment(id: string) {
    await api.delete(`/installments/${id}`);
  },

  async payInstallment(id: string) {
    const response = await api.post<Installment>(`/installments/${id}/pay`);
    return response.data;
  },
};
