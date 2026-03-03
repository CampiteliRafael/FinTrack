import { AccountRepository } from '../../modules/accounts/account.repository';
import { CategoryRepository } from '../../modules/categories/category.repository';
import { NotFoundError } from '../errors/AppError';

/**
 * Helper para validação de relacionamentos entre entidades
 */
export class ValidationUtil {
  /**
   * Valida se uma conta existe e pertence ao usuário
   */
  static async validateAccount(
    accountRepository: AccountRepository,
    accountId: string,
    userId: string
  ): Promise<void> {
    const account = await accountRepository.findById(accountId, userId);
    if (!account) {
      throw new NotFoundError('Conta não encontrada');
    }
  }

  /**
   * Valida se uma categoria existe e pertence ao usuário
   */
  static async validateCategory(
    categoryRepository: CategoryRepository,
    categoryId: string,
    userId: string
  ): Promise<void> {
    const category = await categoryRepository.findById(categoryId, userId);
    if (!category) {
      throw new NotFoundError('Categoria não encontrada');
    }
  }

  /**
   * Valida conta e categoria em uma única chamada
   */
  static async validateAccountAndCategory(
    accountRepository: AccountRepository,
    categoryRepository: CategoryRepository,
    accountId: string,
    categoryId: string,
    userId: string
  ): Promise<void> {
    await Promise.all([
      ValidationUtil.validateAccount(accountRepository, accountId, userId),
      ValidationUtil.validateCategory(categoryRepository, categoryId, userId),
    ]);
  }

  /**
   * Valida se o tipo da transação corresponde ao tipo da categoria
   */
  static validateTransactionType(
    transactionType: 'income' | 'expense',
    categoryType: 'income' | 'expense'
  ): void {
    if (transactionType !== categoryType) {
      throw new Error('Tipo da transação deve corresponder ao tipo da categoria');
    }
  }
}
