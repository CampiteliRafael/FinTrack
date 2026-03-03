import { GoalRepository } from './goal.repository';
import { CategoryRepository } from '../categories/category.repository';
import { IGoal, CreateGoalData, UpdateGoalData, GoalFilters } from './goal.types';
import { notificationService } from '../notifications/notification.service';
import { NotificationType } from '../notifications/notification.types';
import { NotFoundError } from '../../shared/errors/AppError';
import { ValidationUtil } from '../../shared/utils/validation.util';

export class GoalService {
  constructor(
    private goalRepository: GoalRepository,
    private categoryRepository: CategoryRepository
  ) {}

  async getGoals(userId: string, filters: GoalFilters) {
    return this.goalRepository.findAll(userId, filters);
  }

  async getGoalById(id: string, userId: string): Promise<IGoal> {
    const goal = await this.goalRepository.findById(id, userId);
    if (!goal) {
      throw new NotFoundError('Meta não encontrada');
    }
    return goal;
  }

  async createGoal(userId: string, data: CreateGoalData): Promise<IGoal> {
    // ✅ Usar ValidationUtil
    if (data.categoryId) {
      await ValidationUtil.validateCategory(this.categoryRepository, data.categoryId, userId);
    }

    return this.goalRepository.create(userId, data);
  }

  async updateGoal(id: string, userId: string, data: UpdateGoalData): Promise<IGoal> {
    // ✅ Usar ValidationUtil
    if (data.categoryId) {
      await ValidationUtil.validateCategory(this.categoryRepository, data.categoryId, userId);
    }

    const goal = await this.goalRepository.update(id, userId, data);
    if (!goal) {
      throw new NotFoundError('Meta não encontrada');
    }

    return goal;
  }

  async deleteGoal(id: string, userId: string): Promise<void> {
    const deleted = await this.goalRepository.delete(id, userId);
    if (!deleted) {
      throw new Error('Goal not found');
    }
  }

  async addProgress(id: string, userId: string, amount: number): Promise<IGoal> {
    if (amount <= 0) {
      throw new Error('Amount must be positive');
    }

    const previousGoal = await this.goalRepository.findById(id, userId);
    if (!previousGoal) {
      throw new Error('Goal not found');
    }

    const wasNotCompleted = previousGoal.currentAmount < previousGoal.targetAmount;

    const goal = await this.goalRepository.addProgress(id, userId, amount);
    if (!goal) {
      throw new Error('Goal not found');
    }

    const isNowCompleted = goal.currentAmount >= goal.targetAmount;

    // Criar notificação quando meta é alcançada
    if (wasNotCompleted && isNowCompleted) {
      await notificationService.create({
        userId,
        type: NotificationType.GOAL_ACHIEVED,
        title: '🎯 Meta Alcançada!',
        message: `Parabéns! Você atingiu a meta "${goal.name}" de R$ ${goal.targetAmount.toFixed(2)}`,
      });
    }

    return goal;
  }
}
