import { CategoryForm } from './CategoryForm';
import { Category, CreateCategoryDTO, UpdateCategoryDTO } from '../types/category.types';
import { categoryService } from '../services/categoryService';
import { Modal } from '../../../components/ui/Modal';
import { useToastContext } from '../../../contexts/ToastContext';
import { handleOperationError } from '../../../shared/utils/error-handler.utils';

interface CategoryModalProps {
  category?: Category | null;
  onClose: () => void;
}

export function CategoryModal({ category, onClose }: CategoryModalProps) {
  const toast = useToastContext();

  async function handleSubmit(data: CreateCategoryDTO | UpdateCategoryDTO) {
    try {
      if (category) {
        await categoryService.update(category.id, data as UpdateCategoryDTO);
        toast.success('Categoria atualizada com sucesso');
      } else {
        await categoryService.create(data as CreateCategoryDTO);
        toast.success('Categoria criada com sucesso');
      }
      onClose();
    } catch (error: any) {
      handleOperationError(error, toast.error);
    }
  }

  return (
    <Modal isOpen={true} onClose={onClose} title={category ? 'Editar Categoria' : 'Nova Categoria'}>
      <CategoryForm category={category} onSubmit={handleSubmit} onCancel={onClose} />
    </Modal>
  );
}
