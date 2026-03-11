import { IAccountRepository } from '../../core/interfaces/IAccountRepository';
import { CreateAccountDTO, UpdateAccountDTO } from './account.types';
import { NotFoundError } from '../../shared/errors/AppError';

export class AccountService {
  constructor(private accountRepository: IAccountRepository) {}

  async getAll(userId: string) {
    return this.accountRepository.findAll(userId);
  }

  async getById(id: string, userId: string) {
    const account = await this.accountRepository.findById(id, userId);
    if (!account) {
      throw new NotFoundError('Conta não encontrada');
    }
    return account;
  }

  async create(userId: string, data: CreateAccountDTO) {
    return this.accountRepository.createWithInitialBalance({
      userId,
      name: data.name,
      initialBalance: data.initialBalance,
      type: data.type,
    });
  }

  async update(id: string, userId: string, data: UpdateAccountDTO) {
    const account = await this.getById(id, userId);

    // Se está alterando o saldo, criar evento de ajuste
    if (
      data.currentBalance !== undefined &&
      data.currentBalance !== Number(account.initialBalance)
    ) {
      return this.accountRepository.updateWithBalanceAdjustment(id, account, data.currentBalance);
    }

    return this.accountRepository.update(id, data);
  }

  async delete(id: string, userId: string) {
    await this.getById(id, userId);
    await this.accountRepository.softDelete(id);
  }
}
