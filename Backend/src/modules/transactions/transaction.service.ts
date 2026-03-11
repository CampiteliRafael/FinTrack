import { ITransactionRepository } from '../../core/interfaces/ITransactionRepository';
import { IAccountRepository } from '../../core/interfaces/IAccountRepository';
import { ICategoryRepository } from '../../core/interfaces/ICategoryRepository';
import {
  CreateTransactionDTO,
  UpdateTransactionDTO,
  TransactionFilters,
} from './transaction.types';
import { NotFoundError } from '../../shared/errors/AppError';
import { ValidationUtil } from '../../shared/utils/validation.util';

export class TransactionService {
  constructor(
    private transactionRepository: ITransactionRepository,
    private accountRepository: IAccountRepository,
    private categoryRepository: ICategoryRepository
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
    await ValidationUtil.validateAccountAndCategory(
      this.accountRepository,
      this.categoryRepository,
      data.accountId,
      data.categoryId,
      userId
    );

    return this.transactionRepository.createWithBalanceUpdate(
      {
        userId,
        accountId: data.accountId,
        categoryId: data.categoryId,
        type: data.type,
        amount: data.amount,
        description: data.description,
        date: data.date,
      },
      data.accountId,
      data.type,
      Number(data.amount)
    );
  }

  async update(id: string, userId: string, data: UpdateTransactionDTO) {
    const oldTransaction = await this.transactionRepository.findByIdWithRelations(id, userId);
    if (!oldTransaction) {
      throw new NotFoundError('Transação não encontrada');
    }

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
      const updates: any = {};
      if (data.type) updates.type = data.type;
      if (data.amount) updates.amount = data.amount;
      if (data.description !== undefined) updates.description = data.description;
      if (data.date) updates.date = data.date;
      if (data.accountId) updates.accountId = data.accountId;
      if (data.categoryId) updates.categoryId = data.categoryId;

      return this.transactionRepository.updateWithBalanceUpdate(
        id,
        oldTransaction,
        updates,
        data.amount ? Number(data.amount) : undefined,
        data.type,
        data.accountId
      );
    }

    return this.transactionRepository.update(id, data);
  }

  async delete(id: string, userId: string) {
    const transaction = await this.transactionRepository.findById(id, userId);
    if (!transaction) {
      throw new NotFoundError('Transação não encontrada');
    }
    await this.transactionRepository.softDeleteWithBalanceUpdate(transaction);
  }
}
