import { Router } from 'express';
import { InstallmentController } from './installment.controller';
import { InstallmentService } from './installment.service';
import { InstallmentRepository } from './installment.repository';
import { AccountRepository } from '../accounts/account.repository';
import { CategoryRepository } from '../categories/category.repository';
import { authenticate } from '../../shared/middlewares/auth.middleware';
import { validate, validateQuery, validateParams } from '../../shared/middlewares/validation.middleware';
import { createInstallmentSchema, updateInstallmentSchema } from './installment.schemas';
import { installmentFiltersSchema, uuidParamSchema } from '../../shared/validators/query.validator';

const router = Router();

const installmentRepository = new InstallmentRepository();
const accountRepository = new AccountRepository();
const categoryRepository = new CategoryRepository();
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
