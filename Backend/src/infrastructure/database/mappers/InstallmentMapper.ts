import { Installment as PrismaInstallment } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import { Installment } from '../../../core/entities/Installment';

export class InstallmentMapper {
  static toDomain(raw: PrismaInstallment): Installment {
    return new Installment(
      raw.id,
      raw.userId,
      raw.transactionId,
      raw.description,
      raw.totalAmount.toNumber(),
      raw.installments,
      raw.currentInstallment,
      raw.accountId,
      raw.categoryId,
      raw.startDate,
      raw.createdAt,
      raw.updatedAt,
      raw.deletedAt
    );
  }

  static toPrisma(domain: Installment): Omit<PrismaInstallment, 'account' | 'category' | 'transaction'> {
    return {
      id: domain.id,
      userId: domain.userId,
      transactionId: domain.transactionId,
      description: domain.description,
      totalAmount: new Decimal(domain.totalAmount),
      installments: domain.installments,
      currentInstallment: domain.currentInstallment,
      accountId: domain.accountId,
      categoryId: domain.categoryId,
      startDate: domain.startDate,
      createdAt: domain.createdAt,
      updatedAt: domain.updatedAt,
      deletedAt: domain.deletedAt,
    };
  }
}
