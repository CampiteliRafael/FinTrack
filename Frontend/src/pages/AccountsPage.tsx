import { useState, useEffect } from 'react';
import { useAccounts } from '../features/accounts/contexts/AccountContext';
import { AccountCard } from '../features/accounts/components/AccountCard';
import { AccountModal } from '../features/accounts/components/AccountModal';
import { Account } from '../features/accounts/types/account.types';
import { Button } from '../components/ui/Button';
import { LoadingOverlay } from '../components/ui/LoadingOverlay';
import { FadeIn } from '../components/ui/FadeIn';
import { useToastContext } from '../contexts/ToastContext';
import { useConfirmDialog } from '../contexts/ConfirmDialogContext';

export default function AccountsPage() {
  const toast = useToastContext();
  const { confirm } = useConfirmDialog();
  const { accounts, loading, fetchAccounts, deleteAccount } = useAccounts();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  function handleEdit(account: Account) {
    setEditingAccount(account);
    setIsModalOpen(true);
  }

  async function handleDelete(id: string) {
    const confirmed = await confirm({
      title: 'Excluir Conta',
      message: 'Tem certeza que deseja excluir esta conta? Esta ação não pode ser desfeita.',
      confirmText: 'Excluir',
      cancelText: 'Cancelar',
      variant: 'danger',
    });

    if (!confirmed) return;

    try {
      await deleteAccount(id);
      toast.success('Conta excluída com sucesso');
    } catch (error) {
      toast.error('Erro ao excluir conta');
    }
  }

  function handleCloseModal() {
    setIsModalOpen(false);
    setEditingAccount(null);
  }

  return (
    <div>
      {loading && accounts.length === 0 && <LoadingOverlay label="Carregando contas..." />}

      <div className="flex justify-end mb-4 sm:mb-6">
        <Button onClick={() => setIsModalOpen(true)}>Nova Conta</Button>
      </div>

      {accounts.length === 0 && !loading ? (
        <div className="text-center py-8 sm:py-12 text-foreground-tertiary">
          <p className="text-sm sm:text-base">Nenhuma conta cadastrada. Crie sua primeira conta!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {accounts.map((account, index) => (
            <FadeIn key={account.id} delay={index * 50}>
              <AccountCard account={account} onEdit={handleEdit} onDelete={handleDelete} />
            </FadeIn>
          ))}
        </div>
      )}

      {isModalOpen && <AccountModal account={editingAccount} onClose={handleCloseModal} />}
    </div>
  );
}
