import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Account, AccountType } from '../types/account.types';

const accountSchema = z.object({
  name: z.string().min(1, 'Nome obrigatório'),
  initialBalance: z.coerce.number().optional(),
  currentBalance: z.coerce.number().optional(),
  type: z.enum(['checking', 'savings', 'cash']),
  monthlyIncome: z.coerce.number().optional(),
  monthlyIncomeDay: z.coerce.number().int().min(1).max(31).optional(),
});

type AccountFormData = z.infer<typeof accountSchema>;

interface AccountFormProps {
  account?: Account | null;
  onSubmit: (data: AccountFormData) => Promise<void>;
  onCancel: () => void;
}

export function AccountForm({ account, onSubmit, onCancel }: AccountFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<AccountFormData>({
    resolver: zodResolver(accountSchema),
    defaultValues: account
      ? {
          name: account.name,
          currentBalance: Number(account.currentBalance),
          type: account.type,
          monthlyIncome: account.monthlyIncome ? Number(account.monthlyIncome) : undefined,
          monthlyIncomeDay: account.monthlyIncomeDay || undefined,
        }
      : {
          initialBalance: 0,
          type: 'checking' as AccountType,
        },
  });

  const monthlyIncome = watch('monthlyIncome');

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input label="Nome da Conta" {...register('name')} error={errors.name?.message} />

      {account ? (
        <Input
          label="Saldo Atual"
          type="number"
          step="0.01"
          {...register('currentBalance')}
          error={errors.currentBalance?.message}
        />
      ) : (
        <Input
          label="Saldo Inicial"
          type="number"
          step="0.01"
          {...register('initialBalance')}
          error={errors.initialBalance?.message}
        />
      )}
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-foreground-primary">Tipo</label>
        <select
          {...register('type')}
          className="px-3 py-2 border border-primary rounded focus:outline-none focus:ring-2 focus:ring-accent-primary bg-background-primary text-foreground-primary"
        >
          <option value="checking">Conta Corrente</option>
          <option value="savings">Poupança</option>
          <option value="cash">Dinheiro</option>
        </select>
        {errors.type && <span className="text-sm text-accent-danger">{errors.type.message}</span>}
      </div>

      <div className="border-t border-gray-200 pt-4 mt-4">
        <h3 className="text-sm font-medium text-foreground-primary mb-3">
          Receita Mensal Fixa (Opcional)
        </h3>
        <p className="text-xs text-gray-600 mb-3">
          Configure um valor fixo que entra nesta conta todo mês (ex: salário). Transações pontuais devem ser criadas normalmente.
        </p>

        <Input
          label="Valor Mensal"
          type="number"
          step="0.01"
          placeholder="R$ 0,00"
          {...register('monthlyIncome')}
          error={errors.monthlyIncome?.message}
        />

        {monthlyIncome && Number(monthlyIncome) > 0 && (
          <Input
            label="Dia do Mês"
            type="number"
            min="1"
            max="31"
            placeholder="Ex: 5 (todo dia 5)"
            {...register('monthlyIncomeDay')}
            error={errors.monthlyIncomeDay?.message}
          />
        )}
      </div>

      <div className="flex gap-2">
        <Button type="submit" isLoading={isSubmitting} className="flex-1">
          {account ? 'Atualizar' : 'Criar'}
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel} className="flex-1">
          Cancelar
        </Button>
      </div>
    </form>
  );
}
