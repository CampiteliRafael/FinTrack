import { AccountForm } from './AccountForm';
import { Account, CreateAccountDTO, UpdateAccountDTO } from '../types/account.types';
import { useAccounts } from '../contexts/AccountContext';
import { Modal } from '../../../components/ui/Modal';
import { useToastContext } from '../../../contexts/ToastContext';
import { handleOperationError } from '../../../shared/utils/error-handler.utils';

interface AccountModalProps {
  account?: Account | null;
  onClose: () => void;
}

export function AccountModal({ account, onClose }: AccountModalProps) {
  const toast = useToastContext();
  const { createAccount, updateAccount } = useAccounts();

  async function handleSubmit(data: CreateAccountDTO | UpdateAccountDTO) {
    try {
      if (account) {
        await updateAccount(account.id, data as UpdateAccountDTO);
        toast.success('Conta atualizada com sucesso');
      } else {
        await createAccount(data as CreateAccountDTO);
        toast.success('Conta criada com sucesso');
      }
      onClose();
    } catch (error: any) {
      handleOperationError(error, toast.error);
    }
  }

  return (
    <Modal isOpen={true} onClose={onClose} title={account ? 'Editar Conta' : 'Nova Conta'}>
      <AccountForm account={account} onSubmit={handleSubmit} onCancel={onClose} />
    </Modal>
  );
}
