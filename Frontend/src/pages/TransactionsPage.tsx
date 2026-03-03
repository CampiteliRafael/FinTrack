import { useState, useEffect } from 'react';
import { transactionService } from '../features/transactions/services/transactionService';
import { TransactionCard } from '../features/transactions/components/TransactionCard';
import { TransactionModal } from '../features/transactions/components/TransactionModal';
import { Transaction, TransactionFilters } from '../features/transactions/types/transaction.types';
import { Button } from '../components/ui/Button';
import { Pagination } from '../components/ui/Pagination';
import { useToastContext } from '../contexts/ToastContext';
import { useConfirmDialog } from '../contexts/ConfirmDialogContext';

export default function TransactionsPage() {
  const toast = useToastContext();
  const { confirm } = useConfirmDialog();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [filters, setFilters] = useState<TransactionFilters>({ page: 1, limit: 20 });
  const [meta, setMeta] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 });

  useEffect(() => {
    loadTransactions();
  }, [filters]);

  async function loadTransactions() {
    try {
      setLoading(true);
      const result = await transactionService.getAll(filters);
      setTransactions(result.data);
      setMeta(result.meta);
    } catch (error) {
      toast.error('Erro ao carregar transações');
    } finally {
      setLoading(false);
    }
  }

  function handleEdit(transaction: Transaction) {
    setEditingTransaction(transaction);
    setIsModalOpen(true);
  }

  async function handleDelete(id: string) {
    const confirmed = await confirm({
      title: 'Excluir Transação',
      message: 'Tem certeza que deseja excluir esta transação? Esta ação não pode ser desfeita.',
      confirmText: 'Excluir',
      cancelText: 'Cancelar',
      variant: 'danger',
    });

    if (!confirmed) return;

    try {
      await transactionService.delete(id);
      toast.success('Transação excluída com sucesso');
      loadTransactions();
    } catch (error) {
      toast.error('Erro ao excluir transação');
    }
  }

  function handleCloseModal() {
    setIsModalOpen(false);
    setEditingTransaction(null);
    loadTransactions();
  }

  function handlePageChange(page: number) {
    setFilters({ ...filters, page });
  }

  if (loading && transactions.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <p className="text-gray-500">Carregando...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
        <h2 className="text-lg sm:text-xl font-bold">Transações</h2>
        <Button onClick={() => setIsModalOpen(true)} className="w-full sm:w-auto">
          Nova Transação
        </Button>
      </div>

      {transactions.length === 0 ? (
        <div className="text-center py-8 sm:py-12 text-gray-500">
          <p className="text-sm sm:text-base">
            Nenhuma transação cadastrada. Crie sua primeira transação!
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
            {transactions.map((transaction) => (
              <TransactionCard
                key={transaction.id}
                transaction={transaction}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>

          {meta.totalPages > 1 && (
            <div className="flex justify-center">
              <Pagination
                currentPage={meta.page}
                totalPages={meta.totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </>
      )}

      {isModalOpen && (
        <TransactionModal transaction={editingTransaction} onClose={handleCloseModal} />
      )}
    </div>
  );
}
