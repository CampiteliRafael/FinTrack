import { z } from 'zod';

export const createAccountSchema = z.object({
  name: z.string().min(1).max(100),
  initialBalance: z.number().default(0),
  type: z.enum(['checking', 'savings', 'cash']),
});

export const updateAccountSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  type: z.enum(['checking', 'savings', 'cash']).optional(),
  currentBalance: z.number().optional(),
});
