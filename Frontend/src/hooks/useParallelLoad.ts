import { useEffect, useState, useCallback } from 'react';

/**
 * Hook customizado para carregar múltiplos recursos em paralelo
 * e gerenciar o estado de loading de forma otimizada
 */
export function useParallelLoad(loaders: (() => Promise<void>)[]) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      await Promise.all(loaders.map((loader) => loader()));
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [loaders]);

  useEffect(() => {
    load();
  }, [load]);

  return { loading, error, reload: load };
}
