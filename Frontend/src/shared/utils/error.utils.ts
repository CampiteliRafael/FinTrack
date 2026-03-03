import { UseFormSetError, FieldValues, Path } from 'react-hook-form';

/**
 * Interface para erro do backend com campos
 */
interface BackendError {
  error?: string;
  code?: string;
  fields?: Record<string, string>;
  details?: Array<{
    path: (string | number)[];
    message: string;
  }>;
}

/**
 * Extrai mensagem de erro genérica do backend
 */
export function getErrorMessage(error: any, defaultMessage: string = 'Erro ao processar requisição'): string {
  if (error.response?.data?.error) {
    return error.response.data.error;
  }
  if (error.message) {
    return error.message;
  }
  return defaultMessage;
}

/**
 * Processa erros de campo do backend e aplica no formulário
 * Suporta dois formatos de erro:
 * 1. { fields: { email: "Email inválido", password: "Senha fraca" } }
 * 2. { details: [{ path: ["email"], message: "Email inválido" }] }
 *
 * @returns true se processou algum erro de campo, false caso contrário
 */
export function handleFieldErrors<T extends FieldValues>(
  error: any,
  setError: UseFormSetError<T>
): boolean {
  const backendError: BackendError = error.response?.data;

  if (!backendError) {
    return false;
  }

  let hasFieldErrors = false;

  // Formato 1: { fields: { campo: "mensagem" } }
  if (backendError.fields && typeof backendError.fields === 'object') {
    Object.entries(backendError.fields).forEach(([field, message]) => {
      setError(field as Path<T>, {
        type: 'manual',
        message: message as string,
      });
      hasFieldErrors = true;
    });
  }

  // Formato 2: { details: [{ path: ["campo"], message: "mensagem" }] }
  if (backendError.details && Array.isArray(backendError.details)) {
    backendError.details.forEach((detail) => {
      if (detail.path && detail.path.length > 0) {
        const fieldName = detail.path[0] as string;
        setError(fieldName as Path<T>, {
          type: 'manual',
          message: detail.message,
        });
        hasFieldErrors = true;
      }
    });
  }

  return hasFieldErrors;
}

/**
 * Verifica se o erro é de um campo específico
 */
export function isFieldError(error: any, fieldName: string): boolean {
  const backendError: BackendError = error.response?.data;

  if (!backendError) {
    return false;
  }

  // Verifica em fields
  if (backendError.fields?.[fieldName]) {
    return true;
  }

  // Verifica em details
  if (backendError.details) {
    return backendError.details.some(
      (detail) => detail.path && detail.path[0] === fieldName
    );
  }

  return false;
}

/**
 * Obtém a mensagem de erro de um campo específico
 */
export function getFieldErrorMessage(error: any, fieldName: string): string | null {
  const backendError: BackendError = error.response?.data;

  if (!backendError) {
    return null;
  }

  // Verifica em fields
  if (backendError.fields?.[fieldName]) {
    return backendError.fields[fieldName];
  }

  // Verifica em details
  if (backendError.details) {
    const detail = backendError.details.find(
      (d) => d.path && d.path[0] === fieldName
    );
    if (detail) {
      return detail.message;
    }
  }

  return null;
}
