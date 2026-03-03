import { Card } from '../../../components/ui/Card';
import { useNavigate } from 'react-router-dom';

interface Installment {
  id: string;
  description: string;
  currentInstallment: number;
  installments: number;
  totalAmount: number;
}

interface InstallmentsSummaryProps {
  installments: Installment[];
}

export function InstallmentsSummary({ installments }: InstallmentsSummaryProps) {
  const navigate = useNavigate();

  const activeInstallments = installments.filter(
    (inst) => inst.currentInstallment < inst.installments
  );
  const totalPending = activeInstallments.reduce((sum, inst) => {
    const remaining = inst.installments - inst.currentInstallment;
    const installmentAmount = inst.totalAmount / inst.installments;
    return sum + remaining * installmentAmount;
  }, 0);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <Card hover={false}>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-base font-semibold">Parcelamentos</h3>
        <button
          onClick={() => navigate('/installments')}
          className="text-sm text-accent-primary hover:text-accent-primary-hover"
        >
          Ver todos
        </button>
      </div>

      {installments.length === 0 ? (
        <p className="text-foreground-tertiary text-center py-4 text-sm">
          Nenhum parcelamento ativo
        </p>
      ) : (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-background-tertiary rounded p-2">
              <p className="text-xs text-foreground-tertiary">Total Ativos</p>
              <p className="text-lg font-bold text-foreground-primary">
                {activeInstallments.length}
              </p>
            </div>
            <div className="bg-background-tertiary rounded p-2">
              <p className="text-xs text-foreground-tertiary">A Pagar</p>
              <p className="text-lg font-bold text-orange-600">{formatCurrency(totalPending)}</p>
            </div>
          </div>

          {activeInstallments.length > 0 && (
            <div className="pt-2 border-t">
              <p className="text-xs text-foreground-tertiary mb-2">Parcelamentos ativos:</p>
              <div className="space-y-2">
                {activeInstallments.slice(0, 3).map((inst) => {
                  const progress = (inst.currentInstallment / inst.installments) * 100;
                  return (
                    <div key={inst.id}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="truncate font-medium">{inst.description}</span>
                        <span className="text-foreground-tertiary ml-2">
                          {inst.currentInstallment}/{inst.installments}
                        </span>
                      </div>
                      <div className="w-full bg-background-tertiary rounded-full h-1.5">
                        <div
                          className="h-1.5 rounded-full bg-orange-500"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
