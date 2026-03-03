import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Goal, CreateGoalData } from '../types/goal.types';
import { Modal } from '../../../components/ui/Modal';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { useEffect } from 'react';

const goalSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  targetAmount: z.number().positive('Valor meta deve ser positivo'),
  deadline: z.string().optional(),
  categoryId: z.string().optional(),
});

type GoalFormData = z.infer<typeof goalSchema>;

interface GoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateGoalData) => Promise<void>;
  goal?: Goal;
  categories: Array<{ id: string; name: string; color: string }>;
}

export function GoalModal({ isOpen, onClose, onSubmit, goal, categories }: GoalModalProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<GoalFormData>({
    resolver: zodResolver(goalSchema),
    defaultValues: goal
      ? {
          name: goal.name,
          targetAmount: goal.targetAmount,
          deadline: goal.deadline ? goal.deadline.split('T')[0] : undefined,
          categoryId: goal.categoryId || undefined,
        }
      : {},
  });

  useEffect(() => {
    if (isOpen && goal) {
      reset({
        name: goal.name,
        targetAmount: goal.targetAmount,
        deadline: goal.deadline ? goal.deadline.split('T')[0] : undefined,
        categoryId: goal.categoryId || undefined,
      });
    } else if (isOpen && !goal) {
      reset({});
    }
  }, [isOpen, goal, reset]);

  const handleFormSubmit = async (data: GoalFormData) => {
    try {
      const payload: CreateGoalData = {
        name: data.name,
        targetAmount: data.targetAmount,
        deadline:
          data.deadline && data.deadline.trim() !== ''
            ? new Date(data.deadline).toISOString()
            : undefined,
        categoryId: data.categoryId && data.categoryId.trim() !== '' ? data.categoryId : undefined,
      };

      await onSubmit(payload);
      onClose();
    } catch (error) {
      // Error handled by parent
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={goal ? 'Editar Meta' : 'Criar Meta'}>
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        <Input label="Nome da Meta" error={errors.name?.message} {...register('name')} />

        <Input
          label="Valor Meta"
          type="number"
          step="0.01"
          error={errors.targetAmount?.message}
          {...register('targetAmount', { valueAsNumber: true })}
        />

        <Input
          label="Prazo (Opcional)"
          type="date"
          error={errors.deadline?.message}
          {...register('deadline')}
        />

        <div>
          <label className="block text-sm font-medium text-foreground-primary mb-1">
            Categoria (Opcional)
          </label>
          <select
            {...register('categoryId')}
            className="w-full px-3 py-2 border border-primary rounded-md focus:outline-none focus:ring-2 focus:ring-accent-primary bg-background-primary text-foreground-primary"
          >
            <option value="">Sem categoria</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex gap-2 justify-end">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Salvando...' : goal ? 'Atualizar' : 'Criar'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
