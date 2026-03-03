import { z } from 'zod';

export const createGoalSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  targetAmount: z.number().positive('Target amount must be positive'),
  deadline: z.string().datetime().optional(),
  categoryId: z.string().uuid().optional(),
});

export const updateGoalSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  targetAmount: z.number().positive().optional(),
  currentAmount: z.number().min(0).optional(),
  deadline: z.string().datetime().optional().nullable(),
  categoryId: z.string().uuid().optional().nullable(),
});
