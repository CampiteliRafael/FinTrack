import { useEffect, useState, useMemo, useCallback } from 'react';
import { useInstallments } from '../features/installments/contexts/InstallmentContext';
import { useAccounts } from '../features/accounts/contexts/AccountContext';
import { useCategories } from '../features/categories/contexts/CategoryContext';
import { InstallmentCard } from '../features/installments/components/InstallmentCard';
import { InstallmentCardSkeleton } from '../features/installments/components/InstallmentCardSkeleton';
import { InstallmentModal } from '../features/installments/components/InstallmentModal';
import { Button } from '../components/ui/Button';
import { Installment } from '../features/installments/types/installment.types';
import { useToast } from '../contexts/ToastContext';
import { FadeIn } from '../components/ui/FadeIn';
import { useConfirmDialog } from '../contexts/ConfirmDialogContext';

export function InstallmentsPage() {
  const { confirm } = useConfirmDialog();
  const {
    installments,
    loading,
    error,
    fetchInstallments,
    createInstallment,
    updateInstallment,
    deleteInstallment,
    payInstallment,
  } = useInstallments();
  const { accounts, fetchAccounts } = useAccounts();
  const { categories, fetchCategories } = useCategories();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedInstallment, setSelectedInstallment] = useState<Installment | undefined>();
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const toast = useToast();

  useEffect(() => {
    // Carregar dados em paralelo
    Promise.all([fetchInstallments(), fetchAccounts(), fetchCategories()]);
  }, [fetchInstallments, fetchAccounts, fetchCategories]);

  const handleCreate = useCallback(() => {
    setSelectedInstallment(undefined);
    setIsModalOpen(true);
  }, []);

  const handleEdit = useCallback((installment: Installment) => {
    setSelectedInstallment(installment);
    setIsModalOpen(true);
  }, []);

  const handleDelete = useCallback(
    async (id: string) => {
      const confirmed = await confirm({
        title: 'Excluir Parcelamento',
        message:
          'Tem certeza que deseja excluir este parcelamento? Esta ação não pode ser desfeita.',
        confirmText: 'Excluir',
        cancelText: 'Cancelar',
        variant: 'danger',
      });

      if (!confirmed) return;

      try {
        await deleteInstallment(id);
        toast.success('Parcelamento excluído com sucesso');
      } catch (error) {
        toast.error('Erro ao excluir parcelamento');
      }
    },
    [deleteInstallment, toast, confirm]
  );

  const handlePay = useCallback(
    async (id: string) => {
      const confirmed = await confirm({
        title: 'Marcar Parcela como Paga',
        message: 'Confirma o pagamento da próxima parcela deste parcelamento?',
        confirmText: 'Confirmar Pagamento',
        cancelText: 'Cancelar',
        variant: 'info',
      });

      if (!confirmed) return;

      try {
        await payInstallment(id);
        toast.success('Parcela paga com sucesso');
      } catch (error) {
        toast.error('Erro ao pagar parcela');
      }
    },
    [payInstallment, toast, confirm]
  );

  const filteredInstallments = useMemo(() => {
    return installments.filter((inst) => {
      const isCompleted = inst.currentInstallment >= inst.installments;
      if (filter === 'active') return !isCompleted;
      if (filter === 'completed') return isCompleted;
      return true;
    });
  }, [installments, filter]);

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
        <h2 className="text-lg sm:text-xl font-bold">Parcelamentos</h2>
        <Button onClick={handleCreate} className="w-full sm:w-auto">
          Novo Parcelamento
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
          Todos
        </Button>
        <Button
          variant={filter === 'active' ? 'primary' : 'outline'}
          onClick={() => setFilter('active')}
          size="sm"
          className="flex-1 sm:flex-none"
        >
          Ativos
        </Button>
        <Button
          variant={filter === 'completed' ? 'primary' : 'outline'}
          onClick={() => setFilter('completed')}
          size="sm"
          className="flex-1 sm:flex-none"
        >
          Concluídos
        </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <InstallmentCardSkeleton key={i} />
          ))}
        </div>
      ) : filteredInstallments.length === 0 ? (
        <div className="text-center py-8 sm:py-12 text-gray-500">
          <p className="text-sm sm:text-base">
            Nenhum parcelamento encontrado. Crie seu primeiro parcelamento para começar!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {filteredInstallments.map((installment, index) => (
            <FadeIn key={installment.id} delay={index * 50}>
              <InstallmentCard
                installment={installment}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onPay={handlePay}
              />
            </FadeIn>
          ))}
        </div>
      )}

      <InstallmentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={
          selectedInstallment
            ? (data) =>
                updateInstallment(selectedInstallment.id, {
                  description: data.description,
                  accountId: data.accountId,
                  categoryId: data.categoryId,
                })
            : createInstallment
        }
        installment={selectedInstallment}
        accounts={accounts}
        categories={categories}
      />
    </div>
  );
}
