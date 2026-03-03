import { Transaction } from '../types/transaction.types';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { DynamicIcon } from '../../../components/ui/IconPicker';
import { formatCurrencyWithScale } from '../../../utils/formatCurrency';

interface TransactionCardProps {
  transaction: Transaction;
  onEdit: (transaction: Transaction) => void;
  onDelete: (id: string) => void;
}

export function TransactionCard({ transaction, onEdit, onDelete }: TransactionCardProps) {
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR');
  };

  const isIncome = transaction.type === 'income';
  const amountData = formatCurrencyWithScale(Number(transaction.amount));

  return (
    <Card hover={false}>
      <div className="flex items-start gap-2 mb-2">
        <div
          className="w-8 h-8 rounded flex items-center justify-center text-white flex-shrink-0"
          style={{ backgroundColor: transaction.category?.color }}
        >
          <DynamicIcon
            name={transaction.category?.icon || 'Tag'}
            size={16}
            className="text-white"
          />
        </div>
        <div className="flex-1 min-w-0">
          <h3
            className="font-semibold text-sm truncate text-foreground-primary"
            title={transaction.category?.name}
          >
            {transaction.category?.name}
          </h3>
          <p className="text-xs text-foreground-tertiary truncate">{transaction.account?.name}</p>
          {transaction.description && (
            <p
              className="text-xs text-foreground-secondary mt-0.5 line-clamp-1"
              title={transaction.description}
            >
              {transaction.description}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-start justify-between mb-2">
        <div className="flex-1 min-w-0">
          <p
            className={`text-base sm:text-lg font-bold break-words leading-tight ${isIncome ? 'text-accent-income' : 'text-accent-expense'}`}
          >
            {isIncome ? '+' : '-'} {amountData.formatted}
          </p>
          {amountData.scale && (
            <p
              className={`text-xs mt-0.5 ${isIncome ? 'text-accent-income' : 'text-accent-expense'} opacity-70`}
            >
              {amountData.scale}
            </p>
          )}
        </div>
        <p className="text-xs text-foreground-tertiary ml-2 flex-shrink-0">
          {formatDate(transaction.date)}
        </p>
      </div>

      <div className="flex gap-2">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => onEdit(transaction)}
          className="flex-1"
        >
          Editar
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => onDelete(transaction.id)}
          className="flex-1"
        >
          Excluir
        </Button>
      </div>
    </Card>
  );
}
