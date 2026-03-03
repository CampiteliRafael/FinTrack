import prisma from '../../config/database';
import { IGoal, CreateGoalData, UpdateGoalData, GoalFilters } from './goal.types';
import { v4 as uuidv4 } from 'uuid';

export class GoalRepository {
  async findById(id: string, userId: string): Promise<IGoal | null> {
    const goal = await prisma.goal.findFirst({
      where: {
        id,
        userId,
        deletedAt: null,
      },
      include: {
        category: true,
      },
    });

    if (!goal) return null;

    return {
      ...goal,
      targetAmount: goal.targetAmount.toNumber(),
      currentAmount: goal.currentAmount.toNumber(),
    };
  }

  async findAll(userId: string, filters: GoalFilters): Promise<{ goals: IGoal[]; total: number }> {
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
      goals: goals.map((goal) => ({
        ...goal,
        targetAmount: goal.targetAmount.toNumber(),
        currentAmount: goal.currentAmount.toNumber(),
      })),
      total,
    };
  }

  async create(userId: string, data: CreateGoalData): Promise<IGoal> {
    const goal = await prisma.goal.create({
      data: {
        id: uuidv4(),
        userId,
        name: data.name,
        targetAmount: data.targetAmount,
        deadline: data.deadline,
        categoryId: data.categoryId,
      },
      include: {
        category: true,
      },
    });

    return {
      ...goal,
      targetAmount: goal.targetAmount.toNumber(),
      currentAmount: goal.currentAmount.toNumber(),
    };
  }

  async update(id: string, userId: string, data: UpdateGoalData): Promise<IGoal | null> {
    const goal = await prisma.goal.updateMany({
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

    if (goal.count === 0) return null;

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

  async addProgress(id: string, userId: string, amount: number): Promise<IGoal | null> {
    const goal = await this.findById(id, userId);
    if (!goal) return null;

    const newAmount = goal.currentAmount + amount;

    return this.update(id, userId, { currentAmount: newAmount });
  }
}
