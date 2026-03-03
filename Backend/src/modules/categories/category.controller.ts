import { Request, Response } from 'express';
import { CategoryService } from './category.service';
import { asyncHandler } from '../../shared/utils/asyncHandler';

export class CategoryController {
  constructor(private categoryService: CategoryService) {}

  getAll = asyncHandler(async (req: Request, res: Response) => {
    const categories = await this.categoryService.getAll(req.user!.userId);
    res.json(categories);
  });

  getById = asyncHandler(async (req: Request, res: Response) => {
    const category = await this.categoryService.getById(req.params.id as string, req.user!.userId);
    res.json(category);
  });

  create = asyncHandler(async (req: Request, res: Response) => {
    const category = await this.categoryService.create(req.user!.userId, req.body);
    res.status(201).json(category);
  });

  update = asyncHandler(async (req: Request, res: Response) => {
    const category = await this.categoryService.update(req.params.id as string, req.user!.userId, req.body);
    res.json(category);
  });

  delete = asyncHandler(async (req: Request, res: Response) => {
    await this.categoryService.delete(req.params.id as string, req.user!.userId);
    res.status(204).send();
  });
}
