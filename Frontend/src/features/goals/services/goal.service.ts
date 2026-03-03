import api from '../../../services/api';
import { Goal, CreateGoalData, UpdateGoalData, GoalFilters } from '../types/goal.types';

export const goalService = {
  async getGoals(filters?: GoalFilters) {
    const params = new URLSearchParams();

    if (filters?.categoryId) params.append('categoryId', filters.categoryId);
    if (filters?.completed !== undefined) params.append('completed', String(filters.completed));
    if (filters?.page) params.append('page', String(filters.page));
    if (filters?.limit) params.append('limit', String(filters.limit));

    const response = await api.get<{ goals: Goal[]; total: number }>(`/goals?${params.toString()}`);
    return response.data;
  },

  async getGoalById(id: string) {
    const response = await api.get<Goal>(`/goals/${id}`);
    return response.data;
  },

  async createGoal(data: CreateGoalData) {
    const response = await api.post<Goal>('/goals', data);
    return response.data;
  },

  async updateGoal(id: string, data: UpdateGoalData) {
    const response = await api.patch<Goal>(`/goals/${id}`, data);
    return response.data;
  },

  async deleteGoal(id: string) {
    await api.delete(`/goals/${id}`);
  },

  async addProgress(id: string, amount: number) {
    const response = await api.post<Goal>(`/goals/${id}/progress`, { amount });
    return response.data;
  },
};
