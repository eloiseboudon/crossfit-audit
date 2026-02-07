import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { useMarketBenchmarks } from '../../hooks/useMarketBenchmarks';
import type { MarketBenchmark } from '../../lib/types';

vi.mock('../../lib/api', () => ({
  listMarketBenchmarks: vi.fn(),
  updateMarketBenchmark: vi.fn()
}));

const api = await import('../../lib/api');

const listMarketBenchmarks = api.listMarketBenchmarks as unknown as ReturnType<typeof vi.fn>;
const updateMarketBenchmark = api.updateMarketBenchmark as unknown as ReturnType<typeof vi.fn>;

describe('useMarketBenchmarks', () => {
  beforeEach(() => {
    listMarketBenchmarks.mockReset();
    updateMarketBenchmark.mockReset();
  });

  it('charge les benchmarks et met à jour le state', async () => {
    const benchmarks = [{ id: '1', benchmark_code: 'CA_AVG', name: 'CA moyen', value: 200 } as MarketBenchmark];
    listMarketBenchmarks.mockResolvedValue(benchmarks);

    const { result } = renderHook(() => useMarketBenchmarks());

    await act(async () => {
      await result.current.loadMarketBenchmarks();
    });

    expect(result.current.benchmarks).toEqual(benchmarks);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('gère une erreur de chargement', async () => {
    listMarketBenchmarks.mockRejectedValue(new Error('Boom'));

    const { result } = renderHook(() => useMarketBenchmarks());

    await act(async () => {
      await result.current.loadMarketBenchmarks();
    });

    expect(result.current.error).toBe('Boom');
    expect(result.current.loading).toBe(false);
  });

  it('met à jour un benchmark existant', async () => {
    const initial = { id: '1', benchmark_code: 'CA_AVG', name: 'CA moyen', value: 200 } as MarketBenchmark;
    const updated = { id: '1', benchmark_code: 'CA_AVG', name: 'CA moyen', value: 250 } as MarketBenchmark;
    listMarketBenchmarks.mockResolvedValue([initial]);
    updateMarketBenchmark.mockResolvedValue(updated);

    const { result } = renderHook(() => useMarketBenchmarks());

    await act(async () => {
      await result.current.loadMarketBenchmarks();
    });

    await act(async () => {
      await result.current.saveMarketBenchmark('1', { value: 250 });
    });

    expect(result.current.benchmarks).toEqual([updated]);
  });

  it('propage l\'erreur lors de la mise à jour', async () => {
    updateMarketBenchmark.mockRejectedValue(new Error('Mise à jour échouée'));

    const { result } = renderHook(() => useMarketBenchmarks());

    await act(async () => {
      await expect(result.current.saveMarketBenchmark('1', { value: 300 })).rejects.toThrow('Mise à jour échouée');
    });

    expect(result.current.error).toBe('Mise à jour échouée');
  });
});
