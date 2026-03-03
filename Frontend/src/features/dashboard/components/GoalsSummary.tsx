import { Card } from '../../../components/ui/Card';
import { useNavigate } from 'react-router-dom';

interface Goal {
  id: string;
  name: string;
  currentAmount: number;
  targetAmount: number;
}

interface GoalsSummaryProps {
  goals: Goal[];
}

export function GoalsSummary({ goals }: GoalsSummaryProps) {
  const navigate = useNavigate();

  const activeGoals = goals.filter((goal) => goal.currentAmount < goal.targetAmount);
  const totalTarget = goals.reduce((sum, goal) => sum + goal.targetAmount, 0);
  const totalCurrent = goals.reduce((sum, goal) => sum + goal.currentAmount, 0);
  const overallProgress = totalTarget > 0 ? (totalCurrent / totalTarget) * 100 : 0;

  return (
    <Card hover={false}>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-base font-semibold">Metas</h3>
        <button
          onClick={() => navigate('/goals')}
          className="text-sm text-accent-primary hover:text-accent-primary-hover"
        >
          Ver todas
        </button>
      </div>

      {goals.length === 0 ? (
        <p className="text-foreground-tertiary text-center py-4 text-sm">Nenhuma meta cadastrada</p>
      ) : (
        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-foreground-secondary">Progresso Geral</span>
              <span className="font-semibold">{overallProgress.toFixed(0)}%</span>
            </div>
            <div className="w-full bg-background-tertiary rounded-full h-2">
              <div
                className="h-2 rounded-full bg-accent-primary transition-all"
                style={{ width: `${Math.min(overallProgress, 100)}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="bg-background-tertiary rounded p-2">
              <p className="text-xs text-foreground-tertiary">Total de Metas</p>
              <p className="text-lg font-bold text-foreground-primary">{goals.length}</p>
            </div>
            <div className="bg-background-tertiary rounded p-2">
              <p className="text-xs text-foreground-tertiary">Ativas</p>
              <p className="text-lg font-bold text-accent-primary">{activeGoals.length}</p>
            </div>
          </div>

          {activeGoals.length > 0 && (
            <div className="pt-2 border-t">
              <p className="text-xs text-foreground-tertiary mb-2">Próximas metas:</p>
              <div className="space-y-2">
                {activeGoals.slice(0, 3).map((goal) => {
                  const progress = (goal.currentAmount / goal.targetAmount) * 100;
                  return (
                    <div key={goal.id}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="truncate font-medium">{goal.name}</span>
                        <span className="text-foreground-tertiary ml-2">
                          {progress.toFixed(0)}%
                        </span>
                      </div>
                      <div className="w-full bg-background-tertiary rounded-full h-1.5">
                        <div
                          className="h-1.5 rounded-full bg-accent-primary"
                          style={{ width: `${Math.min(progress, 100)}%` }}
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
