import { Router } from 'express';
import { AccountRepositoryImpl } from '../../infrastructure/database/repositories/AccountRepositoryImpl';
import { AccountService } from './account.service';
import { AccountController } from './account.controller';
import { authenticate } from '../../shared/middlewares/auth.middleware';
import { validate, validateParams } from '../../shared/middlewares/validation.middleware';
import { createAccountSchema, updateAccountSchema } from './account.schemas';
import { uuidParamSchema } from '../../shared/validators/query.validator';

const router = Router();

const accountRepository = new AccountRepositoryImpl();
const accountService = new AccountService(accountRepository);
const accountController = new AccountController(accountService);

router.use(authenticate);

router.get('/', accountController.getAll);
router.post('/', validate(createAccountSchema), accountController.create);
router.get('/:id', validateParams(uuidParamSchema), accountController.getById);
router.patch('/:id', validateParams(uuidParamSchema), validate(updateAccountSchema), accountController.update);
router.delete('/:id', validateParams(uuidParamSchema), accountController.delete);

export default router;
