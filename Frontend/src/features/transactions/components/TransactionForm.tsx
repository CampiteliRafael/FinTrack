import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useEffect, useState } from 'react';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Transaction, TransactionType } from '../types/transaction.types';
import { Account } from '../../accounts/types/account.types';
import { Category } from '../../categories/types/category.types';
import { accountService } from '../../accounts/services/accountService';
import { categoryService } from '../../categories/services/categoryService';
import { useToastContext } from '../../../contexts/ToastContext';
import { handleOperationError } from '../../../shared/utils/error-handler.utils';

const transactionSchema = z.object({
  type: z.enum(['income', 'expense']),
  amount: z.coerce.number().positive(),
  description: z.string().max(500).optional(),
  date: z.string(),
  accountId: z.string().uuid(),
  categoryId: z.string().uuid(),
});

type TransactionFormData = z.infer<typeof transactionSchema>;

interface TransactionFormProps {
  transaction?: Transaction | null;
  onSubmit: (data: TransactionFormData) => Promise<void>;
  onCancel: () => void;
}

export function TransactionForm({ transaction, onSubmit, onCancel }: TransactionFormProps) {
  const toast = useToastContext();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: transaction
      ? {
          type: transaction.type,
          amount: Number(transaction.amount),
          description: transaction.description || '',
          date: transaction.date.split('T')[0],
          accountId: transaction.accountId,
          categoryId: transaction.categoryId,
        }
      : {
          type: 'expense' as TransactionType,
          date: new Date().toISOString().split('T')[0],
        },
  });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [accountsData, categoriesData] = await Promise.all([
        accountService.getAll(),
        categoryService.getAll(),
      ]);
      setAccounts(accountsData);
      setCategories(categoriesData);
    } catch (error: any) {
      handleOperationError(error, toast.error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <div>Carregando...</div>;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-foreground-primary">Tipo</label>
        <select
          {...register('type')}
          className="px-3 py-2 border border-primary rounded focus:outline-none focus:ring-2 focus:ring-accent-primary bg-background-primary text-foreground-primary"
        >
          <option value="income">Receita</option>
          <option value="expense">Despesa</option>
        </select>
        {errors.type && <span className="text-sm text-accent-danger">{errors.type.message}</span>}
      </div>

      <Input
        label="Valor"
        type="number"
        step="0.01"
        {...register('amount')}
        error={errors.amount?.message}
      />

      <Input label="Descrição" {...register('description')} error={errors.description?.message} />

      <Input label="Data" type="date" {...register('date')} error={errors.date?.message} />

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-foreground-primary">Conta</label>
        <select
          {...register('accountId')}
          className="px-3 py-2 border border-primary rounded focus:outline-none focus:ring-2 focus:ring-accent-primary bg-background-primary text-foreground-primary"
        >
          <option value="">Selecione uma conta</option>
          {accounts.map((account) => (
            <option key={account.id} value={account.id}>
              {account.name}
            </option>
          ))}
        </select>
        {errors.accountId && (
          <span className="text-sm text-accent-danger">{errors.accountId.message}</span>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-foreground-primary">Categoria</label>
        <select
          {...register('categoryId')}
          className="px-3 py-2 border border-primary rounded focus:outline-none focus:ring-2 focus:ring-accent-primary bg-background-primary text-foreground-primary"
        >
          <option value="">Selecione uma categoria</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
        {errors.categoryId && (
          <span className="text-sm text-accent-danger">{errors.categoryId.message}</span>
        )}
      </div>

      <div className="flex gap-2">
        <Button type="submit" isLoading={isSubmitting} className="flex-1">
          {transaction ? 'Atualizar' : 'Criar'}
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel} className="flex-1">
          Cancelar
        </Button>
      </div>
    </form>
  );
}
