import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { useCompetitors } from '../../hooks/useCompetitors';
import type { Competitor } from '../../lib/types';

vi.mock('../../lib/api', () => ({
  listCompetitors: vi.fn(),
  createCompetitor: vi.fn(),
  updateCompetitor: vi.fn(),
  deleteCompetitor: vi.fn()
}));

const api = await import('../../lib/api');

const listCompetitors = api.listCompetitors as unknown as ReturnType<typeof vi.fn>;
const createCompetitor = api.createCompetitor as unknown as ReturnType<typeof vi.fn>;
const updateCompetitor = api.updateCompetitor as unknown as ReturnType<typeof vi.fn>;
const deleteCompetitor = api.deleteCompetitor as unknown as ReturnType<typeof vi.fn>;

describe('useCompetitors', () => {
  beforeEach(() => {
    listCompetitors.mockReset();
    createCompetitor.mockReset();
    updateCompetitor.mockReset();
    deleteCompetitor.mockReset();
  });

  it('charge les concurrents et met à jour le state', async () => {
    const competitors = [{ id: '1', gym_id: 'g1', name: 'Concurrent A' } as Competitor];
    listCompetitors.mockResolvedValue(competitors);

    const { result } = renderHook(() => useCompetitors());

    await act(async () => {
      await result.current.loadCompetitors('g1');
    });

    expect(result.current.competitors).toEqual(competitors);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('gère une erreur de chargement', async () => {
    listCompetitors.mockRejectedValue(new Error('Boom'));

    const { result } = renderHook(() => useCompetitors());

    await act(async () => {
      await result.current.loadCompetitors('g1');
    });

    expect(result.current.error).toBe('Boom');
    expect(result.current.loading).toBe(false);
  });

  it('ajoute un concurrent lors de la création', async () => {
    const created = { id: '2', gym_id: 'g1', name: 'Concurrent B' } as Competitor;
    createCompetitor.mockResolvedValue(created);

    const { result } = renderHook(() => useCompetitors());

    await act(async () => {
      await result.current.createCompetitor({ gym_id: 'g1', name: 'Concurrent B' });
    });

    expect(result.current.competitors).toEqual([created]);
  });

  it('met à jour un concurrent existant', async () => {
    const initial = { id: '1', gym_id: 'g1', name: 'Concurrent A' } as Competitor;
    const updated = { id: '1', gym_id: 'g1', name: 'Concurrent A Updated' } as Competitor;
    createCompetitor.mockResolvedValue(initial);
    updateCompetitor.mockResolvedValue(updated);

    const { result } = renderHook(() => useCompetitors());

    await act(async () => {
      await result.current.createCompetitor({ gym_id: 'g1', name: 'Concurrent A' });
    });

    await act(async () => {
      await result.current.updateCompetitor('1', { name: 'Concurrent A Updated' });
    });

    expect(result.current.competitors).toEqual([updated]);
  });

  it('supprime un concurrent du state', async () => {
    const initial = { id: '1', gym_id: 'g1', name: 'Concurrent A' } as Competitor;
    createCompetitor.mockResolvedValue(initial);
    deleteCompetitor.mockResolvedValue(undefined);

    const { result } = renderHook(() => useCompetitors());

    await act(async () => {
      await result.current.createCompetitor({ gym_id: 'g1', name: 'Concurrent A' });
    });

    await act(async () => {
      await result.current.deleteCompetitor('1');
    });

    expect(result.current.competitors).toEqual([]);
  });
});
