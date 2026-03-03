import { memo, useMemo } from 'react';
import { Installment } from '../types/installment.types';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { formatCurrencyWithScale } from '../../../utils/formatCurrency';

interface InstallmentCardProps {
  installment: Installment;
  onEdit: (installment: Installment) => void;
  onDelete: (id: string) => void;
  onPay: (id: string) => void;
}

export const InstallmentCard = memo(function InstallmentCard({
  installment,
  onEdit,
  onDelete,
  onPay,
}: InstallmentCardProps) {
  const progress = useMemo(
    () => (installment.currentInstallment / installment.installments) * 100,
    [installment.currentInstallment, installment.installments]
  );

  const isCompleted = useMemo(
    () => installment.currentInstallment >= installment.installments,
    [installment.currentInstallment, installment.installments]
  );

  const installmentAmount = useMemo(
    () => installment.totalAmount / installment.installments,
    [installment.totalAmount, installment.installments]
  );

  const formattedStartDate = useMemo(
    () => new Date(installment.startDate).toLocaleDateString('pt-BR'),
    [installment.startDate]
  );

  const installmentData = formatCurrencyWithScale(installmentAmount);
  const totalData = formatCurrencyWithScale(installment.totalAmount);

  return (
    <Card hover={false}>
      <div className="flex flex-col gap-3">
        <div className="flex justify-between items-start gap-2">
          <div className="flex-1 min-w-0">
            <h3
              className="text-base font-semibold truncate text-foreground-primary"
              title={installment.description}
            >
              {installment.description}
            </h3>
            {installment.category && (
              <span
                className="text-xs px-2 py-0.5 rounded mt-1 inline-block"
                style={{
                  backgroundColor: `${installment.category.color}20`,
                  color: installment.category.color,
                }}
              >
                {installment.category.name}
              </span>
            )}
          </div>
          <div className="flex gap-1 flex-shrink-0">
            <Button variant="outline" size="sm" onClick={() => onEdit(installment)}>
              Editar
            </Button>
            <Button variant="outline" size="sm" onClick={() => onDelete(installment.id)}>
              Excluir
            </Button>
          </div>
        </div>

        <div>
          <div className="flex justify-between text-xs mb-1 text-foreground-secondary">
            <span>
              {installment.currentInstallment} / {installment.installments} pagas
            </span>
            <span
              className={`font-medium ${isCompleted ? 'text-accent-success' : 'text-foreground-secondary'}`}
            >
              {progress.toFixed(0)}%
            </span>
          </div>
          <div className="w-full bg-background-tertiary rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all ${
                isCompleted ? 'bg-accent-success' : 'bg-accent-primary'
              }`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-x-3 gap-y-2 text-xs">
          <div>
            <span className="text-foreground-tertiary">Parcela:</span>
            <p
              className="font-semibold text-foreground-primary truncate"
              title={installmentData.full}
            >
              {installmentData.formatted}
            </p>
          </div>
          <div>
            <span className="text-foreground-tertiary">Total:</span>
            <p className="font-semibold text-foreground-primary truncate" title={totalData.full}>
              {totalData.formatted}
            </p>
          </div>
          <div>
            <span className="text-foreground-tertiary">Conta:</span>
            <p
              className="font-semibold text-foreground-primary truncate"
              title={installment.account?.name}
            >
              {installment.account?.name}
            </p>
          </div>
          <div>
            <span className="text-foreground-tertiary">Início:</span>
            <p className="font-semibold text-foreground-primary">{formattedStartDate}</p>
          </div>
        </div>

        {!isCompleted && (
          <Button onClick={() => onPay(installment.id)} size="sm" className="w-full">
            Pagar Próxima Parcela
          </Button>
        )}
      </div>
    </Card>
  );
});
