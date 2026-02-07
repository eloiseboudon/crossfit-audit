import { listMarketBenchmarks, updateMarketBenchmark } from '../lib/api';
import { MarketBenchmark } from '../lib/types';
import { useEntityCRUD } from './useEntityCRUD';

export type UpdateMarketBenchmarkInput = Partial<MarketBenchmark>;

/**
 * Hook personnalisé pour gérer les benchmarks de marché.
 */
export function useMarketBenchmarks() {
  const { items: benchmarks, loading, error, load, update } = useEntityCRUD<MarketBenchmark>({
    entityName: 'benchmarks',
    listFn: listMarketBenchmarks,
    updateFn: updateMarketBenchmark,
  });

  return {
    benchmarks,
    loading,
    error,
    loadMarketBenchmarks: load,
    saveMarketBenchmark: update,
  };
}
