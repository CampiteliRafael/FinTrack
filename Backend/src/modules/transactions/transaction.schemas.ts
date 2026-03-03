import { z } from 'zod';

export const createTransactionSchema = z.object({
  type: z.enum(['income', 'expense']),
  amount: z.number().positive(),
  description: z.string().max(500).optional(),
  date: z.coerce.date(),
  accountId: z.string().uuid(),
  categoryId: z.string().uuid(),
});

export const updateTransactionSchema = z.object({
  type: z.enum(['income', 'expense']).optional(),
  amount: z.number().positive().optional(),
  description: z.string().max(500).optional(),
  date: z.coerce.date().optional(),
  accountId: z.string().uuid().optional(),
  categoryId: z.string().uuid().optional(),
});

export const transactionFiltersSchema = z.object({
  type: z.enum(['income', 'expense']).optional(),
  accountId: z.string().uuid().optional(),
  categoryId: z.string().uuid().optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});
