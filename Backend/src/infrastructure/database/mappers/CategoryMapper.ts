import { Category as PrismaCategory } from '@prisma/client';
import { Category } from '../../../core/entities/Category';

export class CategoryMapper {
  static toDomain(raw: PrismaCategory): Category {
    return new Category(
      raw.id,
      raw.userId,
      raw.name,
      raw.color,
      raw.icon,
      raw.type,
      raw.createdAt,
      raw.updatedAt,
      raw.deletedAt
    );
  }

  static toPrisma(domain: Category): PrismaCategory {
    return {
      id: domain.id,
      userId: domain.userId,
      name: domain.name,
      color: domain.color,
      icon: domain.icon,
      type: domain.type,
      createdAt: domain.createdAt,
      updatedAt: domain.updatedAt,
      deletedAt: domain.deletedAt,
    } as PrismaCategory;
  }
}
