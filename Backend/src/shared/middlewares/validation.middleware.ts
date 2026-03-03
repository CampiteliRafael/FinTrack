import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { logInfo, logError } from '../../config/logger';

/**
 * Middleware para validar request body
 */
export const validate = (schema: z.ZodTypeAny) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      logError('Body validation failed', new Error('Validation error'), {
        path: req.path,
        issues: result.error.issues,
      });
      return res.status(400).json({
        error: 'Validation failed',
        details: result.error.issues,
      });
    }

    logInfo('Body validation successful', { path: req.path });
    req.body = result.data;
    next();
  };
};

/**
 * Middleware para validar query parameters
 * Nota: req.query é read-only no Express, então validamos mas não substituímos
 */
export const validateQuery = (schema: z.ZodTypeAny) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.query);

    if (!result.success) {
      logError('Query validation failed', new Error('Validation error'), {
        path: req.path,
        query: req.query,
        issues: result.error.issues,
      });
      return res.status(400).json({
        error: 'Query validation failed',
        details: result.error.issues,
      });
    }

    logInfo('Query validation successful', { path: req.path });
    // ✅ Não podemos atribuir a req.query (é read-only), mas a validação já garante que está correto
    next();
  };
};

/**
 * Middleware para validar route params
 */
export const validateParams = (schema: z.ZodTypeAny) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.params);

    if (!result.success) {
      logError('Params validation failed', new Error('Validation error'), {
        path: req.path,
        params: req.params,
        issues: result.error.issues,
      });
      return res.status(400).json({
        error: 'Params validation failed',
        details: result.error.issues,
      });
    }

    logInfo('Params validation successful', { path: req.path });
    req.params = result.data as any;
    next();
  };
};
