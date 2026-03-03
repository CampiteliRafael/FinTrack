import { z } from 'zod';
import { strongPasswordSchema } from '../../shared/validators/password.validator';

export const registerSchema = z.object({
  email: z.string().email('Email inválido'),
  password: strongPasswordSchema,
  name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres').max(100),
});

export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Senha obrigatória'),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string(),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Email inválido'),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token obrigatório'),
  newPassword: strongPasswordSchema,
});
