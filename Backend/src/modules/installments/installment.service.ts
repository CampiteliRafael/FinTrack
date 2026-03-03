import { InstallmentRepository } from './installment.repository';
import { AccountRepository } from '../accounts/account.repository';
import { CategoryRepository } from '../categories/category.repository';
import {
  IInstallment,
  CreateInstallmentData,
  UpdateInstallmentData,
  InstallmentFilters,
} from './installment.types';
import { NotFoundError } from '../../shared/errors/AppError';
import { ValidationUtil } from '../../shared/utils/validation.util';

export class InstallmentService {
  constructor(
    private installmentRepository: InstallmentRepository,
    private accountRepository: AccountRepository,
    private categoryRepository: CategoryRepository
  ) {}

  async getInstallments(userId: string, filters: InstallmentFilters) {
    return this.installmentRepository.findAll(userId, filters);
  }

  async getInstallmentById(id: string, userId: string): Promise<IInstallment> {
    const installment = await this.installmentRepository.findById(id, userId);
    if (!installment) {
      throw new NotFoundError('Parcelamento não encontrado');
    }
    return installment;
  }

  async createInstallment(userId: string, data: CreateInstallmentData): Promise<IInstallment> {
    // ✅ Usar ValidationUtil
    await ValidationUtil.validateAccountAndCategory(
      this.accountRepository,
      this.categoryRepository,
      data.accountId,
      data.categoryId,
      userId
    );

    return this.installmentRepository.create(userId, data);
  }

  async updateInstallment(
    id: string,
    userId: string,
    data: UpdateInstallmentData
  ): Promise<IInstallment> {
    // ✅ Usar ValidationUtil
    if (data.accountId) {
      await ValidationUtil.validateAccount(this.accountRepository, data.accountId, userId);
    }

    if (data.categoryId) {
      await ValidationUtil.validateCategory(this.categoryRepository, data.categoryId, userId);
    }

    const installment = await this.installmentRepository.update(id, userId, data);
    if (!installment) {
      throw new Error('Installment not found');
    }

    return installment;
  }

  async deleteInstallment(id: string, userId: string): Promise<void> {
    const deleted = await this.installmentRepository.delete(id, userId);
    if (!deleted) {
      throw new Error('Installment not found');
    }
  }

  async payInstallment(id: string, userId: string): Promise<IInstallment> {
    const installment = await this.installmentRepository.incrementInstallment(id, userId);
    if (!installment) {
      throw new Error('Installment not found');
    }

    return installment;
  }
}
