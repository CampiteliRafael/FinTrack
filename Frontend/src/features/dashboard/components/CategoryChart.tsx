import { CategoryStats } from '../types/dashboard.types';
import { Card } from '../../../components/ui/Card';
import { DynamicIcon } from '../../../components/ui/IconPicker';
import { formatCurrencyWithScale } from '../../../utils/formatCurrency';

interface CategoryChartProps {
  data: CategoryStats[];
}

export function CategoryChart({ data }: CategoryChartProps) {
  const total = data.reduce((sum, item) => sum + item.total, 0);

  return (
    <Card hover={false}>
      <h3 className="text-base font-semibold mb-4">Transações por Categoria</h3>
      {data.length === 0 ? (
        <p className="text-foreground-tertiary text-center py-4">Nenhum dado disponível</p>
      ) : (
        <div className="space-y-3">
          {data.map((item) => {
            const percentage = ((item.total / total) * 100).toFixed(1);
            const amountData = formatCurrencyWithScale(item.total);
            return (
              <div key={item.category}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-6 h-6 rounded flex items-center justify-center text-white"
                      style={{ backgroundColor: item.color }}
                    >
                      <DynamicIcon name={item.icon} size={14} className="text-white" />
                    </span>
                    <span className="text-sm font-medium">{item.category}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-semibold block" title={amountData.full}>
                      {amountData.formatted}
                    </span>
                    {amountData.scale && (
                      <span className="text-xs text-foreground-tertiary">{amountData.scale}</span>
                    )}
                  </div>
                </div>
                <div className="w-full bg-background-tertiary rounded-full h-2">
                  <div
                    className="h-2 rounded-full"
                    style={{ width: `${percentage}%`, backgroundColor: item.color }}
                  />
                </div>
                <p className="text-xs text-foreground-tertiary mt-1">
                  {percentage}% ({item.count} transações)
                </p>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}
