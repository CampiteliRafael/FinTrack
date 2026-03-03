/**
 * Base class for all application errors
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode: number = 500, code: string = 'INTERNAL_ERROR') {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true; // Erros operacionais são esperados

    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * 400 - Bad Request
 * Erro de validação ou dados inválidos
 */
export class ValidationError extends AppError {
  public readonly fields?: Record<string, string>;

  constructor(message: string, fields?: Record<string, string>) {
    super(message, 400, 'VALIDATION_ERROR');
    this.fields = fields;
  }
}

/**
 * 401 - Unauthorized
 * Falha na autenticação
 */
export class UnauthorizedError extends AppError {
  constructor(message: string = 'Não autorizado') {
    super(message, 401, 'UNAUTHORIZED');
  }
}

/**
 * 403 - Forbidden
 * Sem permissão para acessar recurso
 */
export class ForbiddenError extends AppError {
  constructor(message: string = 'Acesso negado') {
    super(message, 403, 'FORBIDDEN');
  }
}

/**
 * 404 - Not Found
 * Recurso não encontrado
 */
export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(`${resource} não encontrado`, 404, 'NOT_FOUND');
  }
}

/**
 * 409 - Conflict
 * Conflito com estado atual (ex: email já existe)
 */
export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409, 'CONFLICT');
  }
}

/**
 * 429 - Too Many Requests
 * Rate limit excedido
 */
export class TooManyRequestsError extends AppError {
  constructor(message: string = 'Muitas requisições. Tente novamente mais tarde.') {
    super(message, 429, 'TOO_MANY_REQUESTS');
  }
}

/**
 * 500 - Internal Server Error
 * Erro interno inesperado
 */
export class InternalServerError extends AppError {
  constructor(message: string = 'Erro interno do servidor') {
    super(message, 500, 'INTERNAL_ERROR');
  }
}
