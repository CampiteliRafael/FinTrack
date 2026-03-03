import { Card } from '../../../components/ui/Card';
import { formatCurrencyWithScale } from '../../../utils/formatCurrency';

interface SummaryCardProps {
  title: string;
  value: number;
  type?: 'default' | 'income' | 'expense';
}

export function SummaryCard({ title, value, type = 'default' }: SummaryCardProps) {
  const balanceData = formatCurrencyWithScale(value);

  const colorClasses = {
    default: 'text-accent-primary',
    income: 'text-accent-income',
    expense: 'text-accent-expense',
  };

  return (
    <Card hover={false}>
      <h3 className="text-sm font-medium text-foreground-secondary mb-2">{title}</h3>
      <div>
        <p
          className={`text-xl sm:text-2xl font-bold break-words leading-tight ${colorClasses[type]}`}
        >
          {balanceData.formatted}
        </p>
        {balanceData.scale && (
          <p className={`text-xs mt-0.5 ${colorClasses[type]} opacity-70`}>{balanceData.scale}</p>
        )}
      </div>
    </Card>
  );
}
