import { useState, useEffect, useCallback } from 'react';
import { dashboardService } from '../features/dashboard/services/dashboardService';
import { SummaryCard } from '../features/dashboard/components/SummaryCard';
import { CategoryChart } from '../features/dashboard/components/CategoryChart';
import { RecentTransactions } from '../features/dashboard/components/RecentTransactions';
import { GoalsSummary } from '../features/dashboard/components/GoalsSummary';
import { InstallmentsSummary } from '../features/dashboard/components/InstallmentsSummary';
import { DashboardSummary, CategoryStats } from '../features/dashboard/types/dashboard.types';
import { Transaction } from '../features/transactions/types/transaction.types';
import { goalService } from '../features/goals/services/goal.service';
import { installmentService } from '../features/installments/services/installment.service';
import { Button } from '../components/ui/Button';
import { DashboardSkeleton } from '../components/ui/DashboardSkeleton';
import { useToastContext } from '../contexts/ToastContext';

export default function DashboardPage() {
  const toast = useToastContext();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [categoryStats, setCategoryStats] = useState<CategoryStats[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [goals, setGoals] = useState<any[]>([]);
  const [installments, setInstallments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadDashboard = useCallback(async () => {
    try {
      setLoading(true);
      const [summaryData, categoryData, recentData, goalsResponse, installmentsResponse] =
        await Promise.all([
          dashboardService.getSummary(),
          dashboardService.getByCategory(),
          dashboardService.getRecent(),
          goalService.getGoals(),
          installmentService.getInstallments(),
        ]);
      setSummary(summaryData);
      setCategoryStats(categoryData);
      setRecentTransactions(recentData);
      setGoals(goalsResponse.goals);
      setInstallments(installmentsResponse.installments);
    } catch (error) {
      toast.error('Erro ao carregar dashboard');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  if (loading && !summary) {
    return <DashboardSkeleton />;
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
        <h2 className="text-lg sm:text-xl font-bold">Dashboard</h2>
        <Button variant="secondary" size="sm" onClick={loadDashboard} disabled={loading} className="w-full sm:w-auto">
          {loading ? 'Carregando...' : 'Atualizar'}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
        <SummaryCard title="Saldo Total" value={summary?.totalBalance || 0} type="default" />
        <SummaryCard title="Saldo do Mês" value={summary?.balance || 0} type="default" />
        <SummaryCard title="Receitas" value={summary?.income || 0} type="income" />
        <SummaryCard title="Despesas" value={summary?.expense || 0} type="expense" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
        <CategoryChart data={categoryStats} />
        <RecentTransactions transactions={recentTransactions} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <GoalsSummary goals={goals} />
        <InstallmentsSummary installments={installments} />
      </div>
    </div>
  );
}
