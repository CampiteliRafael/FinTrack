import { GoalService } from '../../modules/goals/goal.service';
import { GoalRepository } from '../../modules/goals/goal.repository';
import { CategoryRepository } from '../../modules/categories/category.repository';
import { notificationService } from '../../modules/notifications/notification.service';
import { NotificationType } from '../../modules/notifications/notification.types';
import { NotFoundError } from '../../shared/errors/AppError';
import { ValidationUtil } from '../../shared/utils/validation.util';

// Mock dependencies
jest.mock('../../modules/goals/goal.repository');
jest.mock('../../modules/categories/category.repository');
jest.mock('../../modules/notifications/notification.service');
jest.mock('../../shared/utils/validation.util');

describe('GoalService', () => {
  let goalService: GoalService;
  let mockGoalRepository: jest.Mocked<GoalRepository>;
  let mockCategoryRepository: jest.Mocked<CategoryRepository>;

  beforeEach(() => {
    mockGoalRepository = new GoalRepository() as jest.Mocked<GoalRepository>;
    mockCategoryRepository = new CategoryRepository() as jest.Mocked<CategoryRepository>;
    goalService = new GoalService(mockGoalRepository, mockCategoryRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createGoal', () => {
    const userId = 'user-123';
    const createData = {
      name: 'Viagem',
      targetAmount: 10000.00,
      deadline: new Date('2026-12-31'),
      categoryId: 'category-123',
    };

    it('should create goal with category validation', async () => {
      const mockGoal = {
        id: 'goal-123',
        ...createData,
        currentAmount: 0,
        userId,
      };

      (ValidationUtil.validateCategory as jest.Mock).mockResolvedValue(undefined);
      mockGoalRepository.create.mockResolvedValue(mockGoal as any);

      const result = await goalService.createGoal(userId, createData);

      expect(ValidationUtil.validateCategory).toHaveBeenCalledWith(
        mockCategoryRepository,
        createData.categoryId,
        userId
      );
      expect(mockGoalRepository.create).toHaveBeenCalledWith(userId, createData);
      expect(result).toEqual(mockGoal);
    });

    it('should create goal without category', async () => {
      const dataWithoutCategory = {
        name: 'Emergency Fund',
        targetAmount: 5000.00,
      };

      const mockGoal = {
        id: 'goal-456',
        ...dataWithoutCategory,
        currentAmount: 0,
        userId,
        categoryId: null,
      };

      mockGoalRepository.create.mockResolvedValue(mockGoal as any);

      const result = await goalService.createGoal(userId, dataWithoutCategory);

      expect(ValidationUtil.validateCategory).not.toHaveBeenCalled();
      expect(result.categoryId).toBeNull();
    });

    it('should throw error if category validation fails', async () => {
      (ValidationUtil.validateCategory as jest.Mock).mockRejectedValue(
        new NotFoundError('Categoria não encontrada')
      );

      await expect(goalService.createGoal(userId, createData)).rejects.toThrow(NotFoundError);
      expect(mockGoalRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('addProgress', () => {
    const userId = 'user-123';
    const goalId = 'goal-123';

    it('should add progress and send notification when goal is achieved', async () => {
      const previousGoal = {
        id: goalId,
        name: 'Viagem',
        targetAmount: 1000.00,
        currentAmount: 800.00, // Not yet complete
        userId,
      };

      const updatedGoal = {
        ...previousGoal,
        currentAmount: 1000.00, // Now complete
      };

      mockGoalRepository.findById.mockResolvedValue(previousGoal as any);
      mockGoalRepository.addProgress.mockResolvedValue(updatedGoal as any);
      (notificationService.create as jest.Mock).mockResolvedValue(undefined);

      const result = await goalService.addProgress(goalId, userId, 200.00);

      expect(mockGoalRepository.findById).toHaveBeenCalledWith(goalId, userId);
      expect(mockGoalRepository.addProgress).toHaveBeenCalledWith(goalId, userId, 200.00);
      expect(notificationService.create).toHaveBeenCalledWith({
        userId,
        type: NotificationType.GOAL_ACHIEVED,
        title: expect.stringContaining('Meta Alcançada'),
        message: expect.stringContaining('Viagem'),
      });
      expect(result.currentAmount).toBe(1000.00);
    });

    it('should add progress without notification if goal not yet achieved', async () => {
      const previousGoal = {
        id: goalId,
        name: 'Viagem',
        targetAmount: 1000.00,
        currentAmount: 500.00,
        userId,
      };

      const updatedGoal = {
        ...previousGoal,
        currentAmount: 700.00, // Still not complete
      };

      mockGoalRepository.findById.mockResolvedValue(previousGoal as any);
      mockGoalRepository.addProgress.mockResolvedValue(updatedGoal as any);

      const result = await goalService.addProgress(goalId, userId, 200.00);

      expect(mockGoalRepository.addProgress).toHaveBeenCalledWith(goalId, userId, 200.00);
      expect(notificationService.create).not.toHaveBeenCalled();
      expect(result.currentAmount).toBe(700.00);
    });

    it('should not send notification if goal was already completed', async () => {
      const previousGoal = {
        id: goalId,
        name: 'Viagem',
        targetAmount: 1000.00,
        currentAmount: 1000.00, // Already complete
        userId,
      };

      const updatedGoal = {
        ...previousGoal,
        currentAmount: 1200.00, // Still complete
      };

      mockGoalRepository.findById.mockResolvedValue(previousGoal as any);
      mockGoalRepository.addProgress.mockResolvedValue(updatedGoal as any);

      await goalService.addProgress(goalId, userId, 200.00);

      expect(notificationService.create).not.toHaveBeenCalled();
    });

    it('should throw error for negative amount', async () => {
      await expect(goalService.addProgress(goalId, userId, -100.00)).rejects.toThrow(
        'Amount must be positive'
      );

      expect(mockGoalRepository.findById).not.toHaveBeenCalled();
    });

    it('should throw error for zero amount', async () => {
      await expect(goalService.addProgress(goalId, userId, 0)).rejects.toThrow(
        'Amount must be positive'
      );
    });

    it('should throw error if goal not found', async () => {
      mockGoalRepository.findById.mockResolvedValue(null);

      await expect(goalService.addProgress(goalId, userId, 100.00)).rejects.toThrow(
        'Goal not found'
      );
      expect(mockGoalRepository.addProgress).not.toHaveBeenCalled();
    });
  });

  describe('updateGoal', () => {
    const userId = 'user-123';
    const goalId = 'goal-123';

    it('should update goal with category validation', async () => {
      const updateData = {
        name: 'Updated Name',
        targetAmount: 5000.00,
        categoryId: 'category-456',
      };

      const updatedGoal = {
        id: goalId,
        ...updateData,
        userId,
      };

      (ValidationUtil.validateCategory as jest.Mock).mockResolvedValue(undefined);
      mockGoalRepository.update.mockResolvedValue(updatedGoal as any);

      const result = await goalService.updateGoal(goalId, userId, updateData);

      expect(ValidationUtil.validateCategory).toHaveBeenCalledWith(
        mockCategoryRepository,
        updateData.categoryId,
        userId
      );
      expect(mockGoalRepository.update).toHaveBeenCalledWith(goalId, userId, updateData);
      expect(result).toEqual(updatedGoal);
    });

    it('should throw NotFoundError if goal does not exist', async () => {
      mockGoalRepository.update.mockResolvedValue(null);

      await expect(goalService.updateGoal(goalId, userId, { name: 'New Name' })).rejects.toThrow(
        NotFoundError
      );
      await expect(goalService.updateGoal(goalId, userId, { name: 'New Name' })).rejects.toThrow(
        'Meta não encontrada'
      );
    });
  });

  describe('deleteGoal', () => {
    it('should delete goal successfully', async () => {
      mockGoalRepository.delete.mockResolvedValue(true);

      await goalService.deleteGoal('goal-123', 'user-123');

      expect(mockGoalRepository.delete).toHaveBeenCalledWith('goal-123', 'user-123');
    });

    it('should throw error if goal not found', async () => {
      mockGoalRepository.delete.mockResolvedValue(false);

      await expect(goalService.deleteGoal('goal-123', 'user-123')).rejects.toThrow(
        'Goal not found'
      );
    });
  });

  describe('getGoalById', () => {
    it('should return goal if found', async () => {
      const mockGoal = {
        id: 'goal-123',
        name: 'Viagem',
        targetAmount: 10000.00,
        currentAmount: 5000.00,
        userId: 'user-123',
      };

      mockGoalRepository.findById.mockResolvedValue(mockGoal as any);

      const result = await goalService.getGoalById('goal-123', 'user-123');

      expect(result).toEqual(mockGoal);
      expect(mockGoalRepository.findById).toHaveBeenCalledWith('goal-123', 'user-123');
    });

    it('should throw NotFoundError if goal not found', async () => {
      mockGoalRepository.findById.mockResolvedValue(null);

      await expect(goalService.getGoalById('goal-123', 'user-123')).rejects.toThrow(NotFoundError);
      await expect(goalService.getGoalById('goal-123', 'user-123')).rejects.toThrow(
        'Meta não encontrada'
      );
    });
  });

  describe('getGoals', () => {
    it('should return filtered goals', async () => {
      const userId = 'user-123';
      const filters = {
        categoryId: 'category-123',
      };

      const mockGoals = [
        { id: '1', name: 'Goal 1', targetAmount: 1000, currentAmount: 500 },
        { id: '2', name: 'Goal 2', targetAmount: 2000, currentAmount: 1000 },
      ];

      mockGoalRepository.findAll.mockResolvedValue(mockGoals as any);

      const result = await goalService.getGoals(userId, filters);

      expect(mockGoalRepository.findAll).toHaveBeenCalledWith(userId, filters);
      expect(result).toEqual(mockGoals);
      expect(result).toHaveLength(2);
    });
  });
});
