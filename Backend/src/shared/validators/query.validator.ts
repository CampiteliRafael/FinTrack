import { z } from 'zod';

/**
 * Schema para validação de UUID em params
 */
export const uuidParamSchema = z.object({
  id: z
    .string({ message: 'ID é obrigatório' })
    .uuid('ID deve ser um UUID válido'),
});

/**
 * Schema para validação de paginação
 */
export const paginationSchema = z.object({
  page: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val) : 1))
    .pipe(z.number().int().min(1, 'Página deve ser no mínimo 1')),
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val) : 20))
    .pipe(z.number().int().min(1).max(100, 'Limite deve ser entre 1 e 100')),
});

/**
 * Schema para validação de filtros de data
 */
export const dateRangeSchema = z.object({
  startDate: z
    .string()
    .optional()
    .refine(
      (val) => !val || !isNaN(Date.parse(val)),
      'startDate deve ser uma data válida (ISO 8601)'
    )
    .transform((val) => (val ? new Date(val) : undefined)),
  endDate: z
    .string()
    .optional()
    .refine(
      (val) => !val || !isNaN(Date.parse(val)),
      'endDate deve ser uma data válida (ISO 8601)'
    )
    .transform((val) => (val ? new Date(val) : undefined)),
});

/**
 * Schema para validação de tipo de transação
 */
export const transactionTypeSchema = z.object({
  type: z.enum(['income', 'expense']).optional(),
});

/**
 * Schema para validação de filtros de transação
 */
export const transactionFiltersSchema = paginationSchema
  .merge(dateRangeSchema)
  .merge(transactionTypeSchema)
  .extend({
    accountId: z.string().uuid('accountId deve ser um UUID válido').optional(),
    categoryId: z.string().uuid('categoryId deve ser um UUID válido').optional(),
  });

/**
 * Schema para validação de filtros de metas
 */
export const goalFiltersSchema = paginationSchema.extend({
  status: z.enum(['active', 'completed', 'cancelled']).optional(),
});

/**
 * Schema para validação de filtros de parcelamentos
 */
export const installmentFiltersSchema = paginationSchema.extend({
  status: z.enum(['pending', 'paid', 'overdue']).optional(),
});
