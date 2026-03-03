import { TransactionRepository } from './transaction.repository';
import { AccountRepository } from '../accounts/account.repository';
import { CategoryRepository } from '../categories/category.repository';
import {
  CreateTransactionDTO,
  UpdateTransactionDTO,
  TransactionFilters,
} from './transaction.types';
import { NotFoundError } from '../../shared/errors/AppError';
import { ValidationUtil } from '../../shared/utils/validation.util';

export class TransactionService {
  constructor(
    private transactionRepository: TransactionRepository,
    private accountRepository: AccountRepository,
    private categoryRepository: CategoryRepository
  ) {}

  async getAll(userId: string, filters: TransactionFilters) {
    return this.transactionRepository.findAll(userId, filters);
  }

  async getById(id: string, userId: string) {
    const transaction = await this.transactionRepository.findById(id, userId);
    if (!transaction) {
      throw new NotFoundError('Transação não encontrada');
    }
    return transaction;
  }

  async create(userId: string, data: CreateTransactionDTO) {
    // ✅ Usar ValidationUtil para validar relacionamentos
    await ValidationUtil.validateAccountAndCategory(
      this.accountRepository,
      this.categoryRepository,
      data.accountId,
      data.categoryId,
      userId
    );

    // Usar método que atualiza o saldo automaticamente
    return this.transactionRepository.createWithBalanceUpdate(
      {
        type: data.type,
        amount: data.amount,
        description: data.description,
        date: data.date,
        user: { connect: { id: userId } },
        account: { connect: { id: data.accountId } },
        category: { connect: { id: data.categoryId } },
      },
      data.accountId,
      data.type,
      Number(data.amount)
    );
  }

  async update(id: string, userId: string, data: UpdateTransactionDTO) {
    // ✅ Buscar transação com account incluído (necessário para updateWithBalanceUpdate)
    const oldTransaction = await this.transactionRepository.findById(id, userId);
    if (!oldTransaction) {
      throw new NotFoundError('Transação não encontrada');
    }

    // ✅ Usar ValidationUtil para validar relacionamentos
    if (data.accountId) {
      await ValidationUtil.validateAccount(this.accountRepository, data.accountId, userId);
    }

    if (data.categoryId) {
      await ValidationUtil.validateCategory(this.categoryRepository, data.categoryId, userId);
    }

    // Verificar se mudou valores que afetam o saldo
    const hasBalanceImpact =
      data.amount !== undefined || data.type !== undefined || data.accountId !== undefined;

    if (hasBalanceImpact) {
      interface UpdateInput {
        type?: 'income' | 'expense';
        amount?: number;
        description?: string | null;
        date?: Date;
        account?: { connect: { id: string } };
        category?: { connect: { id: string } };
      }

      const updateInput: UpdateInput = {};
      if (data.type) updateInput.type = data.type;
      if (data.amount) updateInput.amount = data.amount;
      if (data.description !== undefined) updateInput.description = data.description;
      if (data.date) updateInput.date = data.date;
      if (data.accountId) updateInput.account = { connect: { id: data.accountId } };
      if (data.categoryId) updateInput.category = { connect: { id: data.categoryId } };

      return this.transactionRepository.updateWithBalanceUpdate(
        id,
        oldTransaction,
        updateInput,
        data.amount ? Number(data.amount) : undefined,
        data.type,
        data.accountId
      );
    }

    return this.transactionRepository.update(id, data);
  }

  async delete(id: string, userId: string) {
    // ✅ Buscar transação com account incluído (necessário para softDeleteWithBalanceUpdate)
    const transaction = await this.transactionRepository.findById(id, userId);
    if (!transaction) {
      throw new NotFoundError('Transação não encontrada');
    }
    await this.transactionRepository.softDeleteWithBalanceUpdate(transaction);
  }
}
