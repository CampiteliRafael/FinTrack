import prisma from '../../config/database';
import { Category, Prisma } from '@prisma/client';

export class CategoryRepository {
  async findAll(userId: string): Promise<Category[]> {
    return prisma.category.findMany({
      where: {
        userId,
        deletedAt: null,
      },
      orderBy: { name: 'asc' },
    });
  }

  async findById(id: string, userId: string): Promise<Category | null> {
    return prisma.category.findFirst({
      where: { id, userId, deletedAt: null },
    });
  }

  async create(data: Prisma.CategoryCreateInput): Promise<Category> {
    return prisma.category.create({ data });
  }

  async update(id: string, data: Prisma.CategoryUpdateInput): Promise<Category> {
    return prisma.category.update({
      where: { id },
      data,
    });
  }

  async softDelete(id: string): Promise<void> {
    await prisma.category.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
