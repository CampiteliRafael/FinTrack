import prisma from '../../../config/database';
import { IInstallmentRepository, InstallmentFilters } from '../../../core/interfaces/IInstallmentRepository';
import { Installment } from '../../../core/entities/Installment';
import { InstallmentMapper } from '../mappers/InstallmentMapper';
import { v4 as uuidv4 } from 'uuid';

export class InstallmentRepositoryImpl implements IInstallmentRepository {
  async findById(id: string, userId: string): Promise<Installment | null> {
    const raw = await prisma.installment.findFirst({
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

    return raw ? InstallmentMapper.toDomain(raw) : null;
  }

  async findAll(
    userId: string,
    filters: InstallmentFilters
  ): Promise<{ installments: Installment[]; total: number }> {
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
      installments: installments.map(InstallmentMapper.toDomain),
      total,
    };
  }

  async create(installment: Omit<Installment, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>): Promise<Installment> {
    const raw = await prisma.installment.create({
      data: {
        id: uuidv4(),
        userId: installment.userId,
        transactionId: installment.transactionId,
        description: installment.description,
        totalAmount: installment.totalAmount,
        installments: installment.installments,
        currentInstallment: installment.currentInstallment,
        accountId: installment.accountId,
        categoryId: installment.categoryId,
        startDate: installment.startDate,
      },
      include: {
        account: true,
        category: true,
      },
    });

    return InstallmentMapper.toDomain(raw);
  }

  async update(
    id: string,
    userId: string,
    data: Partial<Installment>
  ): Promise<Installment | null> {
    const result = await prisma.installment.updateMany({
      where: {
        id,
        userId,
        deletedAt: null,
      },
      data: {
        ...(data.description && { description: data.description }),
        ...(data.currentInstallment !== undefined && { currentInstallment: data.currentInstallment }),
        ...(data.accountId && { accountId: data.accountId }),
        ...(data.categoryId && { categoryId: data.categoryId }),
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

  async incrementInstallment(id: string, userId: string): Promise<Installment | null> {
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
