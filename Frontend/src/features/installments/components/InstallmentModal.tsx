import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Installment, CreateInstallmentData } from '../types/installment.types';
import { Modal } from '../../../components/ui/Modal';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { useEffect } from 'react';

const installmentSchema = z.object({
  description: z.string().min(1, 'Descrição é obrigatória'),
  totalAmount: z.number().positive('Valor total deve ser positivo'),
  installments: z.number().int().min(2, 'Deve ter pelo menos 2 parcelas').max(120),
  accountId: z.string().min(1, 'Conta é obrigatória'),
  categoryId: z.string().min(1, 'Categoria é obrigatória'),
  startDate: z.string().min(1, 'Data de início é obrigatória'),
});

type InstallmentFormData = z.infer<typeof installmentSchema>;

interface InstallmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateInstallmentData) => Promise<void>;
  installment?: Installment;
  accounts: Array<{ id: string; name: string }>;
  categories: Array<{ id: string; name: string; color: string }>;
}

export function InstallmentModal({
  isOpen,
  onClose,
  onSubmit,
  installment,
  accounts,
  categories,
}: InstallmentModalProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
  } = useForm<InstallmentFormData>({
    resolver: zodResolver(installmentSchema),
    defaultValues: installment
      ? {
          description: installment.description,
          totalAmount: installment.totalAmount,
          installments: installment.installments,
          accountId: installment.accountId,
          categoryId: installment.categoryId,
          startDate: installment.startDate.split('T')[0],
        }
      : {},
  });

  useEffect(() => {
    if (isOpen && installment) {
      reset({
        description: installment.description,
        totalAmount: installment.totalAmount,
        installments: installment.installments,
        accountId: installment.accountId,
        categoryId: installment.categoryId,
        startDate: installment.startDate.split('T')[0],
      });
    } else if (isOpen && !installment) {
      reset({});
    }
  }, [isOpen, installment, reset]);

  const totalAmount = watch('totalAmount');
  const installmentsCount = watch('installments');
  const installmentAmount = totalAmount && installmentsCount ? totalAmount / installmentsCount : 0;

  const handleFormSubmit = async (data: InstallmentFormData) => {
    try {
      await onSubmit({
        ...data,
        startDate: new Date(data.startDate).toISOString(),
      });
      onClose();
    } catch (error) {
      // Error handled by parent
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={installment ? 'Editar Parcelamento' : 'Criar Parcelamento'}
    >
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        <Input label="Descrição" error={errors.description?.message} {...register('description')} />

        <Input
          label="Valor Total"
          type="number"
          step="0.01"
          error={errors.totalAmount?.message}
          {...register('totalAmount', { valueAsNumber: true })}
        />

        <Input
          label="Número de Parcelas"
          type="number"
          error={errors.installments?.message}
          {...register('installments', { valueAsNumber: true })}
        />

        {installmentAmount > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded p-3">
            <p className="text-sm text-blue-800">
              Cada parcela: <span className="font-semibold">R$ {installmentAmount.toFixed(2)}</span>
            </p>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-foreground-primary mb-1">Conta</label>
          <select
            {...register('accountId')}
            className="w-full px-3 py-2 border border-primary rounded-md focus:outline-none focus:ring-2 focus:ring-accent-primary bg-background-primary text-foreground-primary"
          >
            <option value="">Selecione uma conta</option>
            {accounts.map((acc) => (
              <option key={acc.id} value={acc.id}>
                {acc.name}
              </option>
            ))}
          </select>
          {errors.accountId && (
            <p className="text-accent-danger text-sm mt-1">{errors.accountId.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground-primary mb-1">
            Categoria
          </label>
          <select
            {...register('categoryId')}
            className="w-full px-3 py-2 border border-primary rounded-md focus:outline-none focus:ring-2 focus:ring-accent-primary bg-background-primary text-foreground-primary"
          >
            <option value="">Selecione uma categoria</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
          {errors.categoryId && (
            <p className="text-accent-danger text-sm mt-1">{errors.categoryId.message}</p>
          )}
        </div>

        <Input
          label="Data de Início"
          type="date"
          error={errors.startDate?.message}
          {...register('startDate')}
        />

        <div className="flex gap-2 justify-end">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Salvando...' : installment ? 'Atualizar' : 'Criar'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
