import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

export function isColdStartError(error: unknown): boolean {
  if (typeof error === 'object' && error !== null && ('code' in error || 'message' in error)) {
    const err = error as { code?: string; message?: string };

    if (err.code === 'ECONNABORTED' || err.code === 'ERR_NETWORK') {
      return true;
    }

    if (err.message?.includes('timeout')) {
      return true;
    }

    if (err.message?.includes('Network Error')) {
      return true;
    }
  }

  return false;
}

export async function waitForServerWakeUp(
  maxAttempts: number = 24,
  intervalMs: number = 5000,
  onProgress?: (attempt: number, maxAttempts: number) => void
): Promise<boolean> {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      await axios.get(`${API_URL}/health`, {
        timeout: 8000,
      });

      return true;
    } catch {
      if (onProgress) {
        onProgress(attempt, maxAttempts);
      }

      if (attempt < maxAttempts) {
        await sleep(intervalMs);
      }
    }
  }

  return false;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function requestWithColdStartRetry<T>(
  requestFn: () => Promise<T>,
  onWakeUpStart?: () => void,
  onWakeUpProgress?: (attempt: number, max: number) => void
): Promise<T> {
  try {
    return await requestFn();
  } catch (error: unknown) {
    if (!isColdStartError(error)) {
      throw error;
    }

    if (onWakeUpStart) {
      onWakeUpStart();
    }

    const isAwake = await waitForServerWakeUp(24, 5000, onWakeUpProgress);

    if (!isAwake) {
      throw new Error('Servidor não está respondendo. Tente novamente mais tarde.');
    }

    try {
      return await requestFn();
    } catch (retryError: unknown) {
      if (isColdStartError(retryError)) {
        await sleep(5000);
        return await requestFn();
      }
      throw retryError;
    }
  }
}
