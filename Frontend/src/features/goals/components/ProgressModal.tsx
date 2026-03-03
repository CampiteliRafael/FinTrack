import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Goal } from '../types/goal.types';
import { Modal } from '../../../components/ui/Modal';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';

const progressSchema = z.object({
  amount: z.number().positive('Valor deve ser positivo'),
});

type ProgressFormData = z.infer<typeof progressSchema>;

interface ProgressModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (amount: number) => Promise<void>;
  goal: Goal;
}

export function ProgressModal({ isOpen, onClose, onSubmit, goal }: ProgressModalProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ProgressFormData>({
    resolver: zodResolver(progressSchema),
  });

  const handleFormSubmit = async (data: ProgressFormData) => {
    try {
      await onSubmit(data.amount);
      reset();
      onClose();
    } catch (error) {
      // Error handled by parent
    }
  };

  const remaining = goal.targetAmount - goal.currentAmount;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Adicionar Progresso">
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        <div>
          <p className="text-sm text-gray-600 mb-4">
            Meta: <span className="font-semibold">{goal.name}</span>
          </p>
          <p className="text-sm text-gray-600 mb-4">
            Atual: R$ {goal.currentAmount.toFixed(2)} / R$ {goal.targetAmount.toFixed(2)}
          </p>
          <p className="text-sm text-gray-600 mb-4">
            Faltando: <span className="font-semibold">R$ {remaining.toFixed(2)}</span>
          </p>
        </div>

        <Input
          label="Valor a Adicionar"
          type="number"
          step="0.01"
          error={errors.amount?.message}
          {...register('amount', { valueAsNumber: true })}
        />

        <div className="flex gap-2 justify-end">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Adicionando...' : 'Adicionar Progresso'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
