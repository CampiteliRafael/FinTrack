import { Request, Response } from 'express';
import { TransactionService } from './transaction.service';
import { TransactionFilters } from './transaction.types';
import { asyncHandler } from '../../shared/utils/asyncHandler';

export class TransactionController {
  constructor(private transactionService: TransactionService) {}

  getAll = asyncHandler(async (req: Request, res: Response) => {
    // Query validada pelo middleware - converter strings para tipos corretos
    const filters: TransactionFilters = {
      type: req.query.type as 'income' | 'expense' | undefined,
      accountId: req.query.accountId as string | undefined,
      categoryId: req.query.categoryId as string | undefined,
      startDate: req.query.startDate ? new Date(req.query.startDate as string) : undefined,
      endDate: req.query.endDate ? new Date(req.query.endDate as string) : undefined,
      page: req.query.page ? Number(req.query.page) : 1,
      limit: req.query.limit ? Number(req.query.limit) : 20,
    };

    const result = await this.transactionService.getAll(req.user!.userId, filters);
    res.json(result);
  });

  getById = asyncHandler(async (req: Request, res: Response) => {
    const transaction = await this.transactionService.getById(String(req.params.id), req.user!.userId);
    res.json(transaction);
  });

  create = asyncHandler(async (req: Request, res: Response) => {
    const transaction = await this.transactionService.create(req.user!.userId, req.body);
    res.status(201).json(transaction);
  });

  update = asyncHandler(async (req: Request, res: Response) => {
    const transaction = await this.transactionService.update(
      String(req.params.id),
      req.user!.userId,
      req.body
    );
    res.json(transaction);
  });

  delete = asyncHandler(async (req: Request, res: Response) => {
    await this.transactionService.delete(String(req.params.id), req.user!.userId);
    res.status(204).send();
  });
}
