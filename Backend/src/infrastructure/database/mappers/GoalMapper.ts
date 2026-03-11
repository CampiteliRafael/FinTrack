import { Goal as PrismaGoal } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import { Goal } from '../../../core/entities/Goal';

export class GoalMapper {
  static toDomain(raw: PrismaGoal): Goal {
    return new Goal(
      raw.id,
      raw.userId,
      raw.name,
      raw.targetAmount.toNumber(),
      raw.currentAmount.toNumber(),
      raw.deadline,
      raw.categoryId,
      raw.createdAt,
      raw.updatedAt,
      raw.deletedAt
    );
  }

  static toPrisma(domain: Goal): Omit<PrismaGoal, 'category'> {
    return {
      id: domain.id,
      userId: domain.userId,
      name: domain.name,
      targetAmount: new Decimal(domain.targetAmount),
      currentAmount: new Decimal(domain.currentAmount),
      deadline: domain.deadline,
      categoryId: domain.categoryId,
      createdAt: domain.createdAt,
      updatedAt: domain.updatedAt,
      deletedAt: domain.deletedAt,
    };
  }
}
