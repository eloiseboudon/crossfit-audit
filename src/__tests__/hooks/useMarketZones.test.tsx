import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { useMarketZones } from '../../hooks/useMarketZones';
import type { MarketZone } from '../../lib/types';

vi.mock('../../lib/api', () => ({
  listMarketZones: vi.fn(),
  createMarketZone: vi.fn(),
  updateMarketZone: vi.fn(),
  deleteMarketZone: vi.fn()
}));

const api = await import('../../lib/api');

const listMarketZones = api.listMarketZones as unknown as ReturnType<typeof vi.fn>;
const createMarketZone = api.createMarketZone as unknown as ReturnType<typeof vi.fn>;
const updateMarketZone = api.updateMarketZone as unknown as ReturnType<typeof vi.fn>;
const deleteMarketZone = api.deleteMarketZone as unknown as ReturnType<typeof vi.fn>;

describe('useMarketZones', () => {
  beforeEach(() => {
    listMarketZones.mockReset();
    createMarketZone.mockReset();
    updateMarketZone.mockReset();
    deleteMarketZone.mockReset();
  });

  it('charge les zones et met à jour le state', async () => {
    const zones = [{ id: '1', name: 'Zone A' } as MarketZone];
    listMarketZones.mockResolvedValue(zones);

    const { result } = renderHook(() => useMarketZones());

    await act(async () => {
      await result.current.loadMarketZones();
    });

    expect(result.current.zones).toEqual(zones);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('gère une erreur de chargement', async () => {
    listMarketZones.mockRejectedValue(new Error('Boom'));

    const { result } = renderHook(() => useMarketZones());

    await act(async () => {
      await result.current.loadMarketZones();
    });

    expect(result.current.error).toBe('Boom');
    expect(result.current.loading).toBe(false);
  });

  it('ajoute une zone lors de la création', async () => {
    const created = { id: '2', name: 'Zone B' } as MarketZone;
    createMarketZone.mockResolvedValue(created);

    const { result } = renderHook(() => useMarketZones());

    await act(async () => {
      await result.current.createMarketZone({ name: 'Zone B' });
    });

    expect(result.current.zones).toEqual([created]);
  });

  it('met à jour une zone existante', async () => {
    const initial = { id: '1', name: 'Zone A' } as MarketZone;
    const updated = { id: '1', name: 'Zone A Updated' } as MarketZone;
    createMarketZone.mockResolvedValue(initial);
    updateMarketZone.mockResolvedValue(updated);

    const { result } = renderHook(() => useMarketZones());

    await act(async () => {
      await result.current.createMarketZone({ name: 'Zone A' });
    });

    await act(async () => {
      await result.current.updateMarketZone('1', { name: 'Zone A Updated' });
    });

    expect(result.current.zones).toEqual([updated]);
  });

  it('supprime une zone du state', async () => {
    const initial = { id: '1', name: 'Zone A' } as MarketZone;
    createMarketZone.mockResolvedValue(initial);
    deleteMarketZone.mockResolvedValue(undefined);

    const { result } = renderHook(() => useMarketZones());

    await act(async () => {
      await result.current.createMarketZone({ name: 'Zone A' });
    });

    await act(async () => {
      await result.current.deleteMarketZone('1');
    });

    expect(result.current.zones).toEqual([]);
  });
});
