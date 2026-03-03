import { useState, useEffect } from 'react';
import { categoryService } from '../features/categories/services/categoryService';
import { CategoryCard } from '../features/categories/components/CategoryCard';
import { CategoryModal } from '../features/categories/components/CategoryModal';
import { Category } from '../features/categories/types/category.types';
import { Button } from '../components/ui/Button';
import { useToastContext } from '../contexts/ToastContext';
import { useConfirmDialog } from '../contexts/ConfirmDialogContext';

export default function CategoriesPage() {
  const toast = useToastContext();
  const { confirm } = useConfirmDialog();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  useEffect(() => {
    loadCategories();
  }, []);

  async function loadCategories() {
    try {
      const data = await categoryService.getAll();
      setCategories(data);
    } catch (error) {
      toast.error('Erro ao carregar categorias');
    } finally {
      setLoading(false);
    }
  }

  function handleEdit(category: Category) {
    setEditingCategory(category);
    setIsModalOpen(true);
  }

  async function handleDelete(id: string) {
    const confirmed = await confirm({
      title: 'Excluir Categoria',
      message: 'Tem certeza que deseja excluir esta categoria? Esta ação não pode ser desfeita.',
      confirmText: 'Excluir',
      cancelText: 'Cancelar',
      variant: 'danger',
    });

    if (!confirmed) return;

    try {
      await categoryService.delete(id);
      toast.success('Categoria excluída com sucesso');
      loadCategories();
    } catch (error) {
      toast.error('Erro ao excluir categoria');
    }
  }

  function handleCloseModal() {
    setIsModalOpen(false);
    setEditingCategory(null);
    loadCategories();
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <p className="text-gray-500">Carregando...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
        <h2 className="text-lg sm:text-xl font-bold">Categorias</h2>
        <Button onClick={() => setIsModalOpen(true)} className="w-full sm:w-auto">
          Nova Categoria
        </Button>
      </div>

      {categories.length === 0 ? (
        <div className="text-center py-8 sm:py-12 text-gray-500">
          <p className="text-sm sm:text-base">
            Nenhuma categoria cadastrada. Crie sua primeira categoria!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {categories.map((category) => (
            <CategoryCard
              key={category.id}
              category={category}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {isModalOpen && <CategoryModal category={editingCategory} onClose={handleCloseModal} />}
    </div>
  );
}
