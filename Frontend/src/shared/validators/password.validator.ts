import { z } from 'zod';

/**
 * Schema de validação de senha forte
 * Requisitos:
 * - Mínimo 8 caracteres
 * - Pelo menos uma letra maiúscula (A-Z)
 * - Pelo menos uma letra minúscula (a-z)
 * - Pelo menos um número (0-9)
 * - Pelo menos um caractere especial (!@#$%^&*(),.?":{}|<>)
 */
export const strongPasswordSchema = z
  .string()
  .min(8, 'A senha deve ter no mínimo 8 caracteres')
  .regex(/[A-Z]/, 'A senha deve conter pelo menos uma letra maiúscula')
  .regex(/[a-z]/, 'A senha deve conter pelo menos uma letra minúscula')
  .regex(/[0-9]/, 'A senha deve conter pelo menos um número')
  .regex(
    /[!@#$%^&*(),.?":{}|<>]/,
    'A senha deve conter pelo menos um caractere especial (!@#$%^&*(),.?":{}|<>)'
  );

/**
 * Interface para requisitos de senha
 */
export interface PasswordRequirement {
  label: string;
  test: (password: string) => boolean;
}

/**
 * Lista de requisitos de senha
 */
export const passwordRequirements: PasswordRequirement[] = [
  {
    label: 'Mínimo de 8 caracteres',
    test: (password) => password.length >= 8,
  },
  {
    label: 'Pelo menos uma letra maiúscula (A-Z)',
    test: (password) => /[A-Z]/.test(password),
  },
  {
    label: 'Pelo menos uma letra minúscula (a-z)',
    test: (password) => /[a-z]/.test(password),
  },
  {
    label: 'Pelo menos um número (0-9)',
    test: (password) => /[0-9]/.test(password),
  },
  {
    label: 'Pelo menos um caractere especial (!@#$%^&*)',
    test: (password) => /[!@#$%^&*(),.?":{}|<>]/.test(password),
  },
];

/**
 * Interface para resultado de força da senha
 */
export interface PasswordStrength {
  score: number; // 0-5 (número de requisitos atendidos)
  label: string; // 'Muito Fraca' | 'Fraca' | 'Média' | 'Forte' | 'Muito Forte'
  color: string; // Classe Tailwind de cor
  percentage: number; // 0-100
}

/**
 * Calcula a força da senha baseado nos requisitos atendidos
 */
export function getPasswordStrength(password: string): PasswordStrength {
  if (!password) {
    return {
      score: 0,
      label: 'Muito Fraca',
      color: 'bg-gray-300',
      percentage: 0,
    };
  }

  const score = passwordRequirements.filter((req) => req.test(password)).length;
  const percentage = (score / passwordRequirements.length) * 100;

  if (score === 5) {
    return {
      score,
      label: 'Muito Forte',
      color: 'bg-green-600',
      percentage,
    };
  } else if (score === 4) {
    return {
      score,
      label: 'Forte',
      color: 'bg-green-500',
      percentage,
    };
  } else if (score === 3) {
    return {
      score,
      label: 'Média',
      color: 'bg-yellow-500',
      percentage,
    };
  } else if (score === 2) {
    return {
      score,
      label: 'Fraca',
      color: 'bg-orange-500',
      percentage,
    };
  } else {
    return {
      score,
      label: 'Muito Fraca',
      color: 'bg-red-500',
      percentage,
    };
  }
}

/**
 * Valida se a senha atende todos os requisitos
 */
export function isPasswordValid(password: string): boolean {
  return passwordRequirements.every((req) => req.test(password));
}
