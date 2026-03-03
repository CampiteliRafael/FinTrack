import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { AppError, ValidationError } from '../errors/AppError';
import { logError } from '../../config/logger';
import { env } from '../../config/env';

/**
 * Global error handler middleware
 * Processa todos os erros da aplicação e retorna respostas apropriadas
 */
export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  // AppError (erros customizados da aplicação)
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: err.message,
      code: err.code,
      ...(err instanceof ValidationError && err.fields && { fields: err.fields }),
    });
  }

  // Zod validation errors
  if (err instanceof ZodError) {
    const fields: Record<string, string> = {};
    err.issues.forEach((error: any) => {
      const field = error.path.join('.');
      fields[field] = error.message;
    });

    return res.status(422).json({
      error: 'Erro de validação',
      code: 'VALIDATION_ERROR',
      fields,
    });
  }

  // Prisma errors
  if (err.name === 'PrismaClientKnownRequestError') {
    const prismaError = err as any;

    // Unique constraint violation
    if (prismaError.code === 'P2002') {
      const field = prismaError.meta?.target?.[0] || 'field';
      return res.status(409).json({
        error: `${field} já está em uso`,
        code: 'CONFLICT',
      });
    }

    // Record not found
    if (prismaError.code === 'P2025') {
      return res.status(404).json({
        error: 'Recurso não encontrado',
        code: 'NOT_FOUND',
      });
    }

    // Foreign key constraint violation
    if (prismaError.code === 'P2003') {
      return res.status(400).json({
        error: 'Operação inválida: registro relacionado não existe',
        code: 'INVALID_OPERATION',
      });
    }
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      error: 'Token inválido',
      code: 'INVALID_TOKEN',
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      error: 'Token expirado',
      code: 'TOKEN_EXPIRED',
    });
  }

  // Log erro desconhecido
  logError('Unhandled error', err, {
    method: req.method,
    path: req.path,
    body: req.body,
    query: req.query,
    ip: req.ip,
  });

  // Retornar erro genérico (não expor detalhes em produção)
  return res.status(500).json({
    error: 'Erro interno do servidor',
    code: 'INTERNAL_ERROR',
    ...(env.NODE_ENV === 'development' && {
      message: err.message,
      stack: err.stack,
    }),
  });
};
