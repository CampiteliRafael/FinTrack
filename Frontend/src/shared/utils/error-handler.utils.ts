import { UseFormSetError, FieldValues, Path } from 'react-hook-form';

/**
 * Interface para erro do backend
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
 * Estratégia de tratamento de erros:
 *
 * 1. Erros de campos específicos → Mostrar INLINE nos campos (via react-hook-form)
 * 2. Erros gerais/autenticação/rede → Mostrar em TOAST
 *
 * NÃO mostrar banners vermelhos acima dos forms (duplicação)
 */

/**
 * Processa erro e decide onde exibir
 *
 * @param error - Erro capturado
 * @param setError - Função setError do react-hook-form
 * @param showToast - Função para mostrar toast de erro
 * @returns void
 */
export function handleFormError<T extends FieldValues>(
  error: any,
  setError: UseFormSetError<T>,
  showToast: (message: string) => void
): void {
  const backendError: BackendError = error.response?.data;

  // Tenta processar erros de campo
  const hasFieldErrors = processFieldErrors(backendError, setError);

  // Se não há erros de campo OU se é um erro geral além dos campos
  if (!hasFieldErrors || backendError?.error) {
    const message = getErrorMessage(error);
    showToast(message);
  }
}

/**
 * Processa erros de campo do backend
 * @returns true se processou algum erro de campo
 */
function processFieldErrors<T extends FieldValues>(
  backendError: BackendError | undefined,
  setError: UseFormSetError<T>
): boolean {
  if (!backendError) {
    return false;
  }

  let hasFieldErrors = false;

  // Formato 1: { fields: { email: "Email inválido" } }
  if (backendError.fields && typeof backendError.fields === 'object') {
    Object.entries(backendError.fields).forEach(([field, message]) => {
      setError(field as Path<T>, {
        type: 'manual',
        message: message as string,
      });
      hasFieldErrors = true;
    });
  }

  // Formato 2: { details: [{ path: ["email"], message: "Email inválido" }] }
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
 * Extrai mensagem de erro do backend
 */
function getErrorMessage(error: any): string {
  // Erro de rede
  if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
    return 'Erro de conexão. Verifique sua internet e tente novamente.';
  }

  // Erro do backend
  if (error.response?.data?.error) {
    return error.response.data.error;
  }

  // Erro de validação genérico
  if (error.response?.status === 400) {
    return 'Dados inválidos. Verifique os campos e tente novamente.';
  }

  // Erro de autenticação
  if (error.response?.status === 401) {
    return 'Credenciais inválidas. Verifique seu email e senha.';
  }

  // Erro de autorização
  if (error.response?.status === 403) {
    return 'Você não tem permissão para realizar esta ação.';
  }

  // Erro não encontrado
  if (error.response?.status === 404) {
    return 'Recurso não encontrado.';
  }

  // Erro do servidor
  if (error.response?.status >= 500) {
    return 'Erro no servidor. Tente novamente mais tarde.';
  }

  // Mensagem genérica do erro
  if (error.message) {
    return error.message;
  }

  return 'Erro ao processar requisição. Tente novamente.';
}

/**
 * Função auxiliar para operações sem formulário
 * Mostra apenas toast
 */
export function handleOperationError(error: any, showToast: (message: string) => void): void {
  const message = getErrorMessage(error);
  showToast(message);
}
