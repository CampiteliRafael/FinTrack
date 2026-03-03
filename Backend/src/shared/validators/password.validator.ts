import { z } from 'zod';

/**
 * Schema de validação para senha forte
 * Requisitos:
 * - Mínimo de 8 caracteres
 * - Pelo menos uma letra maiúscula
 * - Pelo menos uma letra minúscula
 * - Pelo menos um número
 * - Pelo menos um caractere especial
 */
export const strongPasswordSchema = z
  .string()
  .min(8, 'A senha deve ter no mínimo 8 caracteres')
  .regex(/[A-Z]/, 'A senha deve conter pelo menos uma letra maiúscula')
  .regex(/[a-z]/, 'A senha deve conter pelo menos uma letra minúscula')
  .regex(/[0-9]/, 'A senha deve conter pelo menos um número')
  .regex(
    /[^A-Za-z0-9]/,
    'A senha deve conter pelo menos um caractere especial (!@#$%^&*(),.?":{}|<>)'
  );

/**
 * Valida se uma senha atende aos requisitos de segurança
 * @param password Senha a ser validada
 * @returns Objeto com resultado da validação e mensagens de erro
 */
export function validatePassword(password: string): {
  isValid: boolean;
  errors: string[];
} {
  const result = strongPasswordSchema.safeParse(password);

  if (result.success) {
    return { isValid: true, errors: [] };
  }

  return {
    isValid: false,
    errors: result.error.errors.map((err) => err.message),
  };
}

/**
 * Verifica requisitos individuais da senha (para feedback visual)
 */
export function getPasswordStrength(password: string) {
  return {
    minLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecialChar: /[^A-Za-z0-9]/.test(password),
  };
}
