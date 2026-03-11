import { ICategoryRepository } from '../../core/interfaces/ICategoryRepository';
import { CreateCategoryDTO, UpdateCategoryDTO } from './category.types';
import { NotFoundError } from '../../shared/errors/AppError';

export class CategoryService {
  constructor(private categoryRepository: ICategoryRepository) {}

  async getAll(userId: string) {
    return this.categoryRepository.findAll(userId);
  }

  async getById(id: string, userId: string) {
    const category = await this.categoryRepository.findById(id, userId);
    if (!category) {
      throw new NotFoundError('Categoria não encontrada');
    }
    return category;
  }

  async create(userId: string, data: CreateCategoryDTO) {
    return this.categoryRepository.create({
      userId,
      name: data.name,
      color: data.color,
      icon: data.icon,
    });
  }

  async update(id: string, userId: string, data: UpdateCategoryDTO) {
    await this.getById(id, userId);
    return this.categoryRepository.update(id, data);
  }

  async delete(id: string, userId: string) {
    await this.getById(id, userId);
    await this.categoryRepository.softDelete(id);
  }
}
