import { Request, Response } from 'express';
import { GoalService } from './goal.service';
import { asyncHandler } from '../../shared/utils/asyncHandler';
import { logInfo } from '../../config/logger';

export class GoalController {
  constructor(private goalService: GoalService) {}

  getAll = asyncHandler(async (req: Request, res: Response) => {
    const filters = {
      categoryId: req.query.categoryId as string | undefined,
      completed:
        req.query.completed === 'true'
          ? true
          : req.query.completed === 'false'
            ? false
            : undefined,
      page: Number(req.query.page) || 1,
      limit: Number(req.query.limit) || 20,
    };

    const result = await this.goalService.getGoals(req.user!.userId, filters);
    res.json(result);
  });

  getById = asyncHandler(async (req: Request, res: Response) => {
    const goal = await this.goalService.getGoalById(req.params.id as string, req.user!.userId);
    res.json(goal);
  });

  create = asyncHandler(async (req: Request, res: Response) => {
    logInfo('Create goal request', {
      userId: req.user!.userId,
      body: req.body,
    });

    const goal = await this.goalService.createGoal(req.user!.userId, req.body);

    logInfo('Goal created successfully', { goalId: goal.id });
    res.status(201).json(goal);
  });

  update = asyncHandler(async (req: Request, res: Response) => {
    const goal = await this.goalService.updateGoal(req.params.id as string, req.user!.userId, req.body);
    res.json(goal);
  });

  delete = asyncHandler(async (req: Request, res: Response) => {
    await this.goalService.deleteGoal(req.params.id as string, req.user!.userId);
    res.status(204).send();
  });

  addProgress = asyncHandler(async (req: Request, res: Response) => {
    const { amount } = req.body;
    const goal = await this.goalService.addProgress(req.params.id as string, req.user!.userId, amount);
    res.json(goal);
  });
}
