import { memo, useMemo } from 'react';
import { Goal } from '../types/goal.types';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { formatCurrencyWithScale } from '../../../utils/formatCurrency';

interface GoalCardProps {
  goal: Goal;
  onEdit: (goal: Goal) => void;
  onDelete: (id: string) => void;
  onAddProgress: (goal: Goal) => void;
}

export const GoalCard = memo(function GoalCard({
  goal,
  onEdit,
  onDelete,
  onAddProgress,
}: GoalCardProps) {
  const progress = useMemo(
    () => (goal.currentAmount / goal.targetAmount) * 100,
    [goal.currentAmount, goal.targetAmount]
  );

  const isCompleted = useMemo(
    () => goal.currentAmount >= goal.targetAmount,
    [goal.currentAmount, goal.targetAmount]
  );

  const daysRemaining = useMemo(() => {
    if (!goal.deadline) return null;
    return Math.ceil((new Date(goal.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  }, [goal.deadline]);

  const currentData = formatCurrencyWithScale(goal.currentAmount);
  const targetData = formatCurrencyWithScale(goal.targetAmount);

  return (
    <Card hover={false}>
      <div className="flex flex-col gap-3">
        <div className="flex justify-between items-start gap-2">
          <div className="flex-1 min-w-0">
            <h3
              className="text-base font-semibold truncate text-foreground-primary"
              title={goal.name}
            >
              {goal.name}
            </h3>
            {goal.category && (
              <span
                className="text-xs px-2 py-0.5 rounded mt-1 inline-block"
                style={{ backgroundColor: `${goal.category.color}20`, color: goal.category.color }}
              >
                {goal.category.name}
              </span>
            )}
          </div>
          <div className="flex gap-1 flex-shrink-0">
            <Button variant="outline" size="sm" onClick={() => onEdit(goal)}>
              Editar
            </Button>
            <Button variant="outline" size="sm" onClick={() => onDelete(goal.id)}>
              Excluir
            </Button>
          </div>
        </div>

        <div>
          <div className="flex justify-between items-start text-xs mb-1 text-foreground-secondary">
            <div className="flex-1 min-w-0">
              <span className="truncate" title={`${currentData.full} / ${targetData.full}`}>
                {currentData.formatted} / {targetData.formatted}
              </span>
            </div>
            <span
              className={`font-medium ml-2 flex-shrink-0 ${isCompleted ? 'text-accent-success' : 'text-foreground-secondary'}`}
            >
              {progress.toFixed(0)}%
            </span>
          </div>
          <div className="w-full bg-background-tertiary rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all ${
                isCompleted ? 'bg-accent-success' : 'bg-accent-primary'
              }`}
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
        </div>

        {daysRemaining !== null && (
          <div className="text-xs text-foreground-secondary">
            {daysRemaining > 0 ? (
              <span>
                {daysRemaining} {daysRemaining === 1 ? 'dia restante' : 'dias restantes'}
              </span>
            ) : daysRemaining === 0 ? (
              <span className="text-accent-warning">Vence hoje</span>
            ) : (
              <span className="text-accent-danger">
                {Math.abs(daysRemaining)} {Math.abs(daysRemaining) === 1 ? 'dia' : 'dias'} atrasado
              </span>
            )}
          </div>
        )}

        {!isCompleted && (
          <Button onClick={() => onAddProgress(goal)} size="sm" className="w-full">
            Adicionar Progresso
          </Button>
        )}
      </div>
    </Card>
  );
});
