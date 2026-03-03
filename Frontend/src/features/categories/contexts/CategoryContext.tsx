import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { categoryService } from '../services/categoryService';

export interface Category {
  id: string;
  userId: string;
  name: string;
  color: string;
  icon: string;
  type: 'income' | 'expense';
  createdAt: string;
  updatedAt: string;
}

interface CategoryContextType {
  categories: Category[];
  loading: boolean;
  error: string | null;
  fetchCategories: () => Promise<void>;
  createCategory: (data: any) => Promise<void>;
  updateCategory: (id: string, data: any) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
}

const CategoryContext = createContext<CategoryContextType | undefined>(undefined);

export function CategoryProvider({ children }: { children: ReactNode }) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await categoryService.getAll();
      setCategories(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao carregar categorias');
    } finally {
      setLoading(false);
    }
  }, []);

  const createCategory = useCallback(
    async (data: any) => {
      try {
        setError(null);
        await categoryService.create(data);
        await fetchCategories();
      } catch (err: any) {
        setError(err.response?.data?.message || 'Erro ao criar categoria');
        throw err;
      }
    },
    [fetchCategories]
  );

  const updateCategory = useCallback(
    async (id: string, data: any) => {
      try {
        setError(null);
        await categoryService.update(id, data);
        await fetchCategories();
      } catch (err: any) {
        setError(err.response?.data?.message || 'Erro ao atualizar categoria');
        throw err;
      }
    },
    [fetchCategories]
  );

  const deleteCategory = useCallback(
    async (id: string) => {
      try {
        setError(null);
        await categoryService.delete(id);
        await fetchCategories();
      } catch (err: any) {
        setError(err.response?.data?.message || 'Erro ao deletar categoria');
        throw err;
      }
    },
    [fetchCategories]
  );

  return (
    <CategoryContext.Provider
      value={{
        categories,
        loading,
        error,
        fetchCategories,
        createCategory,
        updateCategory,
        deleteCategory,
      }}
    >
      {children}
    </CategoryContext.Provider>
  );
}

export function useCategories() {
  const context = useContext(CategoryContext);
  if (!context) {
    throw new Error('useCategories must be used within a CategoryProvider');
  }
  return context;
}
