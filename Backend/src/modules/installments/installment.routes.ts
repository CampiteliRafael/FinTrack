import { Router } from 'express';
import { InstallmentController } from './installment.controller';
import { InstallmentService } from './installment.service';
import { InstallmentRepositoryImpl } from '../../infrastructure/database/repositories/InstallmentRepositoryImpl';
import { AccountRepositoryImpl } from '../../infrastructure/database/repositories/AccountRepositoryImpl';
import { CategoryRepositoryImpl } from '../../infrastructure/database/repositories/CategoryRepositoryImpl';
import { authenticate } from '../../shared/middlewares/auth.middleware';
import { validate, validateQuery, validateParams } from '../../shared/middlewares/validation.middleware';
import { createInstallmentSchema, updateInstallmentSchema } from './installment.schemas';
import { installmentFiltersSchema, uuidParamSchema } from '../../shared/validators/query.validator';

const router = Router();

const installmentRepository = new InstallmentRepositoryImpl();
const accountRepository = new AccountRepositoryImpl();
const categoryRepository = new CategoryRepositoryImpl();
const installmentService = new InstallmentService(
  installmentRepository,
  accountRepository,
  categoryRepository
);
const installmentController = new InstallmentController(installmentService);

router.use(authenticate);

router.get('/', validateQuery(installmentFiltersSchema), installmentController.getAll);
router.get('/:id', validateParams(uuidParamSchema), installmentController.getById);
router.post('/', validate(createInstallmentSchema), installmentController.create);
router.patch('/:id', validateParams(uuidParamSchema), validate(updateInstallmentSchema), installmentController.update);
router.delete('/:id', validateParams(uuidParamSchema), installmentController.delete);
router.post('/:id/pay', validateParams(uuidParamSchema), installmentController.payInstallment);

export default router;
