import prisma from '../../../config/database';
import { IGoalRepository, GoalFilters } from '../../../core/interfaces/IGoalRepository';
import { Goal } from '../../../core/entities/Goal';
import { GoalMapper } from '../mappers/GoalMapper';
import { v4 as uuidv4 } from 'uuid';

export class GoalRepositoryImpl implements IGoalRepository {
  async findById(id: string, userId: string): Promise<Goal | null> {
    const raw = await prisma.goal.findFirst({
      where: {
        id,
        userId,
        deletedAt: null,
      },
      include: {
        category: true,
      },
    });

    return raw ? GoalMapper.toDomain(raw) : null;
  }

  async findAll(userId: string, filters: GoalFilters): Promise<{ goals: Goal[]; total: number }> {
    const { categoryId, completed, page = 1, limit = 20 } = filters;
    const skip = (page - 1) * limit;

    interface WhereClause {
      userId: string;
      deletedAt: null;
      categoryId?: string;
      currentAmount?: {
        gte?: typeof prisma.goal.fields.targetAmount;
        lt?: typeof prisma.goal.fields.targetAmount;
      };
    }

    const where: WhereClause = {
      userId,
      deletedAt: null,
    };

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (completed !== undefined) {
      if (completed) {
        where.currentAmount = { gte: prisma.goal.fields.targetAmount };
      } else {
        where.currentAmount = { lt: prisma.goal.fields.targetAmount };
      }
    }

    const [goals, total] = await Promise.all([
      prisma.goal.findMany({
        where,
        include: {
          category: true,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.goal.count({ where }),
    ]);

    return {
      goals: goals.map(GoalMapper.toDomain),
      total,
    };
  }

  async create(goal: Omit<Goal, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>): Promise<Goal> {
    const raw = await prisma.goal.create({
      data: {
        id: uuidv4(),
        userId: goal.userId,
        name: goal.name,
        targetAmount: goal.targetAmount,
        currentAmount: goal.currentAmount,
        deadline: goal.deadline,
        categoryId: goal.categoryId,
      },
      include: {
        category: true,
      },
    });

    return GoalMapper.toDomain(raw);
  }

  async update(id: string, userId: string, data: Partial<Goal>): Promise<Goal | null> {
    const result = await prisma.goal.updateMany({
      where: {
        id,
        userId,
        deletedAt: null,
      },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.targetAmount !== undefined && { targetAmount: data.targetAmount }),
        ...(data.currentAmount !== undefined && { currentAmount: data.currentAmount }),
        ...(data.deadline !== undefined && { deadline: data.deadline }),
        ...(data.categoryId !== undefined && { categoryId: data.categoryId }),
        updatedAt: new Date(),
      },
    });

    if (result.count === 0) return null;

    return this.findById(id, userId);
  }

  async delete(id: string, userId: string): Promise<boolean> {
    const result = await prisma.goal.updateMany({
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

  async addProgress(id: string, userId: string, amount: number): Promise<Goal | null> {
    const goal = await this.findById(id, userId);
    if (!goal) return null;

    const newAmount = goal.currentAmount + amount;

    return this.update(id, userId, { currentAmount: newAmount });
  }
}
