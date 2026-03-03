import { useEffect, useState, useMemo, useCallback } from 'react';
import { useGoals } from '../features/goals/contexts/GoalContext';
import { useCategories } from '../features/categories/contexts/CategoryContext';
import { GoalCard } from '../features/goals/components/GoalCard';
import { GoalCardSkeleton } from '../features/goals/components/GoalCardSkeleton';
import { GoalModal } from '../features/goals/components/GoalModal';
import { ProgressModal } from '../features/goals/components/ProgressModal';
import { Button } from '../components/ui/Button';
import { Goal } from '../features/goals/types/goal.types';
import { useToast } from '../contexts/ToastContext';
import { FadeIn } from '../components/ui/FadeIn';
import { useConfirmDialog } from '../contexts/ConfirmDialogContext';

export function GoalsPage() {
  const { confirm } = useConfirmDialog();
  const { goals, loading, error, fetchGoals, createGoal, updateGoal, deleteGoal, addProgress } =
    useGoals();
  const { categories, fetchCategories } = useCategories();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProgressModalOpen, setIsProgressModalOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<Goal | undefined>();
  const [selectedGoalForProgress, setSelectedGoalForProgress] = useState<Goal | undefined>();
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const toast = useToast();

  useEffect(() => {
    Promise.all([fetchGoals(), fetchCategories()]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCreate = useCallback(() => {
    setSelectedGoal(undefined);
    setIsModalOpen(true);
  }, []);

  const handleEdit = useCallback((goal: Goal) => {
    setSelectedGoal(goal);
    setIsModalOpen(true);
  }, []);

  const handleDelete = useCallback(
    async (id: string) => {
      const confirmed = await confirm({
        title: 'Excluir Meta',
        message: 'Tem certeza que deseja excluir esta meta? Esta ação não pode ser desfeita.',
        confirmText: 'Excluir',
        cancelText: 'Cancelar',
        variant: 'danger',
      });

      if (!confirmed) return;

      try {
        await deleteGoal(id);
        toast.success('Meta excluída com sucesso');
      } catch (error) {
        toast.error('Erro ao excluir meta');
      }
    },
    [deleteGoal, toast, confirm]
  );

  const handleAddProgress = useCallback((goal: Goal) => {
    setSelectedGoalForProgress(goal);
    setIsProgressModalOpen(true);
  }, []);

  const handleSubmitProgress = useCallback(
    async (amount: number) => {
      if (selectedGoalForProgress) {
        try {
          await addProgress(selectedGoalForProgress.id, amount);
          toast.success('Progresso adicionado com sucesso');
        } catch (error) {
          toast.error('Erro ao adicionar progresso');
        }
      }
    },
    [selectedGoalForProgress, addProgress, toast]
  );

  const filteredGoals = useMemo(() => {
    return goals.filter((goal) => {
      const isCompleted = goal.currentAmount >= goal.targetAmount;
      if (filter === 'active') return !isCompleted;
      if (filter === 'completed') return isCompleted;
      return true;
    });
  }, [goals, filter]);

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
        <h2 className="text-lg sm:text-xl font-bold">Metas</h2>
        <Button onClick={handleCreate} className="w-full sm:w-auto">
          Nova Meta
        </Button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="flex flex-wrap gap-2 mb-4 sm:mb-6">
        <Button
          variant={filter === 'all' ? 'primary' : 'outline'}
          onClick={() => setFilter('all')}
          size="sm"
          className="flex-1 sm:flex-none"
        >
          Todas
        </Button>
        <Button
          variant={filter === 'active' ? 'primary' : 'outline'}
          onClick={() => setFilter('active')}
          size="sm"
          className="flex-1 sm:flex-none"
        >
          Ativas
        </Button>
        <Button
          variant={filter === 'completed' ? 'primary' : 'outline'}
          onClick={() => setFilter('completed')}
          size="sm"
          className="flex-1 sm:flex-none"
        >
          Concluídas
        </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <GoalCardSkeleton key={i} />
          ))}
        </div>
      ) : filteredGoals.length === 0 ? (
        <div className="text-center py-8 sm:py-12 text-gray-500">
          <p className="text-sm sm:text-base">
            Nenhuma meta encontrada. Crie sua primeira meta para começar!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {filteredGoals.map((goal, index) => (
            <FadeIn key={goal.id} delay={index * 50}>
              <GoalCard
                goal={goal}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onAddProgress={handleAddProgress}
              />
            </FadeIn>
          ))}
        </div>
      )}

      <GoalModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={selectedGoal ? (data) => updateGoal(selectedGoal.id, data) : createGoal}
        goal={selectedGoal}
        categories={categories}
      />

      {selectedGoalForProgress && (
        <ProgressModal
          isOpen={isProgressModalOpen}
          onClose={() => setIsProgressModalOpen(false)}
          onSubmit={handleSubmitProgress}
          goal={selectedGoalForProgress}
        />
      )}
    </div>
  );
}
