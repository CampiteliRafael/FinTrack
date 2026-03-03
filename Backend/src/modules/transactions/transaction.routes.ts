import { Router } from 'express';
import { TransactionRepository } from './transaction.repository';
import { TransactionService } from './transaction.service';
import { TransactionController } from './transaction.controller';
import { AccountRepository } from '../accounts/account.repository';
import { CategoryRepository } from '../categories/category.repository';
import { authenticate } from '../../shared/middlewares/auth.middleware';
import { validate, validateQuery, validateParams } from '../../shared/middlewares/validation.middleware';
import { createTransactionSchema, updateTransactionSchema } from './transaction.schemas';
import { transactionFiltersSchema, uuidParamSchema } from '../../shared/validators/query.validator';

const router = Router();

const transactionRepository = new TransactionRepository();
const accountRepository = new AccountRepository();
const categoryRepository = new CategoryRepository();
const transactionService = new TransactionService(
  transactionRepository,
  accountRepository,
  categoryRepository
);
const transactionController = new TransactionController(transactionService);

router.use(authenticate);

router.get('/', validateQuery(transactionFiltersSchema), transactionController.getAll);
router.post('/', validate(createTransactionSchema), transactionController.create);
router.get('/:id', validateParams(uuidParamSchema), transactionController.getById);
router.patch('/:id', validateParams(uuidParamSchema), validate(updateTransactionSchema), transactionController.update);
router.delete('/:id', validateParams(uuidParamSchema), transactionController.delete);

export default router;
