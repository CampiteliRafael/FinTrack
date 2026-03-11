import { Category } from '../entities/Category';

export type CreateCategoryData = {
  userId: string;
  name: string;
  color: string;
  icon: string;
};

export interface ICategoryRepository {
  findById(id: string, userId: string): Promise<Category | null>;
  findAll(userId: string): Promise<Category[]>;
  create(category: CreateCategoryData): Promise<Category>;
  update(id: string, category: Partial<Category>): Promise<Category>;
  softDelete(id: string): Promise<void>;
}
