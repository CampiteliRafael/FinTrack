import { Request, Response } from 'express';
import { InstallmentService } from './installment.service';
import { asyncHandler } from '../../shared/utils/asyncHandler';

export class InstallmentController {
  constructor(private installmentService: InstallmentService) {}

  getAll = asyncHandler(async (req: Request, res: Response) => {
    const filters = {
      accountId: req.query.accountId as string | undefined,
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

    const result = await this.installmentService.getInstallments(req.user!.userId, filters);
    res.json(result);
  });

  getById = asyncHandler(async (req: Request, res: Response) => {
    const installment = await this.installmentService.getInstallmentById(
      req.params.id as string,
      req.user!.userId
    );
    res.json(installment);
  });

  create = asyncHandler(async (req: Request, res: Response) => {
    const installment = await this.installmentService.createInstallment(
      req.user!.userId,
      req.body
    );
    res.status(201).json(installment);
  });

  update = asyncHandler(async (req: Request, res: Response) => {
    const installment = await this.installmentService.updateInstallment(
      req.params.id as string,
      req.user!.userId,
      req.body
    );
    res.json(installment);
  });

  delete = asyncHandler(async (req: Request, res: Response) => {
    await this.installmentService.deleteInstallment(req.params.id as string, req.user!.userId);
    res.status(204).send();
  });

  payInstallment = asyncHandler(async (req: Request, res: Response) => {
    const installment = await this.installmentService.payInstallment(
      req.params.id as string,
      req.user!.userId
    );
    res.json(installment);
  });
}
