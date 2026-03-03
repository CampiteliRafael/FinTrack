import { Category } from '../entities/Category';

export interface ICategoryRepository {
  findById(id: string, userId: string): Promise<Category | null>;
  findAll(userId: string): Promise<Category[]>;
  create(
    category: Omit<Category, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>
  ): Promise<Category>;
  update(id: string, category: Partial<Category>): Promise<Category>;
  softDelete(id: string): Promise<void>;
}
