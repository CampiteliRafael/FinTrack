import { Request, Response } from 'express';
import { AccountService } from './account.service';
import { asyncHandler } from '../../shared/utils/asyncHandler';

export class AccountController {
  constructor(private accountService: AccountService) {}

  getAll = asyncHandler(async (req: Request, res: Response) => {
    const accounts = await this.accountService.getAll(req.user!.userId);
    res.json(accounts);
  });

  getById = asyncHandler(async (req: Request, res: Response) => {
    const account = await this.accountService.getById(req.params.id as string, req.user!.userId);
    res.json(account);
  });

  create = asyncHandler(async (req: Request, res: Response) => {
    const account = await this.accountService.create(req.user!.userId, req.body);
    res.status(201).json(account);
  });

  update = asyncHandler(async (req: Request, res: Response) => {
    const account = await this.accountService.update(req.params.id as string, req.user!.userId, req.body);
    res.json(account);
  });

  delete = asyncHandler(async (req: Request, res: Response) => {
    await this.accountService.delete(req.params.id as string, req.user!.userId);
    res.status(204).send();
  });
}
