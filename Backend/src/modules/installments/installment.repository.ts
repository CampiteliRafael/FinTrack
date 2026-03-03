import prisma from '../../config/database';
import {
  IInstallment,
  CreateInstallmentData,
  UpdateInstallmentData,
  InstallmentFilters,
} from './installment.types';
import { v4 as uuidv4 } from 'uuid';

export class InstallmentRepository {
  async findById(id: string, userId: string): Promise<IInstallment | null> {
    const installment = await prisma.installment.findFirst({
      where: {
        id,
        userId,
        deletedAt: null,
      },
      include: {
        account: true,
        category: true,
        transaction: true,
      },
    });

    if (!installment) return null;

    return {
      ...installment,
      totalAmount: installment.totalAmount.toNumber(),
      transactionId: installment.transactionId ?? undefined,
    };
  }

  async findAll(
    userId: string,
    filters: InstallmentFilters
  ): Promise<{ installments: IInstallment[]; total: number }> {
    const { accountId, categoryId, completed, page = 1, limit = 20 } = filters;
    const skip = (page - 1) * limit;

    interface WhereClause {
      userId: string;
      deletedAt: null;
      accountId?: string;
      categoryId?: string;
      currentInstallment?: {
        gte?: typeof prisma.installment.fields.installments;
        lt?: typeof prisma.installment.fields.installments;
      };
    }

    const where: WhereClause = {
      userId,
      deletedAt: null,
    };

    if (accountId) {
      where.accountId = accountId;
    }

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (completed !== undefined) {
      if (completed) {
        where.currentInstallment = { gte: prisma.installment.fields.installments };
      } else {
        where.currentInstallment = { lt: prisma.installment.fields.installments };
      }
    }

    const [installments, total] = await Promise.all([
      prisma.installment.findMany({
        where,
        include: {
          account: true,
          category: true,
          transaction: true,
        },
        orderBy: { startDate: 'desc' },
        skip,
        take: limit,
      }),
      prisma.installment.count({ where }),
    ]);

    return {
      installments: installments.map((inst) => ({
        ...inst,
        totalAmount: inst.totalAmount.toNumber(),
        transactionId: inst.transactionId ?? undefined,
      })),
      total,
    };
  }

  async create(userId: string, data: CreateInstallmentData): Promise<IInstallment> {
    const installment = await prisma.installment.create({
      data: {
        id: uuidv4(),
        userId,
        description: data.description,
        totalAmount: data.totalAmount,
        installments: data.installments,
        accountId: data.accountId,
        categoryId: data.categoryId,
        startDate: data.startDate,
      },
      include: {
        account: true,
        category: true,
      },
    });

    return {
      ...installment,
      totalAmount: installment.totalAmount.toNumber(),
      transactionId: installment.transactionId ?? undefined,
    };
  }

  async update(
    id: string,
    userId: string,
    data: UpdateInstallmentData
  ): Promise<IInstallment | null> {
    const result = await prisma.installment.updateMany({
      where: {
        id,
        userId,
        deletedAt: null,
      },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    });

    if (result.count === 0) return null;

    return this.findById(id, userId);
  }

  async delete(id: string, userId: string): Promise<boolean> {
    const result = await prisma.installment.updateMany({
      where: {
        id,
        userId,
        deletedAt: null,
      },
      data: {
        deletedAt: new Date(),
      },
    });

    return result.count > 0;
  }

  async incrementInstallment(id: string, userId: string): Promise<IInstallment | null> {
    const installment = await this.findById(id, userId);
    if (!installment) return null;

    if (installment.currentInstallment >= installment.installments) {
      throw new Error('All installments already paid');
    }

    return this.update(id, userId, {
      currentInstallment: installment.currentInstallment + 1,
    });
  }
}
