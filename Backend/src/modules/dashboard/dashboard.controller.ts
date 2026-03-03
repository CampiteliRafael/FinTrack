import { Request, Response } from 'express';
import { DashboardService } from './dashboard.service';
import { asyncHandler } from '../../shared/utils/asyncHandler';

export class DashboardController {
  constructor(private dashboardService: DashboardService) {}

  getSummary = asyncHandler(async (req: Request, res: Response) => {
    const summary = await this.dashboardService.getSummary(req.user!.userId);
    res.json(summary);
  });

  getByCategory = asyncHandler(async (req: Request, res: Response) => {
    const data = await this.dashboardService.getByCategory(req.user!.userId);
    res.json(data);
  });

  getRecent = asyncHandler(async (req: Request, res: Response) => {
    const transactions = await this.dashboardService.getRecent(req.user!.userId);
    res.json(transactions);
  });
}
