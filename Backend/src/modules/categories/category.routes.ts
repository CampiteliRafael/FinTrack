import { Router } from 'express';
import { CategoryRepository } from './category.repository';
import { CategoryService } from './category.service';
import { CategoryController } from './category.controller';
import { authenticate } from '../../shared/middlewares/auth.middleware';
import { validate, validateParams } from '../../shared/middlewares/validation.middleware';
import { createCategorySchema, updateCategorySchema } from './category.schemas';
import { uuidParamSchema } from '../../shared/validators/query.validator';

const router = Router();

const categoryRepository = new CategoryRepository();
const categoryService = new CategoryService(categoryRepository);
const categoryController = new CategoryController(categoryService);

router.use(authenticate);

router.get('/', categoryController.getAll);
router.post('/', validate(createCategorySchema), categoryController.create);
router.get('/:id', validateParams(uuidParamSchema), categoryController.getById);
router.patch('/:id', validateParams(uuidParamSchema), validate(updateCategorySchema), categoryController.update);
router.delete('/:id', validateParams(uuidParamSchema), categoryController.delete);

export default router;
