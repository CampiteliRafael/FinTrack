import prisma from '../../../config/database';
import { ICategoryRepository } from '../../../core/interfaces/ICategoryRepository';
import { Category } from '../../../core/entities/Category';
import { CategoryMapper } from '../mappers/CategoryMapper';
import { v4 as uuidv4 } from 'uuid';

export class CategoryRepositoryImpl implements ICategoryRepository {
  async findById(id: string, userId: string): Promise<Category | null> {
    const raw = await prisma.category.findFirst({
      where: { id, userId, deletedAt: null },
    });

    return raw ? CategoryMapper.toDomain(raw) : null;
  }

  async findAll(userId: string): Promise<Category[]> {
    const raw = await prisma.category.findMany({
      where: { userId, deletedAt: null },
      orderBy: { name: 'asc' },
    });

    return raw.map(CategoryMapper.toDomain);
  }

  async create(
    category: Omit<Category, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>
  ): Promise<Category> {
    const raw = await prisma.category.create({
      data: {
        id: uuidv4(),
        userId: category.userId,
        name: category.name,
        color: category.color,
        icon: category.icon,
      },
    });

    return CategoryMapper.toDomain(raw);
  }

  async update(id: string, data: Partial<Category>): Promise<Category> {
    const raw = await prisma.category.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.color && { color: data.color }),
        ...(data.icon && { icon: data.icon }),
      },
    });

    return CategoryMapper.toDomain(raw);
  }

  async softDelete(id: string): Promise<void> {
    await prisma.category.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
