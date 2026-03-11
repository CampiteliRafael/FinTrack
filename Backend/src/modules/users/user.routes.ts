import { Router } from 'express';
import { UserController } from './user.controller';
import { UserRepositoryImpl } from '../../infrastructure/database/repositories/UserRepositoryImpl';
import { authenticate } from '../../shared/middlewares/auth.middleware';
import { validate } from '../../shared/middlewares/validation.middleware';
import { z } from 'zod';
import { strongPasswordSchema } from '../../shared/validators/password.validator';

const router = Router();

const userRepository = new UserRepositoryImpl();
const userController = new UserController(userRepository);

// Validation schemas
const updateProfileSchema = z.object({
  name: z.string().min(1, 'Nome obrigatório').optional(),
  email: z.string().email('Email inválido').optional(),
});

const updatePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Senha atual obrigatória'),
  newPassword: strongPasswordSchema,
});

// Routes
router.get('/me', authenticate, userController.getMe);
router.patch('/me', authenticate, validate(updateProfileSchema), userController.updateMe);
router.patch('/me/password', authenticate, validate(updatePasswordSchema), userController.updatePassword);

export default router;
