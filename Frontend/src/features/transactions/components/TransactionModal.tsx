import { TransactionForm } from './TransactionForm';
import {
  Transaction,
  CreateTransactionDTO,
  UpdateTransactionDTO,
} from '../types/transaction.types';
import { transactionService } from '../services/transactionService';
import { Modal } from '../../../components/ui/Modal';
import { useToastContext } from '../../../contexts/ToastContext';
import { handleOperationError } from '../../../shared/utils/error-handler.utils';

interface TransactionModalProps {
  transaction?: Transaction | null;
  onClose: () => void;
}

export function TransactionModal({ transaction, onClose }: TransactionModalProps) {
  const toast = useToastContext();

  async function handleSubmit(data: CreateTransactionDTO | UpdateTransactionDTO) {
    try {
      if (transaction) {
        await transactionService.update(transaction.id, data as UpdateTransactionDTO);
        toast.success('Transação atualizada com sucesso');
      } else {
        await transactionService.create(data as CreateTransactionDTO);
        toast.success('Transação criada com sucesso');
      }
      onClose();
    } catch (error: any) {
      handleOperationError(error, toast.error);
    }
  }

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={transaction ? 'Editar Transação' : 'Nova Transação'}
    >
      <TransactionForm transaction={transaction} onSubmit={handleSubmit} onCancel={onClose} />
    </Modal>
  );
}
