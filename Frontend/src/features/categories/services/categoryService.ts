import api from '../../../services/api';
import { Category, CreateCategoryDTO, UpdateCategoryDTO } from '../types/category.types';

export const categoryService = {
  async getAll(): Promise<Category[]> {
    const { data } = await api.get('/categories');
    return data;
  },

  async getById(id: string): Promise<Category> {
    const { data } = await api.get(`/categories/${id}`);
    return data;
  },

  async create(dto: CreateCategoryDTO): Promise<Category> {
    const { data } = await api.post('/categories', dto);
    return data;
  },

  async update(id: string, dto: UpdateCategoryDTO): Promise<Category> {
    const { data } = await api.patch(`/categories/${id}`, dto);
    return data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/categories/${id}`);
  },
};
