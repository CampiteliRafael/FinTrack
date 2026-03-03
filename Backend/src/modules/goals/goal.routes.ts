import { Router } from 'express';
import { GoalController } from './goal.controller';
import { GoalService } from './goal.service';
import { GoalRepository } from './goal.repository';
import { CategoryRepository } from '../categories/category.repository';
import { authenticate } from '../../shared/middlewares/auth.middleware';
import { validate, validateQuery, validateParams } from '../../shared/middlewares/validation.middleware';
import { createGoalSchema, updateGoalSchema } from './goal.schemas';
import { goalFiltersSchema, uuidParamSchema } from '../../shared/validators/query.validator';

const router = Router();

const goalRepository = new GoalRepository();
const categoryRepository = new CategoryRepository();
const goalService = new GoalService(goalRepository, categoryRepository);
const goalController = new GoalController(goalService);

router.use(authenticate);

router.get('/', validateQuery(goalFiltersSchema), goalController.getAll);
router.get('/:id', validateParams(uuidParamSchema), goalController.getById);
router.post('/', validate(createGoalSchema), goalController.create);
router.patch('/:id', validateParams(uuidParamSchema), validate(updateGoalSchema), goalController.update);
router.delete('/:id', validateParams(uuidParamSchema), goalController.delete);
router.post('/:id/progress', validateParams(uuidParamSchema), goalController.addProgress);

export default router;
