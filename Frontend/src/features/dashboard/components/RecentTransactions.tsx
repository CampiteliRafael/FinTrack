import { Transaction } from '../../transactions/types/transaction.types';
import { Card } from '../../../components/ui/Card';
import { DynamicIcon } from '../../../components/ui/IconPicker';
import { formatCurrencyWithScale } from '../../../utils/formatCurrency';

interface RecentTransactionsProps {
  transactions: Transaction[];
}

export function RecentTransactions({ transactions }: RecentTransactionsProps) {
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
    });
  };

  return (
    <Card hover={false}>
      <h3 className="text-base font-semibold mb-4">Transações Recentes</h3>
      {transactions.length === 0 ? (
        <p className="text-foreground-tertiary text-center py-4">Nenhuma transação</p>
      ) : (
        <div className="space-y-2">
          {transactions.map((transaction) => {
            const amountData = formatCurrencyWithScale(Number(transaction.amount));
            const isIncome = transaction.type === 'income';
            return (
              <div
                key={transaction.id}
                className="flex items-center justify-between border-b pb-2 last:border-b-0"
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <div
                    className="w-8 h-8 rounded flex items-center justify-center text-white flex-shrink-0"
                    style={{ backgroundColor: transaction.category?.color }}
                  >
                    <DynamicIcon
                      name={transaction.category?.icon || 'Tag'}
                      size={14}
                      className="text-white"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-sm truncate" title={transaction.category?.name}>
                      {transaction.category?.name}
                    </p>
                    <p className="text-xs text-foreground-tertiary">
                      {formatDate(transaction.date)}
                    </p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0 ml-2">
                  <p
                    className={`font-semibold text-sm ${isIncome ? 'text-accent-income' : 'text-accent-expense'}`}
                    title={amountData.full}
                  >
                    {isIncome ? '+' : '-'} {amountData.formatted}
                  </p>
                  {amountData.scale && (
                    <p
                      className={`text-xs ${isIncome ? 'text-accent-income' : 'text-accent-expense'} opacity-70`}
                    >
                      {amountData.scale}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}
