import { Router } from 'express';
import { GoalController } from './goal.controller';
import { GoalService } from './goal.service';
import { GoalRepositoryImpl } from '../../infrastructure/database/repositories/GoalRepositoryImpl';
import { CategoryRepositoryImpl } from '../../infrastructure/database/repositories/CategoryRepositoryImpl';
import { authenticate } from '../../shared/middlewares/auth.middleware';
import { validate, validateQuery, validateParams } from '../../shared/middlewares/validation.middleware';
import { createGoalSchema, updateGoalSchema } from './goal.schemas';
import { goalFiltersSchema, uuidParamSchema } from '../../shared/validators/query.validator';

const router = Router();

const goalRepository = new GoalRepositoryImpl();
const categoryRepository = new CategoryRepositoryImpl();
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
