import api from '../../../services/api';
import { DashboardSummary, CategoryStats } from '../types/dashboard.types';
import { Transaction } from '../../transactions/types/transaction.types';

export const dashboardService = {
  async getSummary(): Promise<DashboardSummary> {
    const { data } = await api.get('/dashboard/summary');
    return data;
  },

  async getByCategory(): Promise<CategoryStats[]> {
    const { data } = await api.get('/dashboard/by-category');
    return data;
  },

  async getRecent(): Promise<Transaction[]> {
    const { data } = await api.get('/dashboard/recent');
    return data;
  },
};
