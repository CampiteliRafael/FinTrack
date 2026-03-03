import { z } from 'zod';

export const createInstallmentSchema = z.object({
  description: z.string().min(1, 'Description is required').max(200),
  totalAmount: z.number().positive('Total amount must be positive'),
  installments: z.number().int().min(2, 'Must have at least 2 installments').max(120),
  accountId: z.string().uuid('Invalid account ID'),
  categoryId: z.string().uuid('Invalid category ID'),
  startDate: z.string().datetime(),
});

export const updateInstallmentSchema = z.object({
  description: z.string().min(1).max(200).optional(),
  currentInstallment: z.number().int().min(0).optional(),
  accountId: z.string().uuid('Invalid account ID').optional(),
  categoryId: z.string().uuid('Invalid category ID').optional(),
});
