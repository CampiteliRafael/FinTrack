import { Router } from 'express';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserRepository } from '../users/user.repository';
import { RefreshTokenRepository } from './refresh-token.repository';
import { validate } from '../../shared/middlewares/validation.middleware';
import {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from './auth.schemas';

const router = Router();

const userRepository = new UserRepository();
const refreshTokenRepository = new RefreshTokenRepository();
const authService = new AuthService(userRepository, refreshTokenRepository);
const authController = new AuthController(authService);

router.post('/register', validate(registerSchema), authController.register);
router.post('/login', validate(loginSchema), authController.login);
router.post('/refresh', validate(refreshTokenSchema), authController.refresh);
router.post('/logout', authController.logout);
router.post('/forgot-password', validate(forgotPasswordSchema), authController.forgotPassword);
router.post('/reset-password', validate(resetPasswordSchema), authController.resetPassword);

export default router;
