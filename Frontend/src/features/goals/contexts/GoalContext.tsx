import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Goal, CreateGoalData, UpdateGoalData, GoalFilters } from '../types/goal.types';
import { goalService } from '../services/goal.service';

interface GoalContextType {
  goals: Goal[];
  total: number;
  loading: boolean;
  error: string | null;
  fetchGoals: (filters?: GoalFilters) => Promise<void>;
  createGoal: (data: CreateGoalData) => Promise<void>;
  updateGoal: (id: string, data: UpdateGoalData) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
  addProgress: (id: string, amount: number) => Promise<void>;
}

const GoalContext = createContext<GoalContextType | undefined>(undefined);

export function GoalProvider({ children }: { children: ReactNode }) {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchGoals = useCallback(async (filters?: GoalFilters) => {
    try {
      setLoading(true);
      setError(null);
      const data = await goalService.getGoals(filters);
      setGoals(data.goals);
      setTotal(data.total);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch goals');
    } finally {
      setLoading(false);
    }
  }, []);

  const createGoal = useCallback(
    async (data: CreateGoalData) => {
      try {
        setError(null);
        await goalService.createGoal(data);
        await fetchGoals();
      } catch (err: any) {
        setError(err.response?.data?.error || 'Failed to create goal');
        throw err;
      }
    },
    [fetchGoals]
  );

  const updateGoal = useCallback(
    async (id: string, data: UpdateGoalData) => {
      try {
        setError(null);
        await goalService.updateGoal(id, data);
        await fetchGoals();
      } catch (err: any) {
        setError(err.response?.data?.error || 'Failed to update goal');
        throw err;
      }
    },
    [fetchGoals]
  );

  const deleteGoal = useCallback(
    async (id: string) => {
      try {
        setError(null);
        await goalService.deleteGoal(id);
        await fetchGoals();
      } catch (err: any) {
        setError(err.response?.data?.error || 'Failed to delete goal');
        throw err;
      }
    },
    [fetchGoals]
  );

  const addProgress = useCallback(
    async (id: string, amount: number) => {
      try {
        setError(null);
        await goalService.addProgress(id, amount);
        await fetchGoals();
      } catch (err: any) {
        setError(err.response?.data?.error || 'Failed to add progress');
        throw err;
      }
    },
    [fetchGoals]
  );

  return (
    <GoalContext.Provider
      value={{
        goals,
        total,
        loading,
        error,
        fetchGoals,
        createGoal,
        updateGoal,
        deleteGoal,
        addProgress,
      }}
    >
      {children}
    </GoalContext.Provider>
  );
}

export function useGoals() {
  const context = useContext(GoalContext);
  if (!context) {
    throw new Error('useGoals must be used within a GoalProvider');
  }
  return context;
}
