import { Router } from 'express';
import { TransactionRepositoryImpl } from '../../infrastructure/database/repositories/TransactionRepositoryImpl';
import { TransactionService } from './transaction.service';
import { TransactionController } from './transaction.controller';
import { AccountRepositoryImpl } from '../../infrastructure/database/repositories/AccountRepositoryImpl';
import { CategoryRepositoryImpl } from '../../infrastructure/database/repositories/CategoryRepositoryImpl';
import { authenticate } from '../../shared/middlewares/auth.middleware';
import { validate, validateQuery, validateParams } from '../../shared/middlewares/validation.middleware';
import { createTransactionSchema, updateTransactionSchema } from './transaction.schemas';
import { transactionFiltersSchema, uuidParamSchema } from '../../shared/validators/query.validator';

const router = Router();

const transactionRepository = new TransactionRepositoryImpl();
const accountRepository = new AccountRepositoryImpl();
const categoryRepository = new CategoryRepositoryImpl();
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
