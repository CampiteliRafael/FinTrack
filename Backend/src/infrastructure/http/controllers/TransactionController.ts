import { Request, Response } from 'express';
import { CreateTransactionUseCase } from '../../../application/use-cases/CreateTransactionUseCase';
import { GetTransactionsUseCase } from '../../../application/use-cases/GetTransactionsUseCase';
import { UpdateTransactionUseCase } from '../../../application/use-cases/UpdateTransactionUseCase';
import { DeleteTransactionUseCase } from '../../../application/use-cases/DeleteTransactionUseCase';
import { CreateTransactionDTO } from '../../../application/dtos/CreateTransactionDTO';
import { UpdateTransactionDTO } from '../../../application/dtos/UpdateTransactionDTO';

export class TransactionController {
  constructor(
    private createTransactionUseCase: CreateTransactionUseCase,
    private getTransactionsUseCase: GetTransactionsUseCase,
    private updateTransactionUseCase: UpdateTransactionUseCase,
    private deleteTransactionUseCase: DeleteTransactionUseCase
  ) {}

  getAll = async (req: Request, res: Response) => {
    try {
      const filters = {
        type: req.query.type as any,
        accountId: req.query.accountId as string,
        categoryId: req.query.categoryId as string,
        startDate: req.query.startDate ? new Date(req.query.startDate as string) : undefined,
        endDate: req.query.endDate ? new Date(req.query.endDate as string) : undefined,
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 20,
      };

      const result = await this.getTransactionsUseCase.execute(req.user!.userId, filters);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  create = async (req: Request, res: Response) => {
    try {
      const dto = new CreateTransactionDTO(
        req.body.type,
        req.body.amount,
        req.body.description,
        new Date(req.body.date),
        req.body.accountId,
        req.body.categoryId
      );

      const transaction = await this.createTransactionUseCase.execute(req.user!.userId, dto);
      res.status(201).json(transaction);
    } catch (error: any) {
      if (
        error.message === 'Account not found' ||
        error.message === 'Category not found' ||
        error.message === 'Transaction type must match category type'
      ) {
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  update = async (req: Request, res: Response) => {
    try {
      const dto = new UpdateTransactionDTO(
        req.body.type,
        req.body.amount,
        req.body.description,
        req.body.date ? new Date(req.body.date) : undefined,
        req.body.accountId,
        req.body.categoryId
      );

      const transaction = await this.updateTransactionUseCase.execute(
        req.params.id,
        req.user!.userId,
        dto
      );
      res.json(transaction);
    } catch (error: any) {
      if (
        error.message === 'Transaction not found' ||
        error.message === 'Account not found' ||
        error.message === 'Category not found' ||
        error.message === 'Transaction type must match category type'
      ) {
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  delete = async (req: Request, res: Response) => {
    try {
      await this.deleteTransactionUseCase.execute(req.params.id, req.user!.userId);
      res.status(204).send();
    } catch (error: any) {
      if (error.message === 'Transaction not found') {
        return res.status(404).json({ error: error.message });
      }
      res.status(500).json({ error: 'Internal server error' });
    }
  };
}
