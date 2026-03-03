export type TransactionType = 'income' | 'expense';

export interface Category {
  id: string;
  userId: string;
  name: string;
  color: string;
  icon: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface CreateCategoryDTO {
  name: string;
  color?: string;
  icon?: string;
}

export interface UpdateCategoryDTO {
  name?: string;
  color?: string;
  icon?: string;
}
