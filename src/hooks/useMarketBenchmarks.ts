import { useCallback, useState } from 'react';
import { listMarketBenchmarks, updateMarketBenchmark } from '../lib/api';
import { MarketBenchmark } from '../lib/types';

export type UpdateMarketBenchmarkInput = Partial<MarketBenchmark>;

/**
 * Hook personnalisé pour gérer les benchmarks de marché.
 */
export function useMarketBenchmarks() {
  const [benchmarks, setBenchmarks] = useState<MarketBenchmark[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadMarketBenchmarks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listMarketBenchmarks();
      setBenchmarks(data ?? []);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur lors du chargement des benchmarks.';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const saveMarketBenchmark = useCallback(async (benchmarkId: string, data: UpdateMarketBenchmarkInput) => {
    setLoading(true);
    setError(null);
    try {
      const updated = await updateMarketBenchmark(benchmarkId, data);
      setBenchmarks((prev) =>
        prev.map((benchmark) => (benchmark.id === benchmarkId ? updated : benchmark)),
      );
      return updated;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur lors de la mise à jour du benchmark.';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { benchmarks, loading, error, loadMarketBenchmarks, saveMarketBenchmark };
}
