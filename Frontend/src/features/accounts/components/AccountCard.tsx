import { Account } from '../types/account.types';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { formatCurrencyWithScale } from '../../../utils/formatCurrency';

interface AccountCardProps {
  account: Account;
  onEdit: (account: Account) => void;
  onDelete: (id: string) => void;
}

const accountTypeLabels = {
  checking: 'Conta Corrente',
  savings: 'Poupança',
  cash: 'Dinheiro',
};

export function AccountCard({ account, onEdit, onDelete }: AccountCardProps) {
  const currentBalanceData = formatCurrencyWithScale(Number(account.currentBalance));

  return (
    <Card hover={false}>
      <div className="mb-3">
        <h3
          className="font-semibold text-base truncate text-foreground-primary"
          title={account.name}
        >
          {account.name}
        </h3>
        <p className="text-xs text-foreground-tertiary">{accountTypeLabels[account.type]}</p>
      </div>

      <div className="mb-3">
        <p className="text-lg sm:text-xl font-bold text-accent-primary break-words leading-tight">
          {currentBalanceData.formatted}
        </p>
        {currentBalanceData.scale && (
          <p className="text-xs text-accent-primary/80 mt-0.5">{currentBalanceData.scale}</p>
        )}
      </div>

      {account.monthlyIncome && Number(account.monthlyIncome) > 0 && (
        <div className="mb-3 p-2 bg-green-50 border border-green-200 rounded">
          <p className="text-xs text-green-700">
            💰 Receita mensal: <span className="font-semibold">R$ {Number(account.monthlyIncome).toFixed(2)}</span>
            {account.monthlyIncomeDay && <span> (dia {account.monthlyIncomeDay})</span>}
          </p>
        </div>
      )}

      <div className="flex gap-2">
        <Button variant="secondary" size="sm" onClick={() => onEdit(account)} className="flex-1">
          Editar
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => onDelete(account.id)}
          className="flex-1"
        >
          Excluir
        </Button>
      </div>
    </Card>
  );
}
